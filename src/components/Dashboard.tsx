import { type PlayerState, type StatKey, ALL_STATS, ALL_ROLES } from '@/lib/game-system';
import { Dumbbell, Battery, ShieldCheck, Eye, Brain, Code, MessageSquare, Flame, Coins, Trophy, Calendar, Plus, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const STAT_ICONS: Record<StatKey, any> = {
  str: Dumbbell,
  sta: Battery,
  dis: ShieldCheck,
  foc: Eye,
  int: Brain,
  tech: Code,
  com: MessageSquare,
  conf: Flame,
};

interface DashboardProps {
  player: PlayerState;
  onAllocate: (stat: StatKey) => void;
  onNameChange: (name: string) => void;
  onReset: () => void;
}

export default function Dashboard({ player, onAllocate, onNameChange, onReset }: DashboardProps) {
  const totalStats = Object.values(player.stats).reduce((a, b) => a + b, 0);
  const activeRole = ALL_ROLES.find(r => r.id === player.activeRole);
  const xpPercent = Math.min((player.xp / player.xpToNext) * 100, 100);

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      {/* Character Profile Overview */}
      <div className="rounded-[28px] bg-[#111111] border border-[#2A2A2A] p-6 shadow-xl text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold mb-2">
          STATUS SHEET
        </p>

        {/* Editable Name Field */}
        <input
          type="text"
          value={player.name}
          onChange={(e) => onNameChange(e.target.value)}
          className="bg-transparent text-center text-[22px] font-bold text-white focus:outline-none focus:border-b focus:border-white/20 w-full tracking-tight mb-1"
        />

        {activeRole ? (
          <p className="text-[11px] text-white/60 font-semibold uppercase tracking-[0.2em] mt-1">
            {activeRole.name}
          </p>
        ) : (
          <p className="text-[11px] text-white/40 uppercase tracking-wider mt-1">HUNTER</p>
        )}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/50 border-t border-[#2A2A2A]/40 pt-4">
          <div>
            <span className="font-bold text-white text-sm">{player.level}</span> Level
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <div>
            <span className="font-bold text-white text-sm">{totalStats}</span> Power Index
          </div>
        </div>
      </div>

      {/* Grid of Key Performance Indicators */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Coins, value: player.coins, label: 'Coins' },
          { icon: Trophy, value: player.totalQuestsCompleted, label: 'Quests' },
          { icon: Calendar, value: `${player.dailyQuestsCompleted}d`, label: 'Streak' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="rounded-[20px] bg-[#111111] border border-[#2A2A2A] p-4 text-center">
              <Icon size={16} className="mx-auto mb-2 text-white/40" />
              <p className="text-sm font-bold text-white">{item.value}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider font-semibold mt-0.5">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Level Up points indicator */}
      {player.statPoints > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[20px] bg-white text-black p-4 text-center font-bold text-xs uppercase tracking-widest"
        >
          {player.statPoints} Stat Points Available for Allocation
        </motion.div>
      )}

      {/* Core and Secondary Stats progress bars */}
      <div className="rounded-[28px] bg-[#111111] border border-[#2A2A2A] p-6 space-y-5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2 border-b border-[#2A2A2A]/40 pb-3">
          Core Attributes
        </h3>

        <div className="space-y-4">
          {ALL_STATS.map((s) => {
            const Icon = STAT_ICONS[s.key];
            const value = player.stats[s.key] || 0;
            const maxVal = 100;
            const pct = Math.min((value / maxVal) * 100, 100);

            return (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-white/60 shrink-0">
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 truncate">
                      {s.fullLabel}
                    </span>
                    <span className="text-[11px] font-bold text-white tabular-nums">
                      {value} <span className="text-[9px] text-white/40 font-medium">/ 100</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#2A2A2A]/40">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Allocate stat button if points available */}
                {player.statPoints > 0 && (
                  <button
                    onClick={() => onAllocate(s.key)}
                    className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/80 active:scale-95 transition-all shrink-0 border border-white"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset Progress Button */}
      <button
        onClick={onReset}
        className="w-full py-4 rounded-[24px] bg-[#111111] hover:bg-[#1A1A1A] border border-[#2A2A2A] text-white/40 hover:text-white/80 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-4"
      >
        <RotateCcw size={14} />
        Reset Character Progress
      </button>
    </div>
  );
}
