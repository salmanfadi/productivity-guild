import { useState } from 'react';
import { type Difficulty, getXpReward } from '@/lib/game-system';
import { Plus, X, Shield, Zap, Swords, Flame } from 'lucide-react';

const DIFFICULTIES: { key: Difficulty; label: string; icon: typeof Shield }[] = [
  { key: 'easy', label: 'Easy', icon: Shield },
  { key: 'medium', label: 'Medium', icon: Zap },
  { key: 'hard', label: 'Hard', icon: Swords },
  { key: 'boss', label: 'Boss', icon: Flame },
];

interface AddQuestModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, difficulty: Difficulty) => void;
}

export default function AddQuestModal({ open, onClose, onAdd }: AddQuestModalProps) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  if (!open) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), difficulty);
    setTitle('');
    setDifficulty('medium');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md status-window rounded-t-2xl p-5 animate-slide-up"
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

        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Difficulty</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {DIFFICULTIES.map((d) => {
            const Icon = d.icon;
            const selected = difficulty === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs transition-all ${
                  selected
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                <Icon size={16} />
                <span>{d.label}</span>
                <span className="text-[10px]">+{getXpReward(d.key)} XP</span>
              </button>
            );
          })}
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
