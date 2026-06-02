import { type Quest, type Difficulty, ALL_STATS } from '@/lib/game-system';
import { Check, Trash2, Shield, Zap, Swords, Flame, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

const DIFFICULTY_CONFIG: Record<Difficulty, {
  label: string; icon: typeof Shield; iconColor: string;
}> = {
  easy:   { label: 'EASY',   icon: Shield,  iconColor: 'text-white/40' },
  medium: { label: 'MEDIUM', icon: Zap,     iconColor: 'text-white/60' },
  hard:   { label: 'HARD',   icon: Swords,  iconColor: 'text-white/80' },
  boss:   { label: 'BOSS',   icon: Flame,   iconColor: 'text-white' },
};

interface QuestListProps {
  quests: Quest[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  title: string;
  emptyText: string;
}

export default function QuestList({ quests, onComplete, onDelete, title, emptyText }: QuestListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">{title}</h3>
        <span className="text-[10px] font-bold text-white/30">{quests.length}</span>
      </div>

      {quests.length === 0 ? (
        <div className="rounded-[24px] bg-[#111111] border border-[#2A2A2A] p-8 text-center">
          <p className="text-white/40 text-xs italic font-medium">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {quests.map((quest) => {
              const config = DIFFICULTY_CONFIG[quest.difficulty];
              const DiffIcon = config.icon;
              const statEntries = Object.entries(quest.statRewards || {}).filter(([, v]) => v && v > 0);

              return (
                <motion.div
                  key={quest.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-[24px] border p-4.5 flex items-center gap-4 transition-all duration-300 ${
                    quest.completed
                      ? 'bg-[#111111]/40 border-[#1C1C1C] opacity-50'
                      : 'bg-[#111111] border-[#2A2A2A]'
                  }`}
                >
                  {/* Checkbox Complete Trigger */}
                  <button
                    onClick={() => !quest.completed && onComplete(quest.id)}
                    disabled={quest.completed}
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all border ${
                      quest.completed
                        ? 'bg-white border-white text-black'
                        : 'border-white/20 bg-transparent hover:border-white/60 hover:bg-white/5'
                    }`}
                    aria-label={quest.completed ? 'Completed' : 'Complete quest'}
                  >
                    {quest.completed ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <Check size={14} strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-bold leading-tight truncate ${
                      quest.completed ? 'line-through text-white/40 font-medium' : 'text-white'
                    }`}>
                      {quest.title}
                    </p>

                    {/* Reward & Stat Preview */}
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-white/40 font-semibold uppercase tracking-wider flex-wrap">
                      <span className="text-white/70">+{quest.xpReward} XP</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <DiffIcon size={12} className={config.iconColor} />
                        {config.label}
                      </span>

                      {statEntries.length > 0 && (
                        <>
                          <span>·</span>
                          <TooltipProvider>
                            <span className="flex gap-1.5">
                              {statEntries.map(([k, v]) => {
                                const stat = ALL_STATS.find(s => s.key === k);
                                return (
                                  <Tooltip key={k}>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help text-white hover:text-white/80 transition-colors flex items-center gap-0.5">
                                        <Sparkles size={10} className="text-white/60" />
                                        +{v} {k.toUpperCase()}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-[#111111] border border-[#2A2A2A] text-white">
                                      <p className="text-[10px] font-bold uppercase tracking-wider">{stat?.fullLabel || k}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </span>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Delete Button (if active/not completed) */}
                  {!quest.completed && (
                    <button
                      onClick={() => onDelete(quest.id)}
                      className="text-white/30 hover:text-white/70 transition-colors shrink-0 p-1.5 rounded-full hover:bg-white/5"
                      aria-label="Delete quest"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
