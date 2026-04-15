import { type Quest, type Difficulty } from '@/lib/game-system';
import { Check, Trash2, Flame, Swords, Shield, Zap } from 'lucide-react';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; icon: typeof Flame }> = {
  easy: { label: 'E', color: 'text-rank-d bg-rank-d/10', icon: Shield },
  medium: { label: 'M', color: 'text-rank-c bg-rank-c/10', icon: Zap },
  hard: { label: 'H', color: 'text-rank-b bg-rank-b/10', icon: Swords },
  boss: { label: '!', color: 'text-rank-s bg-rank-s/10', icon: Flame },
};

interface QuestListProps {
  quests: Quest[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  title: string;
  emptyText: string;
}

export default function QuestList({ quests, onComplete, onDelete, title, emptyText }: QuestListProps) {
  return (
    <div className="animate-slide-up">
      <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      {quests.length === 0 ? (
        <div className="quest-item rounded-lg p-6 text-center">
          <p className="text-muted-foreground text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {quests.map((quest) => {
            const config = DIFFICULTY_CONFIG[quest.difficulty];
            const Icon = config.icon;
            return (
              <div
                key={quest.id}
                className={`quest-item rounded-lg p-3 flex items-center gap-3 ${quest.completed ? 'opacity-50' : ''}`}
              >
                <button
                  onClick={() => !quest.completed && onComplete(quest.id)}
                  disabled={quest.completed}
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-all ${
                    quest.completed
                      ? 'bg-glow-success/20 text-glow-success'
                      : 'bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary'
                  }`}
                >
                  {quest.completed ? <Check size={16} /> : <div className="w-3 h-3 rounded-sm border border-muted-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${quest.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {quest.title}
                  </p>
                  <p className="text-xs text-muted-foreground">+{quest.xpReward} XP</p>
                </div>
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${config.color}`}>
                  <Icon size={14} />
                </div>
                {!quest.completed && (
                  <button
                    onClick={() => onDelete(quest.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
