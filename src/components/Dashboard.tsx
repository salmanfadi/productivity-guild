import { type PlayerState, ALL_STATS, ALL_ROLES, type StatKey } from '@/lib/game-system';
import { Coins, Flame, Trophy, Target, Sword, Brain, Heart, Eye, Timer, ShieldCheck, Code, Palette, MessageSquare, Zap, Wind, Dice4, Star, Shield, Activity } from 'lucide-react';

const STAT_ICONS: Record<StatKey, typeof Sword> = {
  str: Sword, sta: Timer, dis: ShieldCheck, foc: Eye, int: Brain, eq: Heart,
  tech: Code, cre: Palette, com: MessageSquare, conf: Zap, cons: Wind,
  luk: Dice4, rep: Star, res: Shield, hp: Activity,
};

const CAT_META = {
  core:      { label: '⚔ Core Stats',      barClass: 'bg-primary',     textClass: 'text-primary',     glowClass: 'glow-text-primary' },
  secondary: { label: '✦ Secondary Stats', barClass: 'bg-accent',      textClass: 'text-accent',      glowClass: 'glow-text-accent' },
  hidden:    { label: '◈ Hidden Stats',    barClass: 'bg-glow-success', textClass: 'text-glow-success', glowClass: 'glow-text-success' },
} as const;

interface DashboardProps {
  player: PlayerState;
}

export default function Dashboard({ player }: DashboardProps) {
  const totalStatPoints = Object.values(player.stats).reduce((a, b) => a + b, 0);
  const completedToday = player.quests.filter(q => q.completed && q.questType === 'daily').length;
  const totalDaily = player.quests.filter(q => q.questType === 'daily').length;
  const activeRole = ALL_ROLES.find(r => r.id === player.activeRole);

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Character Sheet Header */}
      <div className="system-window rounded-lg p-4 text-center scanline">
        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
          Character Sheet
        </p>
        <p className="font-display text-xl font-bold text-primary glow-text-primary">{player.name}</p>
        {activeRole && (
          <p className="text-[10px] text-accent font-display uppercase tracking-[0.2em] mt-0.5">
            {activeRole.name}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">
          Level {player.level} · Total Power {totalStatPoints}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Coins,   value: player.coins,                       label: 'Coins',     color: 'text-glow-warning' },
          { icon: Flame,   value: `${player.streak}d`,                label: 'Streak',    color: 'text-glow-danger' },
          { icon: Trophy,  value: player.totalQuestsCompleted,        label: 'Done',      color: 'text-primary' },
          { icon: Target,  value: `${completedToday}/${totalDaily || '-'}`, label: 'Daily', color: 'text-glow-success' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="system-window rounded-lg p-3 text-center">
              <Icon size={16} className={`mx-auto mb-1 ${item.color}`} />
              <p className="font-display text-sm font-bold">{item.value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Stat radar by category */}
      {(['core', 'secondary', 'hidden'] as const).map((cat) => {
        const meta = CAT_META[cat];
        const catStats = ALL_STATS.filter(s => s.category === cat);
        return (
          <div key={cat} className="system-window rounded-lg p-4">
            <h4 className={`font-display text-[10px] uppercase tracking-[0.2em] mb-3 ${meta.textClass}`}>
              {meta.label}
            </h4>
            <div className="space-y-2">
              {catStats.map((s) => {
                const Icon = STAT_ICONS[s.key];
                const val = player.stats[s.key];
                const max = 100;
                const pct = Math.min((val / max) * 100, 100);
                const high = val >= 50;
                return (
                  <div key={s.key} className="flex items-center gap-2">
                    <Icon size={11} className={`${meta.textClass} shrink-0`} />
                    <span className="text-[10px] w-9 text-muted-foreground uppercase font-display tracking-wider shrink-0">
                      {s.label}
                    </span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${meta.barClass}`}
                        style={{ width: `${pct}%`, boxShadow: high ? `0 0 8px hsl(var(--glow-${cat === 'core' ? 'primary' : cat === 'secondary' ? 'accent' : 'success'}) / 0.6)` : undefined }}
                      />
                    </div>
                    <span className={`font-display text-[11px] font-bold w-7 text-right ${meta.textClass} ${high ? meta.glowClass : ''}`}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Best Streak */}
      {player.bestStreak > 0 && (
        <div className="system-window rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-display">Best Streak</p>
          <p className="font-display text-2xl font-bold text-glow-warning glow-text-warning mt-1">
            {player.bestStreak} days
          </p>
        </div>
      )}
    </div>
  );
}
