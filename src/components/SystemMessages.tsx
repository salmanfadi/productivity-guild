import { type SystemMessage } from '@/lib/game-system';
import { X, Info, AlertTriangle, Gift, Sparkles } from 'lucide-react';

const TYPE_CONFIG: Record<SystemMessage['type'], {
  icon: typeof Info; color: string; border: string; label: string;
}> = {
  info:    { icon: Info,           color: 'text-primary',       border: 'border-primary/40',       label: 'NOTICE' },
  warning: { icon: AlertTriangle,  color: 'text-glow-warning',  border: 'border-glow-warning/40',  label: 'WARNING' },
  reward:  { icon: Gift,           color: 'text-glow-success',  border: 'border-glow-success/40',  label: 'REWARD' },
  event:   { icon: Sparkles,       color: 'text-glow-accent',   border: 'border-glow-accent/40',   label: 'EVENT' },
};

interface SystemMessagesProps {
  messages: SystemMessage[];
  onDismiss: (id: string) => void;
}

export default function SystemMessages({ messages, onDismiss }: SystemMessagesProps) {
  const unread = messages.filter(m => !m.read).slice(-5).reverse();
  if (unread.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {unread.map((msg) => {
        const config = TYPE_CONFIG[msg.type];
        const Icon = config.icon;
        return (
          <div
            key={msg.id}
            className={`relative rounded-lg p-3 pl-3.5 flex items-start gap-2.5 bg-card/80 backdrop-blur border ${config.border} animate-slide-in-right`}
          >
            {/* left accent bar */}
            <div className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r ${config.color.replace('text-', 'bg-')}`} />
            <Icon size={14} className={`${config.color} shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <p className={`text-[9px] font-display uppercase tracking-[0.2em] mb-0.5 ${config.color}`}>
                {config.label}
              </p>
              <p className="text-xs leading-relaxed">{msg.text}</p>
            </div>
            <button
              onClick={() => onDismiss(msg.id)}
              className="text-muted-foreground hover:text-foreground shrink-0 p-0.5"
              aria-label="Dismiss"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
