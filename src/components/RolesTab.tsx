import { useMemo } from 'react';
import {
  ALL_ROLES, getRoleProgress, isRoleUnlocked,
  type Role, type RolePath, type HunterStats, type StatKey
} from '@/lib/game-system';
import { Lock, Check, Sparkles, Dumbbell, Code2, BrainCircuit, Users, Flame, Crown } from 'lucide-react';

const PATH_META: Record<RolePath, { label: string; icon: any }> = {
  beginner:     { label: 'Beginner Identity', icon: Sparkles },
  physical:     { label: 'Physical Identity', icon: Dumbbell },
  tech:         { label: 'Technical Identity', icon: Code2 },
  intelligence: { label: 'Intellectual Identity', icon: BrainCircuit },
  social:       { label: 'Social Identity', icon: Users },
  discipline:   { label: 'Discipline Identity', icon: Flame },
  hybrid:       { label: 'S-Rank Hybrid Identity', icon: Crown },
};

const PATHS_ORDER: RolePath[] = ['beginner', 'physical', 'tech', 'intelligence', 'social', 'discipline', 'hybrid'];

interface RolesTabProps {
  stats: HunterStats;
  activeRole?: string;
  onSetActive: (roleId: string) => void;
}

export default function RolesTab({ stats, activeRole, onSetActive }: RolesTabProps) {
  const grouped = useMemo(() => PATHS_ORDER.map(p => ({
    path: p,
    meta: PATH_META[p],
    roles: ALL_ROLES.filter(r => r.path === p),
  })).filter(g => g.roles.length > 0), []);

  const unlockedCount = ALL_ROLES.filter(r => isRoleUnlocked(r, stats)).length;

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      {/* Header Info */}
      <div className="rounded-[28px] bg-[#111111] border border-[#2A2A2A] p-6 text-center shadow-xl">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold">IDENTITY DIRECTORY</p>
        <h2 className="text-[20px] font-bold text-white tracking-tight mt-1">Unlocked Roles</h2>
        <p className="text-[11px] font-bold text-white/50 mt-1">
          {unlockedCount} / {ALL_ROLES.length} unlocked
        </p>
      </div>

      {grouped.map(({ path, meta, roles }) => {
        const PathIcon = meta.icon;
        return (
          <div key={path} className="space-y-3.5">
            <div className="flex items-center gap-2 px-1">
              <PathIcon size={14} className="text-white/40" />
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                {meta.label}
              </h4>
              <div className="flex-1 h-px bg-[#2A2A2A]/40" />
            </div>

            <div className="space-y-3">
              {roles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  stats={stats}
                  isActive={activeRole === role.id}
                  onSetActive={onSetActive}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RoleCard({
  role, stats, isActive, onSetActive,
}: { role: Role; stats: HunterStats; isActive: boolean; onSetActive: (id: string) => void }) {
  const unlocked = isRoleUnlocked(role, stats);
  const progress = getRoleProgress(role, stats);
  const isRare = role.tier === 'rare';

  const cardBorderClass = isActive
    ? 'border-white'
    : 'border-[#2A2A2A]';

  const cardBgClass = unlocked
    ? 'bg-[#111111]'
    : 'bg-[#111111]/40 opacity-50';

  return (
    <div className={`rounded-[24px] border p-5 ${cardBorderClass} ${cardBgClass} transition-all duration-300`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!unlocked && <Lock size={12} className="text-white/30 shrink-0" />}
            {isRare && <Crown size={12} className="text-white/80 shrink-0 animate-pulse" />}
            <p className={`text-[15px] font-bold truncate ${
              !unlocked ? 'text-white/40' : 'text-white'
            }`}>
              {role.name}
            </p>
            {isActive && (
              <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white text-black border border-white">
                Active
              </span>
            )}
          </div>
          <p className="text-[12px] text-white/40 font-medium leading-relaxed">{role.description}</p>
        </div>

        {unlocked && !isActive && (
          <button
            onClick={() => onSetActive(role.id)}
            className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-white/80 transition-colors shrink-0"
          >
            Equip
          </button>
        )}
        {unlocked && isActive && (
          <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shrink-0">
            <Check size={14} strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Locked Requirements */}
      {Object.keys(role.requirements).length > 0 && (
        <div className="mt-4 border-t border-[#2A2A2A]/40 pt-4">
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {Object.entries(role.requirements).map(([k, need]) => {
              const have = stats[k as keyof HunterStats] || 0;
              const met = have >= (need as number);
              return (
                <span
                  key={k}
                  className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    met
                      ? 'bg-transparent border-white/20 text-white'
                      : 'bg-transparent border-[#2A2A2A] text-white/30'
                  }`}
                >
                  {k.toUpperCase()} {have}/{need}
                </span>
              );
            })}
          </div>

          {/* Progress to unlock identity */}
          {!unlocked && (
            <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#2A2A2A]/50">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
