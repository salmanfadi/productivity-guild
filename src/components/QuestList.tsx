import { type Quest, type Difficulty } from '@/lib/game-system';
import { Check, Trash2, Flame, Swords, Shield, Zap, Coins } from 'lucide-react';

const DIFFICULTY_CONFIG: Record<Difficulty, {
  label: string; icon: typeof Flame; barColor: string; iconBg: string;
}> = {
  easy:   { label: 'EASY',   icon: Shield, barColor: 'bg-rank-d',   iconBg: 'text-rank-d bg-rank-d/10 border-rank-d/40' },
  medium: { label: 'MED',    icon: Zap,    barColor: 'bg-rank-c',   iconBg: 'text-rank-c bg-rank-c/10 border-rank-c/40' },
  hard:   { label: 'HARD',   icon: Swords, barColor: 'bg-rank-b',   iconBg: 'text-rank-b bg-rank-b/10 border-rank-b/40' },
  boss:   { label: 'BOSS',   icon: Flame,  barColor: 'bg-rank-s',   iconBg: 'text-rank-s bg-rank-s/10 border-rank-s/40' },
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
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1 h-3 bg-primary glow-primary" />
        <h3 className="font-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{title}</h3>
        <div className="flex-1 h-px bg-border" />
        <span className="font-display text-[10px] text-primary">{quests.length}</span>
      </div>
      {quests.length === 0 ? (
        <div className="quest-item rounded-lg p-6 text-center">
          <p className="text-muted-foreground text-xs italic">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {quests.map((quest) => {
            const config = DIFFICULTY_CONFIG[quest.difficulty];
            const Icon = config.icon;
            const statEntries = Object.entries(quest.statRewards || {}).filter(([, v]) => v && v > 0);
            return (
              <div
                key={quest.id}
                className={`quest-item rounded-lg p-3 flex items-center gap-3 relative ${quest.completed ? 'opacity-50' : ''}`}
              >
                {/* Difficulty colored left bar */}
                <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r ${config.barColor}`} />

                <button
                  onClick={() => !quest.completed && onComplete(quest.id)}
                  disabled={quest.completed}
                  className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-all border ${
                    quest.completed
                      ? 'bg-glow-success/15 text-glow-success border-glow-success/40'
                      : 'bg-secondary border-border hover:bg-primary/15 hover:border-primary/50 hover:text-primary text-muted-foreground hover:glow-primary'
                  }`}
                  aria-label={quest.completed ? 'Completed' : 'Complete quest'}
                >
                  {quest.completed ? <Check size={16} /> : <div className="w-3 h-3 rounded-sm border border-current" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${quest.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {quest.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-display uppercase tracking-wider mt-0.5">
                    <span className="text-primary">+{quest.xpReward}xp</span>
                    <span className="flex items-center gap-0.5 text-glow-warning">
                      <Coins size={9} />{quest.coinReward}
                    </span>
                    {statEntries.length > 0 && (
                      <span className="text-accent truncate">
                        {statEntries.map(([k, v]) => `+${v}${k}`).join(' ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${config.iconBg}`}>
                  <Icon size={14} />
                </div>

                {!quest.completed && (
                  <button
                    onClick={() => onDelete(quest.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
                    aria-label="Delete quest"
                  >
                    <Trash2 size={13} />
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
