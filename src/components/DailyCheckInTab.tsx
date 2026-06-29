import { useEffect, useMemo, useState } from 'react';
import {
  type DailyCheckIn, type DailyStore,
  defaultCheckIn, computeDailyEngine, getCheckInByDate, calculateCheckInStreak, todayStr,
} from '@/lib/daily-system';
import { ALL_STATS, type StatKey } from '@/lib/game-system';
import {
  Activity, Moon, Battery, Smile, Dumbbell, Smartphone, Thermometer,
  Sparkles, ShieldAlert, CheckCircle2, Plus, Flame, Beef, CalendarDays, Focus,
} from 'lucide-react';

interface DailyCheckInTabProps {
  store: DailyStore;
  onSave: (c: DailyCheckIn) => void;
  onAcceptRecoveryQuest: (title: string, reward: Partial<Record<StatKey, number>>) => void;
}

export default function DailyCheckInTab({ store, onSave, onAcceptRecoveryQuest }: DailyCheckInTabProps) {
  const today = todayStr();
  const [selectedDate, setSelectedDate] = useState(today);
  const existing = getCheckInByDate(store, selectedDate);
  const [draft, setDraft] = useState<DailyCheckIn>(existing || defaultCheckIn(selectedDate));
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDraft(existing || defaultCheckIn(selectedDate));
  }, [existing, selectedDate]);

  const result = useMemo(() => computeDailyEngine(draft), [draft]);
  const savedResult = useMemo(() => existing ? computeDailyEngine(existing) : null, [existing]);
  const hpDelta = savedResult ? result.hp - savedResult.hp : result.hp;
  const checkInStreak = useMemo(() => calculateCheckInStreak(store.history), [store.history]);

  const set = <K extends keyof DailyCheckIn>(k: K, v: DailyCheckIn[K]) => {
    setDraft((d) => ({ ...d, date: selectedDate, [k]: v }));
  };

  const save = () => {
    onSave({ ...draft, date: selectedDate });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const fullLabel = (k: StatKey) => ALL_STATS.find(s => s.key === k)?.fullLabel || k;

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <section className="rounded-lg bg-card border border-border p-6 shadow-xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/45 font-semibold">Daily Vitals</p>
            <p className="mt-1 text-xs text-white/35">
              {existing ? 'Editing saved check-in' : 'No check-in saved for this date'}
            </p>
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-bold text-white/70">
            <CalendarDays size={14} className="text-white/45" />
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value || today)}
              className="w-[128px] border-0 bg-transparent p-0 text-xs font-bold text-white focus:ring-0"
              aria-label="Check-in date"
            />
          </label>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary border border-border text-white">
            <Activity size={22} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold tracking-tight text-white">
              {result.hp}<span className="text-xs text-white/40 font-medium"> / 100 HP</span>
            </p>
            <p className="text-xs text-white/45 uppercase tracking-wide font-semibold">Overall Vitals Index</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="text-xs font-bold text-white/60">{checkInStreak}d streak</span>
            {savedResult && hpDelta !== 0 && (
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${hpDelta > 0 ? 'bg-white text-black' : 'bg-secondary text-white/70 border border-border'}`}>
                {hpDelta > 0 ? '+' : ''}{hpDelta} HP
              </span>
            )}
            {result.recoveryMode && (
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                Recovery
              </span>
            )}
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded bg-secondary border border-border/60">
          <div className="h-full bg-white transition-all duration-300" style={{ width: `${result.hp}%` }} />
        </div>
      </section>

      <section className="rounded-lg bg-card border border-border p-6 space-y-6">
        <h4 className="border-b border-border/60 pb-3 text-xs uppercase tracking-wide text-white/45 font-semibold">Daily Log Inputs</h4>

        <SliderRow icon={Moon} label="Sleep Duration" value={draft.sleepHours} min={0} max={12} step={0.5} suffix="h"
          onChange={(v) => set('sleepHours', v)} />
        <ScaleRow icon={Battery} label="Energy Level" value={draft.energy} onChange={(v) => set('energy', v)} />
        <ScaleRow icon={Smile} label="Mental Mood" value={draft.mood} onChange={(v) => set('mood', v)} />
        <SliderRow icon={Focus} label="Deep Work" value={draft.deepWorkHours} min={0} max={10} step={0.5} suffix="h"
          onChange={(v) => set('deepWorkHours', v)} />
        <SliderRow icon={Smartphone} label="Distraction Time" value={draft.distractionHours} min={0} max={10} step={0.5} suffix="h"
          onChange={(v) => set('distractionHours', v)} />

        <ToggleRow icon={Dumbbell} label="Workout Logged" value={draft.workoutDone}
          onChange={(v) => set('workoutDone', v)} />
        <ToggleRow icon={Thermometer} label="Feeling Sick Today" value={draft.sick}
          onChange={(v) => set('sick', v)} />

        <NumberRow icon={Flame} label="Calorie Intake" value={draft.calories ?? 0} suffix="kcal" step={50}
          onChange={(v) => set('calories', v)} />
        <NumberRow icon={Beef} label="Protein Intake" value={draft.protein ?? 0} suffix="g" step={5}
          onChange={(v) => set('protein', v)} />
      </section>

      <section className="rounded-lg bg-card border border-border p-6">
        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
          <h4 className="text-xs uppercase tracking-wide text-white/45 font-semibold">Active Modifiers</h4>
          <Sparkles size={14} className="text-white/45" />
        </div>
        {result.effects.length === 0 ? (
          <p className="text-sm text-white/45 font-medium">Log your check-in to compute active stat modifiers.</p>
        ) : (
          <ul className="space-y-3">
            {result.effects.map((e, i) => {
              const positive = e.pct > 0;
              return (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-white/65 font-semibold">
                    <span className={`h-2 w-2 rounded-full ${positive ? 'bg-white' : 'bg-white/20'}`} />
                    <span className="truncate">{e.reason}</span>
                  </span>
                  <span className="font-bold tabular-nums text-white shrink-0">
                    {positive ? '+' : ''}{Math.round(e.pct * 100)}% {fullLabel(e.stat)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {result.recoveryMode && result.recoveryQuests.length > 0 && (
        <section className="rounded-lg bg-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <ShieldAlert size={16} className="text-white/80" />
            <h4 className="text-xs uppercase tracking-wide text-white/60 font-semibold">Recovery Quests Recommended</h4>
          </div>
          <div className="space-y-3">
            {result.recoveryQuests.map((q) => (
              <div key={q.title} className="flex items-center justify-between gap-3 rounded-lg bg-secondary border border-border p-4">
                <span className="truncate text-sm text-white/80 font-bold">{q.title}</span>
                <button
                  onClick={() => onAcceptRecoveryQuest(q.title, q.reward)}
                  className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg bg-white px-4 text-xs font-bold uppercase tracking-wide text-black transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Plus size={14} strokeWidth={2.5} /> Accept
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <button
        onClick={save}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-xs font-bold uppercase tracking-wide text-black shadow-lg transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {savedFlash ? <><CheckCircle2 size={16} /> Check-In Saved</> : <>{existing ? 'Update Check-In' : 'Complete Daily Check-In'}</>}
      </button>
    </div>
  );
}

function SliderRow({
  icon: Icon, label, value, min, max, step, suffix, onChange,
}: { icon: any; label: string; value: number; min: number; max: number; step: number; suffix?: string; onChange: (v: number) => void; }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs text-white/55 uppercase tracking-wide font-semibold">
          <Icon size={14} className="text-white/45" /> {label}
        </span>
        <span className="text-sm font-bold text-white tabular-nums">{value}{suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-secondary border border-border rounded appearance-none cursor-pointer accent-white"
      />
    </div>
  );
}

function ScaleRow({
  icon: Icon, label, value, onChange,
}: { icon: any; label: string; value: number; onChange: (v: number) => void; }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs text-white/55 uppercase tracking-wide font-semibold">
          <Icon size={14} className="text-white/45" /> {label}
        </span>
        <span className="text-sm font-bold text-white tabular-nums">{value} / 5</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n} onClick={() => onChange(n)}
            className={`min-h-11 rounded-lg text-xs font-bold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              value === n
                ? 'bg-white border-white text-black'
                : 'bg-secondary border-border text-white/55 hover:border-white/30'
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
  icon: Icon, label, value, onChange,
}: { icon: any; label: string; value: boolean; onChange: (v: boolean) => void; }) {
  const onClass = 'bg-white border-white text-black';
  const offClass = 'bg-secondary border-border text-white/45 hover:border-white/30';

  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex min-h-12 w-full items-center justify-between rounded-lg border px-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${value ? onClass : offClass}`}
    >
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        <Icon size={14} /> {label}
      </span>
      <span className="text-xs font-bold tracking-wide">{value ? 'YES' : 'NO'}</span>
    </button>
  );
}

function NumberRow({
  icon: Icon, label, value, suffix, step = 1, onChange,
}: { icon: any; label: string; value: number; suffix?: string; step?: number; onChange: (v: number) => void; }) {
  const dec = () => onChange(Math.max(0, value - step));
  const inc = () => onChange(value + step);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs text-white/55 uppercase tracking-wide font-semibold">
          <Icon size={14} className="text-white/45" /> {label}
        </span>
        <span className="text-sm font-bold text-white tabular-nums">{value}{suffix}</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={dec}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary border border-border text-white/60 transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          -
        </button>
        <input
          type="number" inputMode="numeric" min={0} value={value}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value || '0', 10)))}
          className="min-h-11 flex-1 rounded-lg bg-secondary border border-border px-3 text-center text-sm font-bold tabular-nums text-white focus:outline-none focus:border-white"
        />
        <button onClick={inc}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary border border-border text-white/60 transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          +
        </button>
      </div>
    </div>
  );
}