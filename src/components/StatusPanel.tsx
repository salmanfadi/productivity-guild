import { getRank, ALL_ROLES, type PlayerState, type Rank } from '@/lib/game-system';
import { Coins, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const RANK_COLORS: Record<Rank, string> = {
  E: 'text-white/45', D: 'text-white/60', C: 'text-white/80',
  B: 'text-white', A: 'text-white font-bold', S: 'text-white font-black',
};

interface StatusPanelProps {
  player: PlayerState;
}

export default function StatusPanel({ player }: StatusPanelProps) {
  const xpPercent = Math.min((player.xp / player.xpToNext) * 100, 100);
  const rank = getRank(player.level);
  const activeRole = ALL_ROLES.find(r => r.id === player.activeRole);

  return (
    <section className="rounded-lg bg-card border border-border p-4 shadow-lg space-y-4" aria-label="Character status">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary border border-border">
              <span className="text-base font-bold text-white tabular-nums">{player.level}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded bg-background border border-border">
              <span className={`text-[10px] font-bold ${RANK_COLORS[rank]}`}>{rank}</span>
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold tracking-tight text-white">{player.name}</h2>
            <p className="mt-1 truncate text-xs text-white/45 uppercase tracking-wide font-semibold">
              {activeRole ? activeRole.name : 'Hunter'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-sm font-semibold text-white/70">
          <div className="flex items-center gap-1.5 text-white" aria-label={`${player.coins} coins`}>
            <Coins size={14} className="text-white/45" />
            <span className="tabular-nums">{player.coins}</span>
          </div>
          {player.streak > 0 && (
            <div className="flex items-center gap-1.5 text-white" aria-label={`${player.streak} day streak`}>
              <Flame size={14} className="text-white/45" />
              <span className="tabular-nums">{player.streak}d</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-white/40">
          <span>EXP</span>
          <span className="tabular-nums">{player.xp} / {player.xpToNext}</span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-secondary border border-border/60" aria-hidden="true">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </section>
  );
}