import { useState, useCallback, useEffect } from 'react';
import {
  type PlayerState, type Difficulty, type StatKey, type QuestType, type QuestCategory,
  type MainQuest,
  createQuest, getDailyQuests, getWeeklyQuests, getDefaultState, getRank, getXpToNext,
  maybeGenerateRandomEvent, createSystemMessage,
  getUnlockedRoles, ALL_ROLES,
} from '@/lib/game-system';
import {
  type DailyCheckIn, type DailyStore,
  loadDaily, saveDaily, upsertCheckIn, computeDailyEngine, applyDecay, todayStr,
} from '@/lib/daily-system';
import {
  getOrCreateUserId, fetchFullState, createQuestInDB, completeQuestInDB,
  deleteQuestInDB, setActiveRoleInDB, updateNameInDB, updatePlayerStatsInDB, saveCheckinInDB
} from '@/lib/supabase-sync';
import { supabase } from '@/integrations/supabase/client';
import StatusPanel from '@/components/StatusPanel';
import QuestList from '@/components/QuestList';
import AddQuestModal from '@/components/AddQuestModal';
import LevelUpOverlay from '@/components/LevelUpOverlay';
import Dashboard from '@/components/Dashboard';
import RolesTab from '@/components/RolesTab';
import DailyCheckInTab from '@/components/DailyCheckInTab';
import HomeTab from '@/components/HomeTab';
import SystemMessages from '@/components/SystemMessages';
import BottomNav, { type Tab } from '@/components/BottomNav';
import { Plus, RefreshCw } from 'lucide-react';

