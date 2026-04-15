import { type PlayerState, ALL_STATS, type StatKey } from '@/lib/game-system';
import { Coins, Flame, Trophy, Target, TrendingUp, Sword, Brain, Heart, Eye, Timer, ShieldCheck, Code, Palette, MessageSquare, Zap, Wind, Dice4, Star, Shield, Activity } from 'lucide-react';

const STAT_ICONS: Record<StatKey, typeof Sword> = {
  str: Sword, sta: Timer, dis: ShieldCheck, foc: Eye, int: Brain, eq: Heart,
  tech: Code, cre: Palette, com: MessageSquare, conf: Zap, cons: Wind,
  luk: Dice4, rep: Star, res: Shield, hp: Activity,
};

interface DashboardProps {
  player: PlayerState;
}

export default function Dashboard({ player }: DashboardProps) {
  const totalStatPoints = Object.values(player.stats).reduce((a, b) => a + b, 0);
  const completedToday = player.quests.filter(q => q.completed && q.questType === 'daily').length;
  const totalDaily = player.quests.filter(q => q.questType === 'daily').length;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Character Sheet Header */}
      <div className="status-window rounded-lg p-4 text-center">
        <h3 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Character Sheet</h3>
        <p className="font-display text-lg font-bold text-primary">{player.name}</p>
        <p className="text-xs text-muted-foreground">Level {player.level} • Total Power: {totalStatPoints}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Coins, value: player.coins, label: 'Coins', color: 'text-glow-warning' },
          { icon: Flame, value: `${player.streak}d`, label: 'Streak', color: 'text-glow-danger' },
          { icon: Trophy, value: player.totalQuestsCompleted, label: 'Completed', color: 'text-primary' },
          { icon: Target, value: `${completedToday}/${totalDaily || '-'}`, label: 'Daily', color: 'text-glow-success' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="status-window rounded-lg p-3 text-center">
              <Icon size={16} className={`mx-auto mb-1 ${item.color}`} />
              <p className="font-display text-sm font-bold">{item.value}</p>
              <p className="text-[9px] text-muted-foreground uppercase">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Full Stat Radar - Visual Bars */}
      {(['core', 'secondary', 'hidden'] as const).map((cat) => {
        const catStats = ALL_STATS.filter(s => s.category === cat);
        const catLabel = cat === 'core' ? '⚔️ Core Stats' : cat === 'secondary' ? '🛡️ Secondary Stats' : '👁️ Hidden Stats';
        return (
          <div key={cat} className="status-window rounded-lg p-4">
            <h4 className="font-display text-[10px] uppercase tracking-wider text-muted-foreground mb-3">{catLabel}</h4>
            <div className="space-y-2">
              {catStats.map((s) => {
                const Icon = STAT_ICONS[s.key];
                const val = player.stats[s.key];
                const max = 50;
                const pct = Math.min((val / max) * 100, 100);
                return (
                  <div key={s.key} className="flex items-center gap-2">
                    <Icon size={11} className="text-primary shrink-0" />
                    <span className="text-[10px] w-8 text-muted-foreground uppercase shrink-0">{s.label}</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-display text-[10px] font-bold text-primary w-5 text-right">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Best Streak */}
      {player.bestStreak > 0 && (
        <div className="status-window rounded-lg p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Best Streak</p>
          <p className="font-display text-2xl font-bold text-glow-warning glow-text-warning">{player.bestStreak} days</p>
        </div>
      )}
    </div>
  );
}
