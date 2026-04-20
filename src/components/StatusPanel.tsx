import { getRank, ALL_ROLES, type PlayerState, type Rank } from '@/lib/game-system';
import { Coins, Flame } from 'lucide-react';

const RANK_COLORS: Record<Rank, string> = {
  E: 'text-rank-e', D: 'text-rank-d', C: 'text-rank-c',
  B: 'text-rank-b', A: 'text-rank-a', S: 'text-rank-s',
};

const RANK_GLOW: Record<Rank, string> = {
  E: '', D: 'glow-text-success', C: 'glow-text-primary', B: 'glow-text-accent', A: '', S: 'glow-text-gold',
};

interface StatusPanelProps {
  player: PlayerState;
}

export default function StatusPanel({ player }: StatusPanelProps) {
  const xpPercent = Math.min((player.xp / player.xpToNext) * 100, 100);
  const rank = getRank(player.level);
  const coreStats = ['str', 'sta', 'dis', 'foc', 'int', 'eq'] as const;
  const activeRole = ALL_ROLES.find(r => r.id === player.activeRole);

  return (
    <div className="system-window rounded-lg p-5 animate-slide-up scanline">
      {/* Header tag */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
        <p className="font-display text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
          Status · Hunter Profile
        </p>
      </div>

      {/* Identity */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-lg bg-secondary border border-primary/40 flex items-center justify-center glow-primary">
              <span className="font-display text-xl font-black text-primary glow-text-primary">{player.level}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded bg-background border border-primary/50 flex items-center justify-center">
              <span className={`font-display text-[10px] font-black ${RANK_COLORS[rank]} ${RANK_GLOW[rank]}`}>{rank}</span>
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-wider">{player.name}</h2>
            {activeRole ? (
              <p className="text-[10px] text-accent font-display uppercase tracking-[0.15em]">
                {activeRole.name}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hunter</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em]">Rank</p>
          <span className={`font-display text-3xl font-black leading-none ${RANK_COLORS[rank]} ${RANK_GLOW[rank]}`}>
            {rank}
          </span>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-1.5">
          <span>EXP</span>
          <span className="text-primary">{player.xp} / {player.xpToNext}</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden border border-border">
          <div
            className="h-full xp-bar-fill rounded-full transition-all duration-700"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Coins + Streak */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5 text-glow-warning">
          <Coins size={13} />
          <span className="font-display font-bold tracking-wider">{player.coins}</span>
        </div>
        {player.streak > 0 && (
          <div className="flex items-center gap-1.5 text-glow-danger">
            <Flame size={13} />
            <span className="font-display font-bold tracking-wider">{player.streak}d</span>
          </div>
        )}
        {player.statPoints > 0 && (
          <div className="ml-auto px-2 py-0.5 rounded bg-accent/15 border border-accent/40 animate-border-pulse">
            <span className="text-[10px] font-display uppercase tracking-wider text-accent">
              +{player.statPoints} pts
            </span>
          </div>
        )}
      </div>

      {/* Core Stats Grid */}
      <div className="grid grid-cols-6 gap-1 pt-3 border-t border-border/60">
        {coreStats.map((key) => (
          <div key={key} className="text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-display">{key}</p>
            <p className="font-display text-sm font-bold text-primary mt-0.5">{player.stats[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