export default function Index() {
  const [userId, setUserId] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerState>(getDefaultState());
  const [daily, setDaily] = useState<DailyStore>(loadDaily);
  const [tab, setTab] = useState<Tab>('home');
  const [questSubTab, setQuestSubTab] = useState<'active' | 'daily' | 'weekly'>('active');
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [levelUpShow, setLevelUpShow] = useState(false);
  const [syncing, setSyncing] = useState(true);

  const updateDaily = useCallback((updater: (prev: DailyStore) => DailyStore) => {
    setDaily((prev) => {
      const next = updater(prev);
      saveDaily(next);
      return next;
    });
  }, []);

  // Sync initialization on mount
  useEffect(() => {
    async function initSync() {
      setSyncing(true);
      try {
        const id = await getOrCreateUserId();
        setUserId(id);
        const data = await fetchFullState(id);
        if (data) {
          setPlayer(data.player);
          setDaily({ history: data.checkins });
        }
      } catch (err) {
        console.error('Failed initialization:', err);
      } finally {
        setSyncing(false);
      }
    }
    initSync();
  }, []);

  // Subscribe to real-time updates for syncing across devices
  useEffect(() => {
    if (!userId) return;

    const userChannel = supabase
      .channel('realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
        async () => {
          const fresh = await fetchFullState(userId);
          if (fresh) setPlayer(fresh.player);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_stats', filter: `user_id=eq.${userId}` },
        async () => {
          const fresh = await fetchFullState(userId);
          if (fresh) setPlayer(fresh.player);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quests', filter: `user_id=eq.${userId}` },
        async () => {
          const fresh = await fetchFullState(userId);
          if (fresh) setPlayer(fresh.player);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, [userId]);

  // Decay check once daily
  useEffect(() => {
    const today = todayStr();
    if (daily.lastDecayDate === today) return;
    const { stats: decayedStats, messages: decayMsgs } = applyDecay(player.stats, daily.history, null);
    if (decayMsgs.length > 0) {
      setPlayer((prev) => {
        const updated = {
          ...prev,
          stats: decayedStats,
          systemMessages: [...prev.systemMessages, ...decayMsgs],
        };
        if (userId) {
          updatePlayerStatsInDB(userId, decayedStats);
        }
        return updated;
      });
    }
    updateDaily((prev) => ({ ...prev, lastDecayDate: today }));
  }, [player.stats, daily.history, daily.lastDecayDate, userId, updateDaily]);

  const handleCompleteQuest = async (id: string) => {
    const quest = player.quests.find((q) => q.id === id);
    if (!quest || quest.completed) return;

    // Calculate level ups and points
    let xp = player.xp + quest.xpReward;
    let level = player.level;
    let xpToNext = player.xpToNext;
    let coins = player.coins + quest.coinReward;

    while (xp >= xpToNext) {
      xp -= xpToNext;
      level++;
      xpToNext = getXpToNext(level);
      setLevelUpShow(true);
    }

    // Allocate quest stat rewards
    const newStats = { ...player.stats };
    for (const [key, val] of Object.entries(quest.statRewards || {})) {
      if (val) {
        newStats[key as StatKey] = (newStats[key as StatKey] || 0) + val;
      }
    }

    // Trigger local update for instant feedback
    setPlayer((prev) => ({
      ...prev,
      xp,
      level,
      xpToNext,
      coins,
      stats: newStats,
      quests: prev.quests.map((q) => (q.id === id ? { ...q, completed: true } : q)),
      totalQuestsCompleted: prev.totalQuestsCompleted + 1,
    }));

    // Persist to Supabase
    if (userId) {
      await completeQuestInDB(
        userId,
        id,
        { level, xp, coins },
        quest.statRewards
      );
    }
  };

  const handleSetActiveRole = async (roleId: string) => {
    setPlayer((prev) => ({ ...prev, activeRole: roleId }));
    if (userId) {
      await setActiveRoleInDB(userId, roleId);
    }
  };

  const handleAddQuest = async (
    title: string,
    difficulty: Difficulty,
    questType: QuestType,
    statRewards: Partial<Record<StatKey, number>>,
    category: QuestCategory | undefined,
  ) => {
    const newQuest = createQuest(title, difficulty, questType, statRewards, category);
    setPlayer((prev) => ({
      ...prev,
      quests: [...prev.quests, newQuest],
    }));

    if (userId) {
      await createQuestInDB(userId, newQuest);
    }
  };

  const handleDeleteQuest = async (id: string) => {
    setPlayer((prev) => ({
      ...prev,
      quests: prev.quests.filter((q) => q.id !== id),
    }));

    if (userId) {
      await deleteQuestInDB(id);
    }
  };

  const handleAllocateStat = async (stat: StatKey) => {
    // Standard stat leveling logic, increment stat directly
    const updatedStats = {
      ...player.stats,
      [stat]: (player.stats[stat] || 0) + 1
    };

    setPlayer((prev) => ({
      ...prev,
      stats: updatedStats
    }));

    if (userId) {
      await updatePlayerStatsInDB(userId, updatedStats);
    }
  };

  const handleLoadDailies = () => {
    const hasDailies = player.quests.some((q) => q.questType === 'daily' && !q.completed);
    if (hasDailies) return;

    const freshDailies = getDailyQuests();
    setPlayer((prev) => ({
      ...prev,
      quests: [...prev.quests, ...freshDailies]
    }));

    if (userId) {
      freshDailies.forEach(async (q) => {
        await createQuestInDB(userId, q);
      });
    }
  };

  const handleLoadWeeklies = () => {
    const hasWeeklies = player.quests.some((q) => q.questType === 'weekly' && !q.completed);
    if (hasWeeklies) return;

    const freshWeeklies = getWeeklyQuests();
    setPlayer((prev) => ({
      ...prev,
      quests: [...prev.quests, ...freshWeeklies]
    }));

    if (userId) {
      freshWeeklies.forEach(async (q) => {
        await createQuestInDB(userId, q);
      });
    }
  };

  const handleDismissMessage = (id: string) => {
    setPlayer((prev) => ({
      ...prev,
      systemMessages: prev.systemMessages.map(m => m.id === id ? { ...m, read: true } : m),
    }));
  };

  const handleReset = async () => {
    if (!userId) return;
    setSyncing(true);
    try {
      // Clear Supabase Quests
      const { error: delError } = await supabase.from('quests').delete().eq('user_id', userId);
      if (delError) throw delError;

      // Reset User metrics
      await supabase.from('users').update({
        level: 1,
        xp: 0,
        coins: 0,
        active_role: 'initiate'
      }).eq('id', userId);

      // Reset Stats
      const defaultSt = getDefaultStats();
      await updatePlayerStatsInDB(userId, defaultSt);

      const data = await fetchFullState(userId);
      if (data) {
        setPlayer(data.player);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleNameChange = async (name: string) => {
    setPlayer((prev) => ({ ...prev, name }));
    if (userId) {
      await updateNameInDB(userId, name);
    }
  };

  const handleSaveCheckIn = async (c: DailyCheckIn) => {
    updateDaily((prev) => upsertCheckIn(prev, c));
    const result = computeDailyEngine(c);

    if (userId) {
      await saveCheckinInDB(userId, c, result.hp);
    }

    if (result.messages.length > 0) {
      setPlayer((prev) => ({
        ...prev,
        systemMessages: [...prev.systemMessages, ...result.messages],
      }));
    }
  };

  const handleAcceptRecoveryQuest = async (title: string, reward: Partial<Record<StatKey, number>>) => {
    const recoveryQuest = createQuest(title, 'easy', 'custom', reward);
    setPlayer((prev) => ({
      ...prev,
      quests: [...prev.quests, recoveryQuest],
      systemMessages: [...prev.systemMessages, createSystemMessage(`🛡 Recovery quest accepted: ${title}`, 'info')],
    }));

    if (userId) {
      await createQuestInDB(userId, recoveryQuest);
    }
  };

  const activeQuests = player.quests.filter((q) => q.questType !== 'daily' && q.questType !== 'weekly');
  const dailyQuests = player.quests.filter((q) => q.questType === 'daily');
  const weeklyQuests = player.quests.filter((q) => q.questType === 'weekly');

  if (syncing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <RefreshCw size={28} className="animate-spin text-white/50 mb-3" />
        <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-white/40">Synchronizing System...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${tab === 'home' ? 'bg-black' : 'bg-black text-white'}`}>
      <div className="max-w-md mx-auto px-4 pt-6">
        {tab !== 'home' && (
          <>
            <StatusPanel player={player} />
            <div className="mt-4">
              <SystemMessages messages={player.systemMessages} onDismiss={handleDismissMessage} />
            </div>
          </>
        )}

        <div className={tab === 'home' ? '' : 'mt-3'}>
          {tab === 'home' && (
            <HomeTab
              player={player}
              onCompleteQuest={handleCompleteQuest}
              onOpenTab={(t) => setTab(t)}
            />
          )}

          {tab === 'quests' && (
            <div className="space-y-4">
              {/* Segmented control for Quests */}
              <div className="flex border border-[#2A2A2A] rounded-full p-1 bg-[#111111] max-w-sm mx-auto">
                {(['active', 'daily', 'weekly'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setQuestSubTab(t)}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all ${
                      questSubTab === t
                        ? 'bg-white text-black'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {questSubTab === 'active' && (
                <>
                  <QuestList
                    quests={activeQuests}
                    onComplete={handleCompleteQuest}
                    onDelete={handleDeleteQuest}
                    title="Active Quests"
                    emptyText="No active custom quests. Add one below!"
                  />
                  <button
                    onClick={() => setShowAddQuest(true)}
                    className="w-full mt-4 py-4 rounded-[24px] border border-dashed border-[#2A2A2A] text-white/50 text-[13px] flex items-center justify-center gap-2 hover:border-white/20 hover:text-white transition-colors bg-[#111111]/30"
                  >
                    <Plus size={15} />
                    New Custom Quest
                  </button>
                </>
              )}

              {questSubTab === 'daily' && (
                <>
                  {dailyQuests.length === 0 && (
                    <button
                      onClick={handleLoadDailies}
                      className="w-full py-4 rounded-[24px] bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 active:scale-[0.99] transition-all"
                    >
                      Accept Daily Quests
                    </button>
                  )}
                  <QuestList
                    quests={dailyQuests}
                    onComplete={handleCompleteQuest}
                    onDelete={handleDeleteQuest}
                    title="Daily Quests"
                    emptyText="Accept your daily quests above!"
                  />
                </>
              )}

              {questSubTab === 'weekly' && (
                <>
                  {weeklyQuests.length === 0 && (
                    <button
                      onClick={handleLoadWeeklies}
                      className="w-full py-4 rounded-[24px] border border-[#2A2A2A] bg-[#111111] text-white font-bold text-xs uppercase tracking-widest hover:border-white/30 active:scale-[0.99] transition-all"
                    >
                      Accept Weekly Quests
                    </button>
                  )}
                  <QuestList
                    quests={weeklyQuests}
                    onComplete={handleCompleteQuest}
                    onDelete={handleDeleteQuest}
                    title="Weekly Quests"
                    emptyText="Accept your weekly quests above!"
                  />
                </>
              )}
            </div>
          )}

          {tab === 'checkin' && (
            <DailyCheckInTab
              store={daily}
              onSave={handleSaveCheckIn}
              onAcceptRecoveryQuest={handleAcceptRecoveryQuest}
            />
          )}

          {tab === 'roles' && (
            <RolesTab
              stats={player.stats}
              activeRole={player.activeRole}
              onSetActive={handleSetActiveRole}
            />
          )}

          {tab === 'dashboard' && (
            <Dashboard
              player={player}
              onAllocate={handleAllocateStat}
              onNameChange={handleNameChange}
              onReset={handleReset}
            />
          )}
        </div>
      </div>

      <BottomNav active={tab} onChange={setTab} />
      <AddQuestModal open={showAddQuest} onClose={() => setShowAddQuest(false)} onAdd={handleAddQuest} />
      <LevelUpOverlay level={player.level} show={levelUpShow} onDone={() => setLevelUpShow(false)} />
    </div>
  );
}
