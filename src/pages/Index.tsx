import { useState, useCallback, useEffect } from 'react';
import {
  type PlayerState, type Difficulty, type StatKey, type QuestType, type QuestCategory,
  type MainQuest,
  createQuest, getDailyQuests, getWeeklyQuests, getDefaultState, getRank, getXpToNext,
  loadState, saveState, maybeGenerateRandomEvent, createSystemMessage,
  getUnlockedRoles, ALL_ROLES,
} from '@/lib/game-system';
import {
  type DailyCheckIn, type DailyStore,
  loadDaily, saveDaily, upsertCheckIn, computeDailyEngine, applyDecay, todayStr,
} from '@/lib/daily-system';
import StatusPanel from '@/components/StatusPanel';
import QuestList from '@/components/QuestList';
import AddQuestModal from '@/components/AddQuestModal';
import StatAllocation from '@/components/StatAllocation';
import LevelUpOverlay from '@/components/LevelUpOverlay';
import ProfileTab from '@/components/ProfileTab';
import Dashboard from '@/components/Dashboard';
import RolesTab from '@/components/RolesTab';
import MainQuestsTab from '@/components/MainQuestsTab';
import DailyCheckInTab from '@/components/DailyCheckInTab';
import HomeTab from '@/components/HomeTab';
import SystemMessages from '@/components/SystemMessages';
import BottomNav, { type Tab } from '@/components/BottomNav';
import { Plus } from 'lucide-react';

