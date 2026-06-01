import { useState } from 'react';
import { type MainQuest, type QuestCategory, QUEST_CATEGORIES, getCategoryInfo, createMainQuest } from '@/lib/game-system';
import { Crown, Plus, X, ChevronDown, ChevronRight, Check, Trash2, Sparkles } from 'lucide-react';

interface MainQuestsTabProps {
  mainQuests: MainQuest[];
  onCreate: (mq: MainQuest) => void;
  onToggleSub: (mqId: string, subId: string) => void;
  onDelete: (mqId: string) => void;
}

export default function MainQuestsTab({ mainQuests, onCreate, onToggleSub, onDelete }: MainQuestsTabProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1 h-3 bg-accent glow-accent" />
        <h3 className="font-display text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Main Quests</h3>
        <div className="flex-1 h-px bg-border" />
        <span className="font-display text-[10px] text-accent">{mainQuests.length}</span>
      </div>

      {mainQuests.length === 0 && (
        <div className="quest-item rounded-lg p-6 text-center mb-3">
          <Crown size={20} className="mx-auto mb-2 text-accent/60" />
          <p className="text-muted-foreground text-xs italic">
            No main quests. Define a long-term arc — your placement, a project, a transformation.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {mainQuests.map((mq) => {
          const total = mq.subquests.length;
          const done = mq.subquests.filter(s => s.done).length;
          const pct = total === 0 ? 0 : Math.round((done / total) * 100);
          const cat = getCategoryInfo(mq.category);
          const isOpen = expanded[mq.id] ?? true;
          const isComplete = total > 0 && done === total;
          return (
            <div key={mq.id} className={`quest-item rounded-lg p-3 relative ${isComplete ? 'opacity-70' : ''}`}>
              <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-accent" />
              <div className="flex items-start gap-2">
                <button
                  onClick={() => setExpanded(e => ({ ...e, [mq.id]: !isOpen }))}
                  className="text-muted-foreground hover:text-foreground mt-0.5"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Crown size={12} className="text-accent shrink-0" />
                    <p className={`text-sm font-bold font-display uppercase tracking-wider truncate ${isComplete ? 'line-through' : ''}`}>
                      {mq.title}
                    </p>
                    {cat && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/30 text-[9px] font-display uppercase">
                        <span>{cat.emoji}</span>{cat.label}
                      </span>
                    )}
                  </div>
                  {mq.description && (
                    <p className="text-[11px] text-muted-foreground mb-2">{mq.description}</p>
                  )}
                  {/* Progress */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-display text-accent shrink-0">
                      {done}/{total} · {pct}%
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">
                    Reward: <span className="text-primary">+{mq.xpReward} XP</span>
                  </div>

                  {isOpen && (
                    <div className="mt-3 space-y-1.5">
                      {mq.subquests.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => onToggleSub(mq.id, s.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md bg-secondary/40 border border-border hover:border-accent/40 transition-all text-left"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            s.done
                              ? 'bg-glow-success/20 border-glow-success/60 text-glow-success'
                              : 'border-border'
                          }`}>
                            {s.done && <Check size={10} />}
                          </div>
                          <span className={`text-xs flex-1 ${s.done ? 'line-through text-muted-foreground' : ''}`}>
                            {s.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDelete(mq.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
                  aria-label="Delete main quest"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setShowCreate(true)}
        className="w-full mt-3 py-3 rounded-lg border border-dashed border-accent/40 text-accent text-sm flex items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-colors font-display uppercase tracking-wider"
      >
        <Plus size={16} />
        New Main Quest
      </button>

      {showCreate && (
        <CreateMainQuestModal
          onClose={() => setShowCreate(false)}
          onCreate={(mq) => { onCreate(mq); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

function CreateMainQuestModal({ onClose, onCreate }: { onClose: () => void; onCreate: (mq: MainQuest) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory | undefined>(undefined);
  const [subs, setSubs] = useState<string[]>(['', '']);

  const updateSub = (i: number, v: string) => {
    const next = [...subs];
    next[i] = v;
    setSubs(next);
  };
  const addSub = () => setSubs([...subs, '']);
  const removeSub = (i: number) => setSubs(subs.filter((_, idx) => idx !== i));

  const validSubs = subs.filter(s => s.trim());
  const canSubmit = title.trim().length > 0 && validSubs.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onCreate(createMainQuest(title.trim(), validSubs, category, description.trim() || undefined));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-md animate-slide-up" onClick={onClose}>
      <div
        className="w-full max-w-md status-window rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-accent to-transparent" />

        <div className="flex items-center justify-between mb-5 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center glow-accent">
              <Crown size={14} className="text-accent" />
            </div>
            <div>
              <h3 className="font-display text-sm uppercase tracking-[0.2em] text-accent">Main Quest</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Long-term arc</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <label className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-1.5 block font-display">Title</label>
        <input
          type="text"
          placeholder="e.g. Become Placement Ready"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="w-full bg-secondary/70 border border-border rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent/50 mb-4"
        />

        <label className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-1.5 block font-display">Description (optional)</label>
        <input
          type="text"
          placeholder="e.g. DSA + System Design mastery by September"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-secondary/70 border border-border rounded-lg px-4 py-2.5 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent/50 mb-4"
        />

        <label className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-1.5 block font-display">Category</label>
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {QUEST_CATEGORIES.map((c) => {
            const selected = category === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCategory(selected ? undefined : c.key)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-display uppercase tracking-wider transition-all border ${
                  selected
                    ? 'bg-accent/15 text-accent border-accent/50 glow-accent'
                    : 'bg-secondary/60 text-muted-foreground border-border hover:border-accent/30'
                }`}
              >
                <span className="text-sm leading-none">{c.emoji}</span>
                <span className="text-[8px]">{c.label}</span>
              </button>
            );
          })}
        </div>

        <label className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-1.5 block font-display">
          Subquests <span className="normal-case tracking-normal text-accent">({validSubs.length})</span>
        </label>
        <div className="space-y-1.5 mb-4">
          {subs.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[10px] font-display text-muted-foreground w-5">{i + 1}.</span>
              <input
                type="text"
                placeholder={`Step ${i + 1} — e.g. Arrays`}
                value={s}
                onChange={(e) => updateSub(i, e.target.value)}
                className="flex-1 bg-secondary/70 border border-border rounded-md px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {subs.length > 1 && (
                <button
                  onClick={() => removeSub(i)}
                  className="text-muted-foreground hover:text-destructive p-1"
                  aria-label="Remove subquest"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addSub}
            className="w-full py-2 rounded-md border border-dashed border-border text-muted-foreground hover:text-accent hover:border-accent/40 text-[10px] font-display uppercase tracking-wider flex items-center justify-center gap-1"
          >
            <Plus size={12} /> Add Step
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 px-3 py-2.5 rounded-lg bg-secondary/40 border border-border">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-display">Final Reward</span>
          <span className="text-xs font-display text-primary flex items-center gap-1">
            <Sparkles size={12} /> +{250 + validSubs.length * 50} XP
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-lg bg-gradient-to-r from-accent via-accent to-primary text-accent-foreground font-display text-sm uppercase tracking-[0.2em] font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:glow-accent active:scale-[0.99]"
        >
          ⚔ Begin Main Quest
        </button>
      </div>
    </div>
  );
}
