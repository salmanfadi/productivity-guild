import { type SystemMessage } from '@/lib/game-system';
import { X, Info, AlertTriangle, Gift, Sparkles } from 'lucide-react';

const TYPE_CONFIG: Record<SystemMessage['type'], { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: 'text-primary' },
  warning: { icon: AlertTriangle, color: 'text-glow-warning' },
  reward: { icon: Gift, color: 'text-glow-success' },
  event: { icon: Sparkles, color: 'text-glow-accent' },
};

interface SystemMessagesProps {
  messages: SystemMessage[];
  onDismiss: (id: string) => void;
}

export default function SystemMessages({ messages, onDismiss }: SystemMessagesProps) {
  const unread = messages.filter(m => !m.read).slice(-5).reverse();
  if (unread.length === 0) return null;

  return (
    <div className="space-y-2 mb-4 animate-slide-up">
      {unread.map((msg) => {
        const config = TYPE_CONFIG[msg.type];
        const Icon = config.icon;
        return (
          <div key={msg.id} className="quest-item rounded-lg p-3 flex items-start gap-2.5">
            <Icon size={14} className={`${config.color} shrink-0 mt-0.5`} />
            <p className="text-xs flex-1 leading-relaxed">{msg.text}</p>
            <button onClick={() => onDismiss(msg.id)} className="text-muted-foreground hover:text-foreground shrink-0">
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
