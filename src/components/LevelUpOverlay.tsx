import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
        >
          {/* subtle radial soft white light background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[500px] h-[500px] rounded-full bg-white/[0.03] blur-3xl" />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative text-center"
          >
            {/* Header tags */}
            <div className="flex items-center justify-center gap-3.5 mb-4">
              <div className="h-[1px] w-8 bg-white/20" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-bold">
                SYSTEM UPDATE
              </p>
              <div className="h-[1px] w-8 bg-white/20" />
            </div>

            {/* Level up title */}
            <h1 className="text-[13px] uppercase tracking-[0.3em] text-white font-bold mb-1">
              LEVEL UP
            </h1>

            {/* Level number */}
            <p className="text-[120px] font-black leading-none text-white tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.25)] select-none">
              {level}
            </p>

            {/* stat reward description card */}
            <div className="mt-6 inline-block px-5 py-2.5 rounded-full border border-white/10 bg-[#111111] shadow-xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">
                Identity status stats points updated
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
