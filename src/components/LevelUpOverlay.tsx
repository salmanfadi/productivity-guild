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
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md">
      {/* radial pulse background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative text-center animate-level-up">
        {/* top tag */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px w-12 bg-primary" />
          <p className="font-display text-[11px] uppercase tracking-[0.4em] text-primary">
            Level Up
          </p>
          <div className="h-px w-12 bg-primary" />
        </div>

        {/* Level number */}
        <p className="font-display text-[110px] font-black leading-none text-primary glow-text-primary">
          {level}
        </p>

        {/* bottom tag */}
        <div className="mt-4 inline-block px-4 py-1 rounded border border-accent/50 bg-accent/10">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent">
            +3 Stat Points Awarded
          </p>
        </div>
      </div>
    </div>
  );
}
