import { useMemo, useState } from 'react';
import {
  type DailyCheckIn, type DailyStore,
  defaultCheckIn, computeDailyEngine, getTodayCheckIn, upsertCheckIn, todayStr,
} from '@/lib/daily-system';
import { ALL_STATS, type StatKey } from '@/lib/game-system';
import {
  Activity, Moon, Battery, Smile, Dumbbell, BrainCircuit, Smartphone, Thermometer,
  Sparkles, ShieldAlert, CheckCircle2, Plus,
} from 'lucide-react';

interface DailyCheckInTabProps {
  store: DailyStore;
  onSave: (c: DailyCheckIn) => void;
  onAcceptRecoveryQuest: (title: string, reward: Partial<Record<StatKey, number>>) => void;
}

export default function DailyCheckInTab({ store, onSave, onAcceptRecoveryQuest }: DailyCheckInTabProps) {
  const today = todayStr();
  const existing = getTodayCheckIn(store);
  const [draft, setDraft] = useState<DailyCheckIn>(existing || defaultCheckIn(today));
  const [savedFlash, setSavedFlash] = useState(false);

  const result = useMemo(() => computeDailyEngine(draft), [draft]);
  const set = <K extends keyof DailyCheckIn>(k: K, v: DailyCheckIn[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    onSave(draft);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const fullLabel = (k: StatKey) => ALL_STATS.find(s => s.key === k)?.fullLabel || k;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* HP Header */}
      <div className="system-window rounded-lg p-4 scanline">
        <div className="flex items-center justify-between mb-2">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Daily Check-in</p>
          <p className="text-[10px] text-muted-foreground">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${
            result.hp >= 70 ? 'bg-glow-success/15 border-glow-success/40 text-glow-success' :
            result.hp >= 45 ? 'bg-primary/15 border-primary/40 text-primary' :
            'bg-glow-danger/15 border-glow-danger/40 text-glow-danger'
          }`}>
            <Activity size={20} />
          </div>
          <div className="flex-1">
            <p className="font-display text-2xl font-bold">{result.hp}<span className="text-xs text-muted-foreground"> / 100</span></p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Health Composite</p>
          </div>
          {result.recoveryMode && (
            <span className="px-2 py-1 rounded bg-glow-warning/15 border border-glow-warning/40 text-[9px] font-display uppercase tracking-wider text-glow-warning">
              Recovery
            </span>
          )}
        </div>
        <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${
              result.hp >= 70 ? 'bg-glow-success' : result.hp >= 45 ? 'bg-primary' : 'bg-glow-danger'
            }`}
            style={{ width: `${result.hp}%` }}
          />
        </div>
      </div>

      {/* Inputs */}
      <div className="system-window rounded-lg p-4 space-y-4">
        <h4 className="font-display text-[10px] uppercase tracking-[0.2em] text-primary">Today's Inputs</h4>

        <SliderRow icon={Moon}    label="Sleep" value={draft.sleepHours} min={0} max={12} step={0.5} suffix="h"
                   onChange={(v) => set('sleepHours', v)} />
        <ScaleRow  icon={Battery} label="Energy" value={draft.energy} onChange={(v) => set('energy', v)} />
        <ScaleRow  icon={Smile}   label="Mood"   value={draft.mood}   onChange={(v) => set('mood', v)} />
        <SliderRow icon={BrainCircuit} label="Deep Work" value={draft.deepWorkHours} min={0} max={10} step={0.5} suffix="h"
                   onChange={(v) => set('deepWorkHours', v)} />
        <SliderRow icon={Smartphone}   label="Distraction" value={draft.distractionHours} min={0} max={10} step={0.5} suffix="h"
                   onChange={(v) => set('distractionHours', v)} />

        <ToggleRow icon={Dumbbell}    label="Workout done" value={draft.workoutDone}
                   onChange={(v) => set('workoutDone', v)} />
        <ToggleRow icon={Thermometer} label="I'm sick today" value={draft.sick} danger
                   onChange={(v) => set('sick', v)} />
      </div>

      {/* Active Modifiers */}
      <div className="system-window rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-display text-[10px] uppercase tracking-[0.2em] text-accent">Active Modifiers</h4>
          <Sparkles size={12} className="text-accent" />
        </div>
        {result.effects.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No modifiers — log your day to see effects.</p>
        ) : (
          <ul className="space-y-1.5">
            {result.effects.map((e, i) => {
              const positive = e.pct > 0;
              return (
                <li key={i} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                    <span className={`w-1 h-1 rounded-full ${positive ? 'bg-glow-success' : 'bg-glow-warning'}`} />
                    {e.reason}
                  </span>
                  <span className={`font-display font-bold shrink-0 ${positive ? 'text-glow-success' : 'text-glow-warning'}`}>
                    {positive ? '+' : ''}{Math.round(e.pct * 100)}% {fullLabel(e.stat).split(' ')[0]}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Recovery Quests */}
      {result.recoveryMode && result.recoveryQuests.length > 0 && (
        <div className="system-window rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={12} className="text-glow-warning" />
            <h4 className="font-display text-[10px] uppercase tracking-[0.2em] text-glow-warning">
              Recovery Quests
            </h4>
          </div>
          <div className="space-y-2">
            {result.recoveryQuests.map((q) => (
              <div key={q.title} className="flex items-center justify-between gap-2 p-2.5 rounded-md bg-secondary/40 border border-border">
                <span className="text-[12px] truncate">{q.title}</span>
                <button
                  onClick={() => onAcceptRecoveryQuest(q.title, q.reward)}
                  className="shrink-0 px-2 py-1 rounded bg-glow-warning/15 border border-glow-warning/40 text-glow-warning text-[10px] font-display uppercase tracking-wider hover:bg-glow-warning/25 transition-colors flex items-center gap-1"
                >
                  <Plus size={10} /> Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save */}
      <button
        onClick={save}
        className="w-full py-3.5 rounded-lg bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground font-display text-sm uppercase tracking-[0.2em] font-bold hover:glow-primary active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        {savedFlash ? <><CheckCircle2 size={14} /> Saved</> : <>✦ Log Today</>}
      </button>
    </div>
  );
}

// ─── Sub-controls ───────────────────────────────────────
function SliderRow({
  icon: Icon, label, value, min, max, step, suffix, onChange,
}: { icon: typeof Moon; label: string; value: number; min: number; max: number; step: number; suffix?: string; onChange: (v: number) => void; }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wider font-display">
          <Icon size={12} className="text-primary" /> {label}
        </span>
        <span className="font-display text-xs font-bold text-primary">{value}{suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary h-1 bg-secondary rounded-full appearance-none cursor-pointer"
      />
    </div>
  );
}

function ScaleRow({
  icon: Icon, label, value, onChange,
}: { icon: typeof Moon; label: string; value: number; onChange: (v: number) => void; }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wider font-display">
          <Icon size={12} className="text-primary" /> {label}
        </span>
        <span className="font-display text-xs font-bold text-primary">{value} / 5</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n} onClick={() => onChange(n)}
            className={`py-1.5 rounded text-[11px] font-display border transition-all ${
              value === n
                ? 'bg-primary/20 border-primary/60 text-primary glow-primary'
                : 'bg-secondary/60 border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon, label, value, onChange, danger,
}: { icon: typeof Moon; label: string; value: boolean; onChange: (v: boolean) => void; danger?: boolean; }) {
  const onColor = danger ? 'bg-glow-warning/20 border-glow-warning/50 text-glow-warning' : 'bg-glow-success/15 border-glow-success/40 text-glow-success';
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md border transition-all ${
        value ? onColor : 'bg-secondary/40 border-border text-muted-foreground hover:border-primary/30'
      }`}
    >
      <span className="flex items-center gap-2 text-[12px] font-display uppercase tracking-wider">
        <Icon size={13} /> {label}
      </span>
      <span className="text-[10px] font-display tracking-wider">{value ? 'YES' : 'NO'}</span>
    </button>
  );
}