export default function Index() {
  const [player, setPlayer] = useState<PlayerState>(loadState);
  const [daily, setDaily] = useState<DailyStore>(loadDaily);
  const [tab, setTab] = useState<Tab>('home');
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [levelUpShow, setLevelUpShow] = useState(false);

  const update = useCallback((updater: (prev: PlayerState) => PlayerState) => {
    setPlayer((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const updateDaily = useCallback((updater: (prev: DailyStore) => DailyStore) => {
    setDaily((prev) => {
      const next = updater(prev);
      saveDaily(next);
      return next;
    });
  }, []);

  // Decay check on mount (once per day)
  useEffect(() => {
    const today = todayStr();
    if (daily.lastDecayDate === today) return;
    const { stats: decayedStats, messages: decayMsgs } = applyDecay(player.stats, daily.history, null);
    if (decayMsgs.length > 0) {
      update((prev) => ({
        ...prev,
        stats: decayedStats,
        systemMessages: [...prev.systemMessages, ...decayMsgs],
      }));
    }
    updateDaily((prev) => ({ ...prev, lastDecayDate: today }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCompleteQuest = (id: string) => {
    update((prev) => {
      const quest = prev.quests.find((q) => q.id === id);
      if (!quest || quest.completed) return prev;

      let xp = prev.xp + quest.xpReward;
      let level = prev.level;
      let xpToNext = prev.xpToNext;
      let statPoints = prev.statPoints;
      let coins = prev.coins + quest.coinReward;

      while (xp >= xpToNext) {
        xp -= xpToNext;
        level++;
        xpToNext = getXpToNext(level);
        statPoints += 3;
        setLevelUpShow(true);
      }

      // Apply stat rewards from quest
      const newStats = { ...prev.stats };
      for (const [key, val] of Object.entries(quest.statRewards || {})) {
        if (val) newStats[key as StatKey] = (newStats[key as StatKey] || 0) + val;
      }

      // Random event
      const messages = [...prev.systemMessages];
      const event = maybeGenerateRandomEvent();
      if (event) {
        messages.push(event);
        // Apply random stat boosts from events
        if (event.text.includes('+2 LUK')) newStats.luk += 2;
        if (event.text.includes('+1 INT')) newStats.int += 1;
      }

      // Streak: update if completing first quest today
      let streak = prev.streak;
      let bestStreak = prev.bestStreak;
      const today = new Date().toISOString().slice(0, 10);
      if (prev.lastActiveDate !== today || prev.totalQuestsCompleted === 0) {
        streak = prev.streak + 1;
        bestStreak = Math.max(bestStreak, streak);
        // Consistency bonus
        if (streak > 0 && streak % 7 === 0) {
          newStats.cons += 1;
          messages.push(createSystemMessage(`🔥 ${streak}-day streak! +1 Consistency`, 'reward'));
        }
      }

      // Detect newly-unlocked roles
      const prevUnlocked = new Set(prev.unlockedRoles || []);
      const nowUnlocked = getUnlockedRoles(newStats).map((r) => r.id);
      const newlyUnlocked = nowUnlocked.filter((rid) => !prevUnlocked.has(rid));
      for (const rid of newlyUnlocked) {
        const role = ALL_ROLES.find((r) => r.id === rid);
        if (role) {
          messages.push(createSystemMessage(
            `🏅 New Identity Unlocked: ${role.name}${role.tier === 'rare' ? ' [S-RANK]' : ''}`,
            'reward',
          ));
        }
      }

      return {
        ...prev,
        xp,
        level,
        xpToNext,
        statPoints,
        coins,
        streak,
        bestStreak,
        lastActiveDate: today,
        stats: newStats,
        rank: getRank(level),
        quests: prev.quests.map((q) => (q.id === id ? { ...q, completed: true } : q)),
        totalQuestsCompleted: prev.totalQuestsCompleted + 1,
        dailyQuestsCompleted: quest.questType === 'daily' ? prev.dailyQuestsCompleted + 1 : prev.dailyQuestsCompleted,
        weeklyQuestsCompleted: quest.questType === 'weekly' ? (prev.weeklyQuestsCompleted || 0) + 1 : (prev.weeklyQuestsCompleted || 0),
        systemMessages: messages,
        unlockedRoles: nowUnlocked,
      };
    });
  };

  const handleSetActiveRole = (roleId: string) => {
    update((prev) => ({ ...prev, activeRole: roleId }));
  };

  const handleAddQuest = (
    title: string,
    difficulty: Difficulty,
    questType: QuestType,
    statRewards: Partial<Record<StatKey, number>>,
    category: QuestCategory | undefined,
  ) => {
    update((prev) => ({
      ...prev,
      quests: [...prev.quests, createQuest(title, difficulty, questType, statRewards, category)],
    }));
  };

  const handleDeleteQuest = (id: string) => {
    update((prev) => ({
      ...prev,
      quests: prev.quests.filter((q) => q.id !== id),
    }));
  };

  // ── Main Quest handlers ──
  const handleCreateMainQuest = (mq: MainQuest) => {
    update((prev) => ({
      ...prev,
      mainQuests: [mq, ...(prev.mainQuests || [])],
      systemMessages: [
        ...prev.systemMessages,
        createSystemMessage(`👑 New Main Quest: ${mq.title}`, 'event'),
      ],
    }));
  };

  const handleDeleteMainQuest = (id: string) => {
    update((prev) => ({
      ...prev,
      mainQuests: (prev.mainQuests || []).filter((m) => m.id !== id),
    }));
  };

  const handleToggleSubquest = (mqId: string, subId: string) => {
    update((prev) => {
      const mqList = prev.mainQuests || [];
      const mq = mqList.find((m) => m.id === mqId);
      if (!mq) return prev;
      const sub = mq.subquests.find((s) => s.id === subId);
      if (!sub) return prev;

      const wasDone = sub.done;
      const updatedSubs = mq.subquests.map((s) => (s.id === subId ? { ...s, done: !s.done } : s));
      const allDone = updatedSubs.every((s) => s.done);
      const wasAllDone = mq.subquests.every((s) => s.done);

      // XP per sub toggle (only on completion, not on un-toggle)
      let xp = prev.xp;
      let level = prev.level;
      let xpToNext = prev.xpToNext;
      let statPoints = prev.statPoints;
      const newStats = { ...prev.stats };
      const messages = [...prev.systemMessages];

      if (!wasDone) {
        xp += 10;
        newStats.dis = (newStats.dis || 0) + 1;
      }

      // Final bonus on completing the whole arc
      if (allDone && !wasAllDone) {
        xp += mq.xpReward;
        messages.push(
          createSystemMessage(`🏆 Main Quest complete: ${mq.title} (+${mq.xpReward} XP)`, 'reward'),
        );
      }

      while (xp >= xpToNext) {
        xp -= xpToNext;
        level++;
        xpToNext = getXpToNext(level);
        statPoints += 3;
        setLevelUpShow(true);
      }

      return {
        ...prev,
        xp,
        level,
        xpToNext,
        statPoints,
        stats: newStats,
        rank: getRank(level),
        systemMessages: messages,
        mainQuests: mqList.map((m) =>
          m.id === mqId ? { ...m, subquests: updatedSubs, completed: allDone } : m,
        ),
      };
    });
  };

  const handleAllocateStat = (stat: StatKey) => {
    update((prev) => {
      if (prev.statPoints <= 0) return prev;
      return {
        ...prev,
        statPoints: prev.statPoints - 1,
        stats: { ...prev.stats, [stat]: prev.stats[stat] + 1 },
      };
    });
  };

  const handleLoadDailies = () => {
    update((prev) => {
      const hasDailies = prev.quests.some((q) => q.questType === 'daily' && !q.completed);
      if (hasDailies) return prev;
      return { ...prev, quests: [...prev.quests, ...getDailyQuests()] };
    });
  };

  const handleLoadWeeklies = () => {
    update((prev) => {
      const hasWeeklies = prev.quests.some((q) => q.questType === 'weekly' && !q.completed);
      if (hasWeeklies) return prev;
      return { ...prev, quests: [...prev.quests, ...getWeeklyQuests()] };
    });
  };

  const handleDismissMessage = (id: string) => {
    update((prev) => ({
      ...prev,
      systemMessages: prev.systemMessages.map(m => m.id === id ? { ...m, read: true } : m),
    }));
  };

  const handleReset = () => {
    const fresh = getDefaultState();
    saveState(fresh);
    setPlayer(fresh);
  };

  const handleNameChange = (name: string) => {
    update((prev) => ({ ...prev, name }));
  };

  const handleSaveCheckIn = (c: DailyCheckIn) => {
    const wasFirstToday = !daily.history.some(h => h.date === c.date);
    updateDaily((prev) => upsertCheckIn(prev, c));
    const result = computeDailyEngine(c);
    if (wasFirstToday && result.messages.length > 0) {
      update((prev) => ({
        ...prev,
        systemMessages: [...prev.systemMessages, ...result.messages],
      }));
    }
  };

  const handleAcceptRecoveryQuest = (title: string, reward: Partial<Record<StatKey, number>>) => {
    update((prev) => ({
      ...prev,
      quests: [...prev.quests, createQuest(title, 'easy', 'custom', reward)],
      systemMessages: [...prev.systemMessages, createSystemMessage(`🛡 Recovery quest accepted: ${title}`, 'info')],
    }));
  };

  const activeQuests = player.quests.filter((q) => q.questType !== 'daily' && q.questType !== 'weekly');
  const dailyQuests = player.quests.filter((q) => q.questType === 'daily');
  const weeklyQuests = player.quests.filter((q) => q.questType === 'weekly');

  return (
    <div className={`min-h-screen pb-20 ${tab === 'home' ? 'bg-black' : 'bg-background'}`}>
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
            <>
              <QuestList
                quests={activeQuests}
                onComplete={handleCompleteQuest}
                onDelete={handleDeleteQuest}
                title="Active Quests"
                emptyText="No quests yet. Accept a new quest!"
              />
            <>
              <QuestList
                quests={activeQuests}
                onComplete={handleCompleteQuest}
                onDelete={handleDeleteQuest}
                title="Active Quests"
                emptyText="No quests yet. Accept a new quest!"
              />
              <button
                onClick={() => setShowAddQuest(true)}
                className="w-full mt-3 py-3 rounded-lg border border-dashed border-border text-muted-foreground text-sm flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors"
              >
                <Plus size={16} />
                New Quest
              </button>
            </>
          )}

          {tab === 'mains' && (
            <MainQuestsTab
              mainQuests={player.mainQuests || []}
              onCreate={handleCreateMainQuest}
              onToggleSub={handleToggleSubquest}
              onDelete={handleDeleteMainQuest}
            />
          )}



          {tab === 'daily' && (
            <>
              {dailyQuests.length === 0 && (
                <button
                  onClick={handleLoadDailies}
                  className="w-full mb-3 py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider font-bold glow-primary"
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

              {/* Weekly section */}
              <div className="mt-6">
                {weeklyQuests.length === 0 && (
                  <button
                    onClick={handleLoadWeeklies}
                    className="w-full mb-3 py-3 rounded-lg bg-accent text-accent-foreground font-display text-sm uppercase tracking-wider font-bold glow-accent"
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
              </div>
            </>
          )}

          {tab === 'checkin' && (
            <DailyCheckInTab
              store={daily}
              onSave={handleSaveCheckIn}
              onAcceptRecoveryQuest={handleAcceptRecoveryQuest}
            />
          )}

          {tab === 'dashboard' && <Dashboard player={player} />}

          {tab === 'roles' && (
            <RolesTab
              stats={player.stats}
              activeRole={player.activeRole}
              onSetActive={handleSetActiveRole}
            />
          )}

          {tab === 'stats' && (
            <StatAllocation
              stats={player.stats}
              statPoints={player.statPoints}
              onAllocate={handleAllocateStat}
            />
          )}

          {tab === 'profile' && (
            <ProfileTab
              player={player}
              onReset={handleReset}
              onNameChange={handleNameChange}
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
