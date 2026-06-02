import { useState, useEffect } from 'react';
import {
  type Difficulty, type QuestType, type StatKey, type QuestCategory,
  getXpReward, getCoinReward, suggestStatRewards, suggestCategory,
  ALL_STATS, QUEST_CATEGORIES,
} from '@/lib/game-system';
import { Plus, X, Shield, Zap, Swords, Flame, Sparkles, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DIFFICULTIES: { key: Difficulty; label: string; icon: typeof Shield }[] = [
  { key: 'easy', label: 'Easy', icon: Shield },
  { key: 'medium', label: 'Medium', icon: Zap },
  { key: 'hard', label: 'Hard', icon: Swords },
  { key: 'boss', label: 'Boss', icon: Flame },
];

const QUEST_TYPES: { key: QuestType; label: string }[] = [
  { key: 'custom', label: 'Custom' },
  { key: 'main', label: 'Main' },
];

const CATEGORIES: { key: 'core' | 'secondary'; label: string }[] = [
  { key: 'core', label: 'Core Stats' },
  { key: 'secondary', label: 'Secondary Stats' },
];

const GROUPED_STATS = CATEGORIES.map(cat => ({
  ...cat,
  stats: ALL_STATS.filter(s => s.category === cat.key),
}));

interface AddQuestModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, difficulty: Difficulty, questType: QuestType, statRewards: Partial<Record<StatKey, number>>, category: QuestCategory | undefined) => void;
}

