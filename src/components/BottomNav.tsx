import { Scroll, User, Swords, Target } from 'lucide-react';

export type Tab = 'quests' | 'daily' | 'stats' | 'profile';

const TABS: { key: Tab; label: string; icon: typeof Scroll }[] = [
  { key: 'quests', label: 'Quests', icon: Scroll },
  { key: 'daily', label: 'Daily', icon: Target },
  { key: 'stats', label: 'Stats', icon: Swords },
  { key: 'profile', label: 'Profile', icon: User },
];

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-border">
      <div className="max-w-md mx-auto flex">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon size={20} className={isActive ? 'drop-shadow-[0_0_6px_hsl(var(--glow-primary)/0.5)]' : ''} />
              <span className="text-[10px] uppercase tracking-wider font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
