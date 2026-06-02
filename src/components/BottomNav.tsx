import { Scroll, User, Award, HeartPulse, Home } from 'lucide-react';

export type Tab = 'home' | 'quests' | 'dashboard' | 'roles' | 'checkin';

const TABS: { key: Tab; label: string; icon: typeof Scroll }[] = [
  { key: 'home',      label: 'Home',      icon: Home },
  { key: 'quests',    label: 'Quests',    icon: Scroll },
  { key: 'dashboard', label: 'Character', icon: User },
  { key: 'roles',     label: 'Roles',     icon: Award },
  { key: 'checkin',   label: 'Check-In',  icon: HeartPulse },
];

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 border-t border-[#2A2A2A] backdrop-blur-md">
      <div className="max-w-md mx-auto flex justify-around px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 transition-colors ${
                isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
              aria-label={tab.label}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.75}
                className="transition-transform duration-200"
              />
              <span className="text-[9px] font-bold uppercase tracking-widest scale-95">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
