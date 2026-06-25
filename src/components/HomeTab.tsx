import { motion } from 'framer-motion';
import { Check, ChevronRight, Dumbbell, Eye, ShieldCheck, Brain } from 'lucide-react';
import type { PlayerState, StatKey } from '@/lib/game-system';
import type { Tab } from '@/components/BottomNav';
import { ALL_ROLES } from '@/lib/game-system';

interface HomeTabProps {
  player: PlayerState;
  onCompleteQuest: (id: string) => void;
  onOpenTab: (tab: Tab) => void;
  onOpenQuests: (subTab?: 'all' | 'active' | 'daily' | 'weekly') => void;
}

const QUICK_STATS: { key: StatKey; label: string; icon: typeof Dumbbell }[] = [
  { key: 'str', label: 'Strength',     icon: Dumbbell },
  { key: 'foc', label: 'Focus',        icon: Eye },
  { key: 'dis', label: 'Discipline',   icon: ShieldCheck },
  { key: 'int', label: 'Intelligence', icon: Brain },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export default function HomeTab({ player, onCompleteQuest, onOpenTab, onOpenQuests }: HomeTabProps) {
  const role = ALL_ROLES.find((r) => r.id === player.activeRole);
  const xpPct = Math.min(100, Math.round((player.xp / player.xpToNext) * 100));

  const dailies = player.quests
    .filter((q) => q.questType === 'daily')
    .slice(0, 4);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-black text-white px-1 pt-2 pb-24 font-sans">
      {/* Header Info */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-6"
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">{today}</p>
        <h1 className="text-[32px] leading-tight font-bold tracking-tight mt-1">
          {greeting()},<br />
          <span className="text-white/80">{player.name}</span>
        </h1>
      </motion.header>

      {/* Level and Role Card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="mt-8 rounded-[28px] bg-[#111111] border border-[#2A2A2A] p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Active Identity</p>
            <p className="text-[18px] font-bold mt-1 text-white">
              {role ? role.name : 'Initiate'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Level</p>
            <p className="text-[36px] font-bold tabular-nums leading-none mt-1">{player.level}</p>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Experience Progress</p>
            <p className="text-[11px] font-bold tabular-nums text-white/60">
              {player.xp} / {player.xpToNext} XP
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-[#1A1A1A] overflow-hidden border border-[#2A2A2A]">
            <motion.div
              className="h-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.section>

      {/* Today's Daily Quests */}
      <SectionHeader title="Today's Quests" action="All Quests" onAction={() => onOpenQuests('all')} />
      <div className="space-y-3">
        {dailies.length === 0 && (
          <button
            onClick={() => onOpenQuests('daily')}
            className="w-full rounded-[24px] bg-[#111111] border border-dashed border-[#2A2A2A] p-6 text-[13px] text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
          >
            Accept today's quests
          </button>
        )}
        {dailies.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * i }}
            className={`flex items-center gap-4 rounded-[24px] border p-4.5 transition-all ${
              q.completed
                ? 'bg-[#0B0B0B] border-[#1C1C1C] opacity-50'
                : 'bg-[#111111] border-[#2A2A2A]'
            }`}
          >
            <button
              onClick={() => !q.completed && onCompleteQuest(q.id)}
              disabled={q.completed}
              aria-label={q.completed ? 'Completed' : 'Complete quest'}
              className={`shrink-0 h-7 w-7 rounded-full border flex items-center justify-center transition-all ${
                q.completed
                  ? 'bg-white border-white text-black'
                  : 'border-white/20 hover:border-white/60 hover:bg-white/5'
              }`}
            >
              {q.completed && <Check size={14} strokeWidth={3} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-[14px] font-bold truncate ${q.completed ? 'line-through text-white/40' : 'text-white'}`}>
                {q.title}
              </p>
              <p className="text-[11px] text-white/40 mt-0.5 font-medium uppercase tracking-wider">
                +{q.xpReward} XP · {q.difficulty}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats Grid */}
      <SectionHeader title="Core Stats" action="Status Sheet" onAction={() => onOpenTab('dashboard')} />
      <div className="grid grid-cols-2 gap-3.5">
        {QUICK_STATS.map((s, i) => {
          const Icon = s.icon;
          const val = player.stats[s.key] || 0;
          const pct = Math.min(100, (val / 100) * 100);
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
              className="rounded-[24px] bg-[#111111] border border-[#2A2A2A] p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon size={18} className="text-white/50" strokeWidth={1.5} />
                <span className="text-[22px] font-bold tabular-nums leading-none">{val}</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-3">{s.label}</p>
              <div className="h-[2px] w-full rounded-full bg-[#1A1A1A] overflow-hidden border border-[#2A2A2A]/50">
                <motion.div
                  className="h-full bg-white/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({
  title, action, onAction,
}: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-end justify-between mt-10 mb-4 px-1">
      <h2 className="text-[20px] font-bold tracking-tight">{title}</h2>
      {action && (
        <button
          onClick={onAction}
          className="text-[12px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-wider"
        >
          {action}
        </button>
      )}
    </div>
  );
}
