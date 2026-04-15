import { useState, useCallback } from 'react';
import {
  type PlayerState, type Difficulty, type StatKey,
  createQuest, getDailyQuests, getDefaultState, getRank, getXpToNext,
  loadState, saveState,
} from '@/lib/game-system';
import StatusPanel from '@/components/StatusPanel';
import QuestList from '@/components/QuestList';
import AddQuestModal from '@/components/AddQuestModal';
import StatAllocation from '@/components/StatAllocation';
import LevelUpOverlay from '@/components/LevelUpOverlay';
import ProfileTab from '@/components/ProfileTab';
import BottomNav, { type Tab } from '@/components/BottomNav';
import { Plus } from 'lucide-react';

export default function Index() {
  const [player, setPlayer] = useState<PlayerState>(loadState);
  const [tab, setTab] = useState<Tab>('quests');
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [levelUpShow, setLevelUpShow] = useState(false);

  const update = useCallback((updater: (prev: PlayerState) => PlayerState) => {
    setPlayer((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const handleCompleteQuest = (id: string) => {
    update((prev) => {
      const quest = prev.quests.find((q) => q.id === id);
      if (!quest || quest.completed) return prev;

      let xp = prev.xp + quest.xpReward;
      let level = prev.level;
      let xpToNext = prev.xpToNext;
      let statPoints = prev.statPoints;

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
        rank: getRank(level),
        quests: prev.quests.map((q) => (q.id === id ? { ...q, completed: true } : q)),
        totalQuestsCompleted: prev.totalQuestsCompleted + 1,
        dailyQuestsCompleted: quest.isDaily ? prev.dailyQuestsCompleted + 1 : prev.dailyQuestsCompleted,
      };
    });
  };

  const handleAddQuest = (title: string, difficulty: Difficulty) => {
    update((prev) => ({
      ...prev,
      quests: [...prev.quests, createQuest(title, difficulty)],
    }));
  };

  const handleDeleteQuest = (id: string) => {
    update((prev) => ({
      ...prev,
      quests: prev.quests.filter((q) => q.id !== id),
    }));
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
      const hasDailies = prev.quests.some((q) => q.isDaily && !q.completed);
      if (hasDailies) return prev;
      return { ...prev, quests: [...prev.quests, ...getDailyQuests()] };
    });
  };

  const handleReset = () => {
    const fresh = getDefaultState();
    saveState(fresh);
    setPlayer(fresh);
  };

  const handleNameChange = (name: string) => {
    update((prev) => ({ ...prev, name }));
  };

  const activeQuests = player.quests.filter((q) => !q.isDaily);
  const dailyQuests = player.quests.filter((q) => q.isDaily);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <StatusPanel player={player} />

        <div className="mt-5">
          {tab === 'quests' && (
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
            </>
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
