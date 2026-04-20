import { useMemo } from 'react';
import {
  ALL_ROLES, getRoleProgress, isRoleUnlocked,
  type Role, type RolePath, type HunterStats,
} from '@/lib/game-system';
import { Lock, Check, Dumbbell, Code2, BrainCircuit, Users, Flame, Sparkles, Crown } from 'lucide-react';

const PATH_META: Record<RolePath, { label: string; icon: typeof Lock; color: string }> = {
  beginner:     { label: 'Beginner',      icon: Sparkles,     color: 'text-rank-e' },
  physical:     { label: 'Physical Path', icon: Dumbbell,     color: 'text-glow-danger' },
  tech:         { label: 'Tech Path',     icon: Code2,        color: 'text-primary' },
  intelligence: { label: 'Intelligence',  icon: BrainCircuit, color: 'text-glow-accent' },
  social:       { label: 'Social Path',   icon: Users,        color: 'text-glow-success' },
  discipline:   { label: 'Discipline',    icon: Flame,        color: 'text-glow-warning' },
  hybrid:       { label: 'S-Rank Hybrid', icon: Crown,        color: 'text-glow-gold' },
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
  })), []);

  const unlockedCount = ALL_ROLES.filter(r => isRoleUnlocked(r, stats)).length;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="system-window rounded-lg p-4 text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Skill Tree</p>
        <p className="font-display text-lg font-bold text-primary glow-text-primary mt-1">Identity System</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {unlockedCount} / {ALL_ROLES.length} roles unlocked
        </p>
      </div>

      {grouped.map(({ path, meta, roles }) => {
        const PathIcon = meta.icon;
        return (
          <div key={path}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <PathIcon size={14} className={meta.color} />
              <h4 className="font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {meta.label}
              </h4>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">
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

  const surfaceClass = !unlocked
    ? 'system-window opacity-60'
    : isRare
      ? 'system-window system-window-gold'
      : isActive
        ? 'system-window system-window-accent'
        : 'system-window';

  return (
    <div className={`${surfaceClass} rounded-lg p-3.5`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {!unlocked && <Lock size={11} className="text-muted-foreground shrink-0" />}
            {isRare && <Crown size={11} className="text-glow-gold shrink-0" />}
            <p className={`font-display text-sm font-bold truncate ${
              !unlocked ? 'text-muted-foreground' : isRare ? 'text-glow-gold glow-text-gold' : 'text-foreground'
            }`}>
              {role.name}
            </p>
            {isActive && (
              <span className="text-[8px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/40">
                Active
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground italic leading-snug">{role.description}</p>
        </div>
        {unlocked && !isActive && (
          <button
            onClick={() => onSetActive(role.id)}
            className="text-[9px] font-display uppercase tracking-wider px-2 py-1 rounded bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 hover:glow-primary transition-all shrink-0"
          >
            Equip
          </button>
        )}
        {unlocked && isActive && (
          <div className="w-6 h-6 rounded bg-glow-success/20 border border-glow-success/40 flex items-center justify-center shrink-0">
            <Check size={12} className="text-glow-success" />
          </div>
        )}
      </div>

      {/* Requirements */}
      {Object.keys(role.requirements).length > 0 && (
        <>
          <div className="flex flex-wrap gap-1 mb-2">
            {Object.entries(role.requirements).map(([k, need]) => {
              const have = stats[k as keyof HunterStats];
              const met = have >= (need as number);
              return (
                <span
                  key={k}
                  className={`text-[9px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                    met
                      ? 'bg-glow-success/10 border-glow-success/40 text-glow-success'
                      : 'bg-secondary/60 border-border text-muted-foreground'
                  }`}
                >
                  {k} {have}/{need}
                </span>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                unlocked
                  ? isRare ? 'bg-glow-gold' : 'bg-glow-success'
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
