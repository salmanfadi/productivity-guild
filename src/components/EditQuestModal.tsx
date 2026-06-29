import { useEffect, useState } from 'react';
import {
  ALL_STATS,
  type Difficulty,
  type Quest,
  type QuestType,
  type StatKey,
  getCoinReward,
  getXpReward,
} from '@/lib/game-system';
import { Minus, Plus, Save, X } from 'lucide-react';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'boss'];
const QUEST_TYPES: QuestType[] = ['custom', 'daily', 'weekly', 'main'];

interface EditQuestModalProps {
  quest: Quest | null;
  onClose: () => void;
  onSave: (quest: Quest) => void;
}

export default function EditQuestModal({ quest, onClose, onSave }: EditQuestModalProps) {
  const [draft, setDraft] = useState<Quest | null>(quest);

  useEffect(() => {
    setDraft(quest);
  }, [quest]);

  if (!quest || !draft) return null;

  const setDifficulty = (difficulty: Difficulty) => {
    setDraft((prev) => prev ? {
      ...prev,
      difficulty,
      xpReward: getXpReward(difficulty),
      coinReward: getCoinReward(difficulty),
    } : prev);
  };

  const setStat = (key: StatKey, value: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const statRewards = { ...prev.statRewards };
      if (value <= 0) delete statRewards[key];
      else statRewards[key] = Math.min(5, value);
      return { ...prev, statRewards };
    });
  };

  const save = () => {
    const title = draft.title.trim();
    if (!title) return;
    onSave({ ...draft, title });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-t-lg border border-border bg-card p-4 shadow-xl sm:rounded-lg sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">Edit Quest</h3>
            <p className="mt-1 text-xs text-white/40">Changes sync to Supabase after save.</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-secondary text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close edit quest"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-white/45">Title</label>
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              className="min-h-11 w-full rounded-lg border border-border bg-secondary px-3 text-sm font-semibold text-white focus:outline-none focus:border-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-white/45">Description</label>
            <textarea
              value={draft.description || ''}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              rows={3}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-3 text-sm text-white focus:outline-none focus:border-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-white/45">Quest Type</label>
            <div className="grid grid-cols-4 gap-2">
              {QUEST_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setDraft({ ...draft, questType: type })}
                  className={`min-h-11 rounded-lg border text-xs font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    draft.questType === type ? 'bg-white border-white text-black' : 'bg-secondary border-border text-white/55 hover:border-white/30'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-white/45">Difficulty</label>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTIES.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setDifficulty(difficulty)}
                  className={`min-h-11 rounded-lg border text-xs font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    draft.difficulty === difficulty ? 'bg-white border-white text-black' : 'bg-secondary border-border text-white/55 hover:border-white/30'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wide text-white/45">Stat Rewards</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_STATS.map((stat) => {
                const value = draft.statRewards[stat.key] || 0;
                return (
                  <div key={stat.key} className="flex min-h-12 items-center justify-between gap-2 rounded-lg border border-border bg-secondary px-3">
                    <button
                      onClick={() => setStat(stat.key, value - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
                      disabled={value === 0}
                      aria-label={`Decrease ${stat.fullLabel}`}
                    >
                      <Minus size={14} />
                    </button>
                    <div className="min-w-0 text-center">
                      <p className="truncate text-xs font-bold uppercase tracking-wide text-white">{stat.label}</p>
                      <p className="text-xs font-semibold text-white/45">+{value}</p>
                    </div>
                    <button
                      onClick={() => setStat(stat.key, value + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/5 hover:text-white"
                      aria-label={`Increase ${stat.fullLabel}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={save}
            disabled={!draft.title.trim()}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-xs font-bold uppercase tracking-wide text-black transition-colors hover:bg-white/90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Save size={16} /> Save Quest
          </button>
        </div>
      </div>
    </div>
  );
}