export default function AddQuestModal({ open, onClose, onAdd }: AddQuestModalProps) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questType, setQuestType] = useState<QuestType>('custom');
  const [statRewards, setStatRewards] = useState<Partial<Record<StatKey, number>>>({});
  const [manuallyEdited, setManuallyEdited] = useState(false);
  const [category, setCategory] = useState<QuestCategory | undefined>(undefined);
  const [categoryAuto, setCategoryAuto] = useState(true);

  // Auto-suggest stats based on title
  useEffect(() => {
    if (manuallyEdited) return;
    if (title.length > 3) {
      const suggested = suggestStatRewards(title);
      setStatRewards(suggested);
    } else {
      setStatRewards({});
    }
  }, [title, manuallyEdited]);

  // Auto-suggest category from title
  useEffect(() => {
    if (!categoryAuto) return;
    if (title.length > 3) {
      setCategory(suggestCategory(title));
    } else {
      setCategory(undefined);
    }
  }, [title, categoryAuto]);

  const reset = () => {
    setTitle('');
    setDifficulty('medium');
    setQuestType('custom');
    setStatRewards({});
    setManuallyEdited(false);
    setCategory(undefined);
    setCategoryAuto(true);
  };

  if (!open) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), difficulty, questType, statRewards, category);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const setStat = (key: StatKey, val: number) => {
    setManuallyEdited(true);
    setStatRewards(prev => {
      const next = { ...prev };
      if (val <= 0) delete next[key];
      else next[key] = Math.min(5, val);
      return next;
    });
  };

  const totalStatPoints = Object.values(statRewards).reduce<number>((a, b) => a + (b || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-slide-up sm:items-center sm:p-4" onClick={handleClose}>
      <div
        className="w-full max-w-md bg-[#111111] border border-[#2A2A2A] rounded-t-[28px] p-4 max-h-[92dvh] overflow-y-auto relative sm:rounded-[28px] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top subtle highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/4 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
              <Sparkles size={14} className="text-white/60" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Create Quest</h3>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-semibold">System Form</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-white/40 hover:text-white hover:border-white/20 transition-all flex items-center justify-center"
          >
            <X size={14} />
          </button>
        </div>

        {/* Quest Title Input */}
        <div className="space-y-2 mb-5">
          <label className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold block">Quest Title</label>
          <input
            type="text"
            placeholder="e.g. Read 15 pages of book"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm placeholder:text-white/20 focus:outline-none focus:border-white transition-all text-white"
          />
        </div>

        {/* Quest Type selector */}
        <div className="space-y-2 mb-5">
          <label className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold block">Quest Type</label>
          <div className="grid grid-cols-2 gap-2.5">
            {QUEST_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setQuestType(t.key)}
                className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  questType === t.key
                    ? 'bg-white border-white text-black'
                    : 'bg-[#1A1A1A] text-white/40 border-[#2A2A2A] hover:border-white/20'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories grid selector */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold block">
              Category
              {categoryAuto && category && (
                <span className="ml-1.5 text-white/30 lowercase tracking-normal">· auto</span>
              )}
            </label>
            {category && (
              <button
                onClick={() => { setCategory(undefined); setCategoryAuto(false); }}
                className="text-[9px] text-white/40 hover:text-white uppercase tracking-wider font-semibold"
              >
                clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 min-[380px]:grid-cols-4">
            {QUEST_CATEGORIES.map((c) => {
              const selected = category === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => { setCategory(c.key); setCategoryAuto(false); }}
                  className={`flex min-h-[58px] flex-col items-center justify-center gap-1.5 rounded-xl px-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    selected
                      ? 'bg-white text-black border-white'
                      : 'bg-[#1A1A1A] text-white/40 border-[#2A2A2A] hover:border-white/20'
                  }`}
                >
                  <span className="text-sm leading-none">{c.emoji}</span>
                  <span className="text-[8px] tracking-wide">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty buttons */}
        <div className="space-y-2 mb-5">
          <label className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold block">Difficulty Level</label>
          <div className="grid grid-cols-2 gap-2.5 min-[380px]:grid-cols-4">
            {DIFFICULTIES.map((d) => {
              const selected = difficulty === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setDifficulty(d.key)}
                  className={`flex min-h-[58px] flex-col items-center justify-center gap-1.5 rounded-xl border p-3 transition-all ${
                    selected
                      ? 'bg-white text-black border-white'
                      : 'bg-[#1A1A1A] text-white/40 border-[#2A2A2A] hover:border-white/20'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider text-[9px]">{d.label}</span>
                  <span className="text-[8px] opacity-75 font-semibold">+{getXpReward(d.key)} XP</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stat reward Allocation sliders */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold block">
              Quest Rewards
              {!manuallyEdited && Object.keys(statRewards).length > 0 && (
                <span className="ml-1.5 text-white/30 lowercase tracking-normal">· auto</span>
              )}
            </label>
            <span className="text-[10px] font-bold text-white/50">
              {totalStatPoints > 0 ? `+${totalStatPoints} Stat Points` : 'none'}
            </span>
          </div>

          <TooltipProvider>
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-3 sm:p-4">
              {GROUPED_STATS.map((g) => (
                <div key={g.key} className="space-y-2">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                    {g.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2 min-[380px]:grid-cols-3">
                    {g.stats.map((s) => {
                      const val = statRewards[s.key] || 0;
                      const active = val > 0;
                      return (
                        <Tooltip key={s.key}>
                          <TooltipTrigger asChild>
                            <div
                              className={`flex min-h-[58px] items-center justify-between gap-1 rounded-xl border px-2 py-2 transition-all cursor-help ${
                                active
                                  ? 'bg-white border-white text-black'
                                  : 'bg-[#111111] border-[#2A2A2A] text-white/40'
                              }`}
                            >
                              <button
                                onClick={() => setStat(s.key, val - 1)}
                                disabled={!active}
                                className={`w-5 h-5 rounded flex items-center justify-center disabled:opacity-20 ${
                                  active ? 'text-black/50 hover:text-black' : 'text-white/40 hover:text-white'
                                }`}
                                aria-label={`Decrease ${s.label}`}
                              >
                                <Minus size={10} />
                              </button>
                              <div className="flex min-w-0 flex-1 flex-col items-center text-center leading-none">
                                <span className="max-w-full truncate text-[8px] font-bold uppercase min-[380px]:text-[9px]">
                                  {s.fullLabel}
                                </span>
                                <span className="text-[8px] mt-1 opacity-80">
                                  {active ? `+${val}` : '—'}
                                </span>
                              </div>
                              <button
                                onClick={() => setStat(s.key, val + 1)}
                                className={`w-5 h-5 rounded flex items-center justify-center ${
                                  active ? 'text-black/50 hover:text-black' : 'text-white/40 hover:text-white'
                                }`}
                                aria-label={`Increase ${s.label}`}
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#111111] border border-[#2A2A2A] text-white">
                            <p className="text-[10px] font-bold uppercase tracking-wider">{s.fullLabel}</p>
                            <p className="text-[9px] text-white/40">{s.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="w-full py-4 rounded-[24px] bg-white text-black font-bold text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 active:scale-[0.99] transition-all shadow-lg"
        >
          Accept System Quest
        </button>
      </div>
    </div>
  );
}
