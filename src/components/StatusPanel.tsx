import { getRank, type PlayerState, type Rank } from '@/lib/game-system';
import { Coins, Flame } from 'lucide-react';

const RANK_COLORS: Record<Rank, string> = {
  E: 'text-rank-e', D: 'text-rank-d', C: 'text-rank-c',
  B: 'text-rank-b', A: 'text-rank-a', S: 'text-rank-s',
};

const RANK_GLOW: Record<Rank, string> = {
  E: '', D: '', C: 'glow-text-primary', B: '', A: '', S: 'glow-text-warning',
};

interface StatusPanelProps {
  player: PlayerState;
}

export default function StatusPanel({ player }: StatusPanelProps) {
  const xpPercent = Math.min((player.xp / player.xpToNext) * 100, 100);
  const rank = getRank(player.level);
  const coreStats = ['str', 'sta', 'dis', 'foc', 'int', 'eq'] as const;

  return (
    <div className="status-window rounded-lg p-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center glow-primary">
            <span className="font-display text-lg font-bold text-primary">{player.level}</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Hunter</p>
            <h2 className="font-display text-lg font-bold tracking-wide">{player.name}</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Rank</p>
          <span className={`font-display text-3xl font-black ${RANK_COLORS[rank]} ${RANK_GLOW[rank]}`}>{rank}</span>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>EXP</span>
          <span>{player.xp} / {player.xpToNext}</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-glow-accent rounded-full animate-xp-fill transition-all duration-500"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Coins + Streak */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1 text-glow-warning">
          <Coins size={14} />
          <span className="font-display font-bold">{player.coins}</span>
        </div>
        {player.streak > 0 && (
          <div className="flex items-center gap-1 text-glow-danger">
            <Flame size={14} />
            <span className="font-display font-bold">{player.streak} day streak</span>
          </div>
        )}
      </div>

      {/* Core Stats Grid */}
      <div className="grid grid-cols-6 gap-1.5">
        {coreStats.map((key) => (
          <div key={key} className="text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{key}</p>
            <p className="font-display text-sm font-bold text-primary">{player.stats[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
