import { Scroll, User, Swords, Target, LayoutDashboard, GitBranch, HeartPulse } from 'lucide-react';

export type Tab = 'quests' | 'daily' | 'checkin' | 'stats' | 'dashboard' | 'profile' | 'roles';

const TABS: { key: Tab; label: string; icon: typeof Scroll }[] = [
  { key: 'quests',    label: 'Quests', icon: Scroll },
  { key: 'daily',     label: 'Daily',  icon: Target },
  { key: 'checkin',   label: 'Vitals', icon: HeartPulse },
  { key: 'dashboard', label: 'Sheet',  icon: LayoutDashboard },
  { key: 'roles',     label: 'Roles',  icon: GitBranch },
  { key: 'stats',     label: 'Stats',  icon: Swords },
  { key: 'profile',   label: 'You',    icon: User },
];

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-primary/20">
      <div className="max-w-md mx-auto flex">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all relative ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={tab.label}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full glow-primary" />
              )}
              <Icon
                size={18}
                className={isActive ? 'drop-shadow-[0_0_8px_hsl(var(--glow-primary)/0.7)]' : ''}
              />
              <span className="text-[9px] uppercase tracking-wider font-display">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
