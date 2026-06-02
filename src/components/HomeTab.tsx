import { motion } from 'framer-motion';
import { Check, ChevronRight, Dumbbell, Eye, ShieldCheck, Brain } from 'lucide-react';
import type { PlayerState, StatKey } from '@/lib/game-system';
import { ALL_ROLES } from '@/lib/game-system';

interface HomeTabProps {
  player: PlayerState;
  onCompleteQuest: (id: string) => void;
  onOpenTab: (tab: 'quests' | 'mains' | 'daily' | 'dashboard') => void;
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

export default function HomeTab({ player, onCompleteQuest, onOpenTab }: HomeTabProps) {
  const role = ALL_ROLES.find((r) => r.id === player.activeRole);
  const xpPct = Math.min(100, Math.round((player.xp / player.xpToNext) * 100));

  const mainQuest = (player.mainQuests || []).find((m) => !m.completed);
  const mainDone = mainQuest ? mainQuest.subquests.filter((s) => s.done).length : 0;
  const mainTotal = mainQuest ? mainQuest.subquests.length : 0;
  const mainPct = mainTotal ? Math.round((mainDone / mainTotal) * 100) : 0;

  const dailies = player.quests
    .filter((q) => q.questType === 'daily')
    .slice(0, 4);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-black text-white -mx-4 px-5 pt-2 pb-24 font-sans">
      {/* Greeting */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-4"
      >
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">{today}</p>
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight mt-1">
          {greeting()},<br />
          <span className="text-white/90">{player.name}.</span>
        </h1>
      </motion.header>

      {/* Identity / Level card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="mt-7 rounded-[28px] bg-[#111111] border border-[#1F1F1F] p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Identity</p>
            <p className="text-[17px] font-medium mt-1.5 text-white">
              {role ? role.name : 'No active role'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Level</p>
            <p className="text-[32px] font-semibold tabular-nums leading-none mt-1">{player.level}</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Progress</p>
            <p className="text-[11px] tabular-nums text-white/60">
              {player.xp} / {player.xpToNext} XP
            </p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{ boxShadow: '0 0 12px rgba(255,255,255,0.35)' }}
            />
          </div>
        </div>
      </motion.section>

      {/* Today's Main Quest */}
      <SectionHeader title="Main Quest" action={mainQuest ? 'View' : 'Set'} onAction={() => onOpenTab('mains')} />
      <motion.button
        type="button"
        onClick={() => onOpenTab('mains')}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full text-left rounded-[24px] bg-[#111111] border border-[#1F1F1F] p-5 active:scale-[0.99] transition-transform"
      >
        {mainQuest ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[15px] font-medium text-white truncate">{mainQuest.title}</p>
              <ChevronRight size={18} className="text-white/30 shrink-0" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all"
                  style={{ width: `${mainPct}%` }}
                />
              </div>
              <p className="text-[11px] tabular-nums text-white/50 w-12 text-right">
                {mainDone}/{mainTotal}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-[14px] text-white/50">No main quest yet</p>
            <ChevronRight size={18} className="text-white/30" />
          </div>
        )}
      </motion.button>

      {/* Daily Quests */}
      <SectionHeader title="Today" action="All" onAction={() => onOpenTab('daily')} />
      <div className="space-y-2.5">
        {dailies.length === 0 && (
          <button
            onClick={() => onOpenTab('daily')}
            className="w-full rounded-[20px] bg-[#111111] border border-dashed border-[#2A2A2A] p-5 text-[13px] text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
          >
            Accept your daily quests
          </button>
        )}
        {dailies.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * i }}
            className={`flex items-center gap-4 rounded-[20px] border p-4 transition-all ${
              q.completed
                ? 'bg-[#0C0C0C] border-[#1A1A1A] opacity-60'
                : 'bg-[#111111] border-[#1F1F1F]'
            }`}
          >
            <button
              onClick={() => !q.completed && onCompleteQuest(q.id)}
              disabled={q.completed}
              aria-label={q.completed ? 'Completed' : 'Complete quest'}
              className={`shrink-0 h-7 w-7 rounded-full border flex items-center justify-center transition-all ${
                q.completed
                  ? 'bg-white border-white text-black'
                  : 'border-white/25 hover:border-white/60 hover:bg-white/5'
              }`}
            >
              {q.completed && <Check size={14} strokeWidth={3} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-[14px] font-medium truncate ${q.completed ? 'line-through text-white/40' : 'text-white'}`}>
                {q.title}
              </p>
              <p className="text-[11px] text-white/40 mt-0.5 capitalize">
                +{q.xpReward} XP · {q.difficulty}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <SectionHeader title="Stats" action="Sheet" onAction={() => onOpenTab('dashboard')} />
      <div className="grid grid-cols-2 gap-3">
        {QUICK_STATS.map((s, i) => {
          const Icon = s.icon;
          const val = player.stats[s.key] || 0;
          const pct = Math.min(100, val);
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
              className="rounded-[22px] bg-[#111111] border border-[#1F1F1F] p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon size={16} className="text-white/60" strokeWidth={1.75} />
                <span className="text-[20px] font-semibold tabular-nums leading-none">{val}</span>
              </div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/40 mb-2">{s.label}</p>
              <div className="h-[3px] w-full rounded-full bg-white/[0.06] overflow-hidden">
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
    <div className="flex items-end justify-between mt-9 mb-3">
      <h2 className="text-[19px] font-semibold tracking-tight">{title}</h2>
      {action && (
        <button
          onClick={onAction}
          className="text-[12px] text-white/50 hover:text-white transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}
