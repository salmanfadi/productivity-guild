import { type Quest, type Difficulty, ALL_STATS } from '@/lib/game-system';
import { Check, Trash2, Shield, Zap, Swords, Flame, Sparkles, RotateCcw } from 'lucide-react';
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
  onRepeatTomorrow?: (quest: Quest) => void;
  title: string;
  emptyText: string;
}

export default function QuestList({ quests, onComplete, onDelete, onRepeatTomorrow, title, emptyText }: QuestListProps) {
  const openCount = quests.filter((quest) => !quest.completed).length;

  return (
    <section className="space-y-4" aria-label={title}>
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">{title}</h3>
          <p className="mt-1 text-xs text-white/35">{openCount} open / {quests.length} total</p>
        </div>
      </div>

      {quests.length === 0 ? (
        <div className="rounded-lg bg-card border border-border p-8 text-center">
          <p className="text-sm text-white/50 font-medium leading-relaxed">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {quests.map((quest) => {
              const config = DIFFICULTY_CONFIG[quest.difficulty];
              const DiffIcon = config.icon;
              const statEntries = Object.entries(quest.statRewards || {}).filter(([, v]) => v && v > 0);
              const canRepeat = quest.completed && quest.questType === 'daily' && onRepeatTomorrow;

              return (
                <motion.article
                  key={quest.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-lg border bg-card px-4 py-3 transition-colors ${
                    quest.completed ? 'border-border/60 opacity-70' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => !quest.completed && onComplete(quest.id)}
                      disabled={quest.completed}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        quest.completed
                          ? 'bg-white border-white text-black'
                          : 'border-white/20 bg-transparent hover:border-white/70 hover:bg-white/5'
                      }`}
                      aria-label={quest.completed ? 'Completed' : `Complete ${quest.title}`}
                    >
                      {quest.completed ? <Check size={16} strokeWidth={3} /> : <span className="h-2 w-2 rounded-full bg-white/10" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-base font-bold leading-snug ${
                        quest.completed ? 'line-through text-white/45' : 'text-white'
                      }`}>
                        {quest.title}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wide text-white/45">
                        <span className="text-white/75">+{quest.xpReward} XP</span>
                        <span aria-hidden="true">/</span>
                        <span className="flex items-center gap-1">
                          <DiffIcon size={13} className={config.iconColor} />
                          {config.label}
                        </span>

                        {statEntries.length > 0 && (
                          <TooltipProvider>
                            <span className="flex flex-wrap gap-x-2 gap-y-1">
                              {statEntries.map(([k, v]) => {
                                const stat = ALL_STATS.find(s => s.key === k);
                                return (
                                  <Tooltip key={k}>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex cursor-help items-center gap-1 text-white/85">
                                        <Sparkles size={11} className="text-white/55" />
                                        +{v} {k.toUpperCase()}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-card border border-border text-white">
                                      <p className="text-xs font-bold uppercase tracking-wide">{stat?.fullLabel || k}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </span>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {canRepeat && (
                        <button
                          onClick={() => onRepeatTomorrow(quest)}
                          className="flex h-11 w-11 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          aria-label={`Repeat ${quest.title} tomorrow`}
                          title="Repeat tomorrow"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(quest.id)}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-white/35 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        aria-label={`Delete ${quest.title}`}
                        title="Delete quest"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}