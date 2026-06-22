import { type StatKey, ALL_STATS, type HunterStats } from '@/lib/game-system';
import { Plus, Sword, Brain, Eye, Zap, Code, MessageSquare, ShieldCheck, Timer } from 'lucide-react';

const STAT_ICONS: Record<StatKey, typeof Sword> = {
  str: Sword, sta: Timer, dis: ShieldCheck, foc: Eye, int: Brain,
  tech: Code, com: MessageSquare, conf: Zap,
};

interface StatAllocationProps {
  stats: HunterStats;
  statPoints: number;
  onAllocate: (stat: StatKey) => void;
}

export default function StatAllocation({ stats, statPoints, onAllocate }: StatAllocationProps) {
  const categories = [
    { label: 'Core Stats', stats: ALL_STATS.filter(s => s.category === 'core') },
    { label: 'Secondary Stats', stats: ALL_STATS.filter(s => s.category === 'secondary') },
  ];

  return (
    <div className="space-y-4 animate-slide-up">
      {statPoints > 0 && (
        <div className="status-window rounded-lg p-3 text-center">
          <span className="text-xs font-display text-glow-warning animate-pulse-glow">
            {statPoints} stat points available
          </span>
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.label} className="status-window rounded-lg p-4">
          <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-3">{cat.label}</h3>
          <div className="space-y-2.5">
            {cat.stats.map((s) => {
              const Icon = STAT_ICONS[s.key];
              const value = stats[s.key];
              const maxVisible = 50;
              const percent = Math.min((value / maxVisible) * 100, 100);
              return (
                <div key={s.key} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-primary shrink-0">
                    <Icon size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{s.fullLabel}</span>
                      <span className="font-display text-xs font-bold text-primary">{value}</span>
                    </div>
                    <div className="h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  {statPoints > 0 && (
                    <button
                      onClick={() => onAllocate(s.key)}
                      className="w-6 h-6 rounded-md bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors shrink-0"
                    >
                      <Plus size={10} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
