import { type StatKey, type HunterStats } from '@/lib/game-system';
import { Plus, Sword, Brain, Heart, Wind, Eye } from 'lucide-react';

const STAT_CONFIG: { key: StatKey; label: string; fullLabel: string; icon: typeof Sword }[] = [
  { key: 'str', label: 'STR', fullLabel: 'Strength', icon: Sword },
  { key: 'int', label: 'INT', fullLabel: 'Intelligence', icon: Brain },
  { key: 'vit', label: 'VIT', fullLabel: 'Vitality', icon: Heart },
  { key: 'agi', label: 'AGI', fullLabel: 'Agility', icon: Wind },
  { key: 'per', label: 'PER', fullLabel: 'Perception', icon: Eye },
];

interface StatAllocationProps {
  stats: HunterStats;
  statPoints: number;
  onAllocate: (stat: StatKey) => void;
}

export default function StatAllocation({ stats, statPoints, onAllocate }: StatAllocationProps) {
  return (
    <div className="status-window rounded-lg p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Stats</h3>
        {statPoints > 0 && (
          <span className="text-xs font-display text-glow-warning animate-pulse-glow">
            {statPoints} points available
          </span>
        )}
      </div>
      <div className="space-y-3">
        {STAT_CONFIG.map((s) => {
          const Icon = s.icon;
          const value = stats[s.key];
          const maxVisible = 50;
          const percent = Math.min((value / maxVisible) * 100, 100);
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-primary">
                <Icon size={14} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.fullLabel}</span>
                  <span className="font-display text-sm font-bold text-primary">{value}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              {statPoints > 0 && (
                <button
                  onClick={() => onAllocate(s.key)}
                  className="w-7 h-7 rounded-md bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors"
                >
                  <Plus size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
