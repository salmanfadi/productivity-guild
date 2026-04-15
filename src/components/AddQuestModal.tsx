import { useState, useEffect } from 'react';
import { type Difficulty, type QuestType, type StatKey, getXpReward, getCoinReward, suggestStatRewards, ALL_STATS } from '@/lib/game-system';
import { Plus, X, Shield, Zap, Swords, Flame, Coins } from 'lucide-react';

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

interface AddQuestModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, difficulty: Difficulty, questType: QuestType, statRewards: Partial<Record<StatKey, number>>) => void;
}

export default function AddQuestModal({ open, onClose, onAdd }: AddQuestModalProps) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questType, setQuestType] = useState<QuestType>('custom');
  const [statRewards, setStatRewards] = useState<Partial<Record<StatKey, number>>>({});
  const [showStatPicker, setShowStatPicker] = useState(false);

  // Auto-suggest stats based on title
  useEffect(() => {
    if (title.length > 3) {
      const suggested = suggestStatRewards(title);
      if (Object.keys(suggested).length > 0) {
        setStatRewards(suggested);
      }
    }
  }, [title]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), difficulty, questType, statRewards);
    setTitle('');
    setDifficulty('medium');
    setQuestType('custom');
    setStatRewards({});
    setShowStatPicker(false);
    onClose();
  };

  const toggleStat = (key: StatKey) => {
    setStatRewards(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = 1;
      }
      return next;
    });
  };

  const selectedStats = Object.entries(statRewards).filter(([, v]) => v && v > 0);
  const allocatableStats = ALL_STATS.filter(s => s.category !== 'hidden');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md status-window rounded-t-2xl p-5 animate-slide-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm uppercase tracking-wider">New Quest</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <input
          type="text"
          placeholder="Quest description..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
          className="w-full bg-secondary rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary mb-4"
        />

        {/* Quest Type */}
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Type</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {QUEST_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setQuestType(t.key)}
              className={`p-2 rounded-lg text-xs transition-all ${
                questType === t.key
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'bg-secondary text-muted-foreground border border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Difficulty */}
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Difficulty</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {DIFFICULTIES.map((d) => {
            const Icon = d.icon;
            const selected = difficulty === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-all ${
                  selected
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                <Icon size={14} />
                <span>{d.label}</span>
                <span className="text-[10px]">+{getXpReward(d.key)} XP</span>
              </button>
            );
          })}
        </div>

        {/* Stat Rewards */}
        <div className="mb-4">
          <button
            onClick={() => setShowStatPicker(!showStatPicker)}
            className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1 hover:text-primary transition-colors"
          >
            Stat Rewards {selectedStats.length > 0 && `(${selectedStats.length})`}
            <Plus size={10} className={`transition-transform ${showStatPicker ? 'rotate-45' : ''}`} />
          </button>
          
          {selectedStats.length > 0 && !showStatPicker && (
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedStats.map(([key, val]) => (
                <span key={key} className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-display">
                  +{val} {key.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {showStatPicker && (
            <div className="grid grid-cols-4 gap-1.5">
              {allocatableStats.map((s) => {
                const active = !!statRewards[s.key];
                return (
                  <button
                    key={s.key}
                    onClick={() => toggleStat(s.key)}
                    className={`p-1.5 rounded-md text-[10px] font-display transition-all ${
                      active
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'bg-secondary text-muted-foreground border border-transparent'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Rewards preview */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">+{getXpReward(difficulty)} XP</span>
          <span className="flex items-center gap-1"><Coins size={12} className="text-glow-warning" /> +{getCoinReward(difficulty)}</span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider font-bold disabled:opacity-30 transition-all hover:glow-primary"
        >
          <Plus size={16} className="inline mr-2" />
          Accept Quest
        </button>
      </div>
    </div>
  );
}
