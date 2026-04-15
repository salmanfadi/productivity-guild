import { useEffect, useState } from 'react';

interface LevelUpOverlayProps {
  level: number;
  show: boolean;
  onDone: () => void;
}

export default function LevelUpOverlay({ level, show, onDone }: LevelUpOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDone();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="text-center animate-level-up">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-primary mb-2">Level Up!</p>
        <p className="font-display text-7xl font-black text-primary glow-text-primary">{level}</p>
        <p className="text-muted-foreground text-sm mt-2">+3 stat points earned</p>
      </div>
    </div>
  );
}
