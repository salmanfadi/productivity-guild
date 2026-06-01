import { useState, useEffect } from 'react';
import {
  type Difficulty, type QuestType, type StatKey, type QuestCategory,
  getXpReward, getCoinReward, suggestStatRewards, suggestCategory,
  ALL_STATS, QUEST_CATEGORIES,
} from '@/lib/game-system';
import { Plus, X, Shield, Zap, Swords, Flame, Coins, Sparkles, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DIFFICULTIES: { key: Difficulty; label: string; icon: typeof Shield; color: string }[] = [
  { key: 'easy', label: 'Easy', icon: Shield, color: 'glow-success' },
  { key: 'medium', label: 'Medium', icon: Zap, color: 'glow-primary' },
  { key: 'hard', label: 'Hard', icon: Swords, color: 'glow-accent' },
  { key: 'boss', label: 'Boss', icon: Flame, color: 'glow-warning' },
];

const QUEST_TYPES: { key: QuestType; label: string }[] = [
  { key: 'custom', label: 'Custom' },
  { key: 'main', label: 'Main' },
];

const CATEGORIES: { key: 'core' | 'secondary' | 'hidden'; label: string }[] = [
  { key: 'core', label: 'Core' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'hidden', label: 'Hidden' },
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

  // Auto-suggest stats based on title — but only if user hasn't manually picked
  useEffect(() => {
    if (manuallyEdited) return;
    if (title.length > 3) {
      const suggested = suggestStatRewards(title);
      setStatRewards(suggested);
    } else {
      setStatRewards({});
    }
  }, [title, manuallyEdited]);

  const reset = () => {
    setTitle('');
    setDifficulty('medium');
    setQuestType('custom');
    setStatRewards({});
    setManuallyEdited(false);
  };


  if (!open) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), difficulty, questType, statRewards);
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-md animate-slide-up" onClick={handleClose}>
      <div
        className="w-full max-w-md status-window rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top glow line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center glow-primary">
              <Sparkles size={14} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display text-sm uppercase tracking-[0.2em] text-primary">New Quest</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">System window</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Title */}
        <label className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-1.5 block font-display">Quest Description</label>
        <input
          type="text"
          placeholder="e.g. Solve 2 LeetCode problems"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
          className="w-full bg-secondary/70 border border-border rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 mb-5 transition-all"
        />

        {/* Quest Type */}
        <label className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-1.5 block font-display">Type</label>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {QUEST_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setQuestType(t.key)}
              className={`py-2.5 rounded-lg text-xs font-display uppercase tracking-wider transition-all ${
                questType === t.key
                  ? 'bg-primary/15 text-primary border border-primary/50 glow-primary'
                  : 'bg-secondary/60 text-muted-foreground border border-border hover:border-primary/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Difficulty */}
        <label className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-1.5 block font-display">Difficulty</label>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {DIFFICULTIES.map((d) => {
            const Icon = d.icon;
            const selected = difficulty === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-all ${
                  selected
                    ? 'bg-primary/15 text-primary border border-primary/50 glow-primary'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground border border-border hover:border-primary/30'
                }`}
              >
                <Icon size={16} />
                <span className="font-display uppercase tracking-wider text-[10px]">{d.label}</span>
                <span className="text-[9px] opacity-70">+{getXpReward(d.key)}xp</span>
              </button>
            );
          })}
        </div>

        {/* Stat Rewards */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-display">
              Stat Rewards
              {!manuallyEdited && Object.keys(statRewards).length > 0 && (
                <span className="ml-1.5 text-primary normal-case tracking-normal">· auto</span>
              )}
            </label>
            <span className="text-[10px] font-display text-primary">
              {totalStatPoints > 0 ? `+${totalStatPoints} pts` : 'none'}
            </span>
          </div>

          <TooltipProvider>
            <div className="space-y-3 bg-secondary/30 border border-border rounded-lg p-3">
              {GROUPED_STATS.map((g) => (
                <div key={g.key}>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mb-1.5 font-display">
                    {g.label}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {g.stats.map((s) => {
                      const val = statRewards[s.key] || 0;
                      const active = val > 0;
                      return (
                        <Tooltip key={s.key}>
                          <TooltipTrigger asChild>
                            <div
                              className={`flex items-center justify-between rounded-md border transition-all px-1.5 py-1 cursor-help ${
                                active
                                  ? 'bg-primary/15 border-primary/50'
                                  : 'bg-secondary/60 border-border'
                              }`}
                            >
                              <button
                                onClick={() => setStat(s.key, val - 1)}
                                disabled={!active}
                                className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-20"
                                aria-label={`Decrease ${s.label}`}
                              >
                                <Minus size={10} />
                              </button>
                              <div className="flex flex-col items-center leading-none pointer-events-none">
                                <span className={`text-[10px] font-display font-bold ${active ? 'text-primary' : 'text-foreground'}`}>
                                  {s.label}
                                </span>
                                <span className="text-[8px] text-muted-foreground mt-0.5">
                                  {active ? `+${val}` : '—'}
                                </span>
                              </div>
                              <button
                                onClick={() => setStat(s.key, val + 1)}
                                className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary"
                                aria-label={`Increase ${s.label}`}
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs font-display uppercase tracking-wider">{s.fullLabel}</p>
                            <p className="text-[10px] text-muted-foreground">{s.description}</p>
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

        {/* Rewards preview */}
        <div className="flex items-center justify-between mb-4 px-3 py-2.5 rounded-lg bg-secondary/40 border border-border">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">Rewards</span>
          <div className="flex items-center gap-3 text-xs font-display">
            <span className="flex items-center gap-1 text-primary">
              <Zap size={12} /> +{getXpReward(difficulty)} XP
            </span>
            <span className="flex items-center gap-1" style={{ color: 'hsl(var(--glow-warning))' }}>
              <Coins size={12} /> +{getCoinReward(difficulty)}
            </span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="w-full py-3.5 rounded-lg bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground font-display text-sm uppercase tracking-[0.2em] font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:glow-primary active:scale-[0.99]"
        >
          ⚔ Accept Quest
        </button>
      </div>
    </div>
  );
}
