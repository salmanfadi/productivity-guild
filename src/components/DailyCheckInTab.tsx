import { useMemo, useState } from 'react';
import {
  type DailyCheckIn, type DailyStore,
  defaultCheckIn, computeDailyEngine, getTodayCheckIn, upsertCheckIn, todayStr,
} from '@/lib/daily-system';
import { ALL_STATS, type StatKey } from '@/lib/game-system';
import {
  Activity, Moon, Battery, Smile, Dumbbell, BrainCircuit, Smartphone, Thermometer,
  Sparkles, ShieldAlert, CheckCircle2, Plus, Flame, Beef,
} from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="space-y-6 animate-slide-up pb-10">
      {/* HP Score Header Card */}
      <div className="rounded-[28px] bg-[#111111] border border-[#2A2A2A] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold">DAILY VITALS</p>
          <p className="text-[10px] text-white/30 font-bold">{today}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-white">
            <Activity size={22} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold tracking-tight text-white">{result.hp}<span className="text-xs text-white/40 font-medium"> / 100 HP</span></p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Overall Vitals Index</p>
          </div>
          {result.recoveryMode && (
            <span className="px-3 py-1 rounded-full bg-white text-black text-[9px] font-bold uppercase tracking-widest border border-white">
              Recovery
            </span>
          )}
        </div>
        <div className="mt-5 h-2 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#2A2A2A]/40">
          <div
            className="h-full bg-white transition-all duration-700 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            style={{ width: `${result.hp}%` }}
          />
        </div>
      </div>

      {/* Input Sliders & Scale Toggles */}
      <div className="rounded-[28px] bg-[#111111] border border-[#2A2A2A] p-6 space-y-6">
        <h4 className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold border-b border-[#2A2A2A]/40 pb-3">Daily Log Inputs</h4>

        <SliderRow icon={Moon}    label="Sleep Duration" value={draft.sleepHours} min={0} max={12} step={0.5} suffix="h"
                   onChange={(v) => set('sleepHours', v)} />
        <ScaleRow  icon={Battery} label="Energy Level" value={draft.energy} onChange={(v) => set('energy', v)} />
        <ScaleRow  icon={Smile}   label="Mental Mood"   value={draft.mood}   onChange={(v) => set('mood', v)} />

        <ToggleRow icon={Dumbbell}    label="Workout Logged" value={draft.workoutDone}
                   onChange={(v) => set('workoutDone', v)} />
        <ToggleRow icon={Thermometer} label="Feeling Sick Today" value={draft.sick} danger
                   onChange={(v) => set('sick', v)} />

        <NumberRow icon={Flame} label="Calorie Intake" value={draft.calories ?? 0} suffix="kcal" step={50}
                   onChange={(v) => set('calories', v)} />
        <NumberRow icon={Beef}  label="Protein Intake" value={draft.protein ?? 0}  suffix="g"    step={5}
                   onChange={(v) => set('protein', v)} />
      </div>

      {/* Active Modifiers */}
      <div className="rounded-[28px] bg-[#111111] border border-[#2A2A2A] p-6">
        <div className="flex items-center justify-between mb-4 border-b border-[#2A2A2A]/40 pb-3">
          <h4 className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold">Active Modifiers</h4>
          <Sparkles size={13} className="text-white/40" />
        </div>
        {result.effects.length === 0 ? (
          <p className="text-[12px] text-white/40 italic font-semibold">Log your check-in to compute active stat modifiers.</p>
        ) : (
          <ul className="space-y-3">
            {result.effects.map((e, i) => {
              const positive = e.pct > 0;
              return (
                <li key={i} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-2 text-white/60 font-semibold truncate">
                    <span className={`w-1.5 h-1.5 rounded-full ${positive ? 'bg-white' : 'bg-white/20'}`} />
                    {e.reason}
                  </span>
                  <span className="font-bold tabular-nums text-white shrink-0">
                    {positive ? '+' : ''}{Math.round(e.pct * 100)}% {fullLabel(e.stat)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Recovery Quests */}
      {result.recoveryMode && result.recoveryQuests.length > 0 && (
        <div className="rounded-[28px] bg-[#111111] border border-[#2A2A2A] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#2A2A2A]/40 pb-3">
            <ShieldAlert size={14} className="text-white/80" />
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold">
              Recovery Quests recommended
            </h4>
          </div>
          <div className="space-y-3">
            {result.recoveryQuests.map((q) => (
              <div key={q.title} className="flex items-center justify-between gap-3 p-4 rounded-[20px] bg-[#1A1A1A] border border-[#2A2A2A]">
                <span className="text-[13px] text-white/80 font-bold truncate">{q.title}</span>
                <button
                  onClick={() => onAcceptRecoveryQuest(q.title, q.reward)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-wider hover:bg-white/80 active:scale-95 transition-all flex items-center gap-1"
                >
                  <Plus size={12} strokeWidth={2.5} /> Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={save}
        className="w-full py-4 rounded-[24px] bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg"
      >
        {savedFlash ? <><CheckCircle2 size={16} /> Check-In Logged</> : <>✦ Complete Daily Check-In</>}
      </button>
    </div>
  );
}

// ─── Sub-controls ───────────────────────────────────────
function SliderRow({
  icon: Icon, label, value, min, max, step, suffix, onChange,
}: { icon: any; label: string; value: number; min: number; max: number; step: number; suffix?: string; onChange: (v: number) => void; }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[11px] text-white/50 uppercase tracking-wider font-semibold">
          <Icon size={14} className="text-white/40" /> {label}
        </span>
        <span className="text-xs font-bold text-white tabular-nums">{value}{suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full appearance-none cursor-pointer accent-white"
      />
    </div>
  );
}

function ScaleRow({
  icon: Icon, label, value, onChange,
}: { icon: any; label: string; value: number; onChange: (v: number) => void; }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[11px] text-white/50 uppercase tracking-wider font-semibold">
          <Icon size={14} className="text-white/40" /> {label}
        </span>
        <span className="text-xs font-bold text-white tabular-nums">{value} / 5</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n} onClick={() => onChange(n)}
            className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
              value === n
                ? 'bg-white border-white text-black'
                : 'bg-[#1A1A1A] border-[#2A2A2A] text-white/50 hover:border-white/30'
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
}: { icon: any; label: string; value: boolean; onChange: (v: boolean) => void; danger?: boolean; }) {
  const onClass = 'bg-white border-white text-black';
  const offClass = 'bg-[#1A1A1A] border-[#2A2A2A] text-white/40 hover:border-white/20';

  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
        value ? onClass : offClass
      }`}
    >
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
        <Icon size={14} /> {label}
      </span>
      <span className="text-[10px] font-bold tracking-widest">{value ? 'YES' : 'NO'}</span>
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
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[11px] text-white/50 uppercase tracking-wider font-semibold">
          <Icon size={14} className="text-white/40" /> {label}
        </span>
        <span className="text-xs font-bold text-white tabular-nums">{value}{suffix}</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={dec}
          className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-white/60 hover:border-white/30 active:scale-95 transition-all flex items-center justify-center font-bold">
          −
        </button>
        <input
          type="number" inputMode="numeric" min={0} value={value}
          onChange={(e) => onChange(Math.max(0, parseInt(e.target.value || '0', 10)))}
          className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm text-white text-center font-bold tabular-nums focus:outline-none focus:border-white transition-all"
        />
        <button onClick={inc}
          className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-white/60 hover:border-white/30 active:scale-95 transition-all flex items-center justify-center font-bold">
          +
        </button>
      </div>
    </div>
  );
}
