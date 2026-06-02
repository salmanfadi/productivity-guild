import { getRank, ALL_ROLES, type PlayerState, type Rank } from '@/lib/game-system';
import { Coins, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const RANK_COLORS: Record<Rank, string> = {
  E: 'text-white/40', D: 'text-white/60', C: 'text-white/80',
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
    <div className="rounded-[24px] bg-[#111111] border border-[#2A2A2A] p-5 shadow-lg space-y-4">
      {/* Profile summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
              <span className="text-sm font-bold text-white">{player.level}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded bg-black border border-[#2A2A2A] flex items-center justify-center">
              <span className={`text-[8px] font-bold ${RANK_COLORS[rank]}`}>{rank}</span>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white">{player.name}</h2>
            <p className="text-[9px] text-white/40 uppercase tracking-widest font-semibold mt-0.5">
              {activeRole ? activeRole.name : 'Hunter'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-white/50">
          <div className="flex items-center gap-1 text-white">
            <Coins size={12} className="text-white/40" />
            <span className="tabular-nums">{player.coins}</span>
          </div>
          {player.streak > 0 && (
            <div className="flex items-center gap-1 text-white">
              <Flame size={12} className="text-white/40" />
              <span className="tabular-nums">{player.streak}d</span>
            </div>
          )}
        </div>
      </div>

      {/* Mini XP bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-white/30">
          <span>EXP</span>
          <span className="tabular-nums">{player.xp} / {player.xpToNext}</span>
        </div>
        <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#2A2A2A]/40">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </div>
  );
}
