// Daily check-in + HP engine + decay
// Soft, never-punishing modifiers driven by real-world inputs.

import {
  type StatKey, type HunterStats, type SystemMessage, createSystemMessage,
} from './game-system';

export interface DailyCheckIn {
  date: string;            // YYYY-MM-DD
  sleepHours: number;      // 0..12
  energy: number;          // 1..5
  mood: number;            // 1..5
  sick: boolean;
  workoutDone: boolean;
  deepWorkHours: number;   // 0..10
  distractionHours: number;// 0..10 (social/screen)
  weight?: number;         // optional kg
}

export type StatModifiers = Partial<Record<StatKey, number>>; // % multipliers, e.g. -0.15

export interface DailyEngineResult {
  hp: number;                       // 0..100 composite
  modifiers: StatModifiers;         // percentage mods applied today
  effects: { stat: StatKey; pct: number; reason: string }[];
  recoveryMode: boolean;
  recoveryQuests: { title: string; reward: Partial<Record<StatKey, number>> }[];
  messages: SystemMessage[];
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultCheckIn(date = todayStr()): DailyCheckIn {
  return {
    date, sleepHours: 7, energy: 3, mood: 3,
    sick: false, workoutDone: false,
    deepWorkHours: 0, distractionHours: 0,
  };
}

// ── HP composite (0..100) ──
export function computeHP(c: DailyCheckIn): number {
  const sleepScore = clamp((c.sleepHours / 8) * 100, 0, 110);     // 8h ≈ 100
  const energyScore = (c.energy / 5) * 100;
  const activityScore = c.workoutDone ? 100 : 60;
  let hp = sleepScore * 0.45 + energyScore * 0.35 + activityScore * 0.2;
  if (c.sick) hp *= 0.7;
  return Math.round(clamp(hp, 0, 100));
}

// ── Modifiers from a check-in ──
export function computeDailyEngine(c: DailyCheckIn): DailyEngineResult {
  const effects: DailyEngineResult['effects'] = [];
  const mods: StatModifiers = {};

  const add = (stat: StatKey, pct: number, reason: string) => {
    mods[stat] = (mods[stat] || 0) + pct;
    effects.push({ stat, pct, reason });
  };

  // ── Sleep → Stamina ──
  if (c.sleepHours < 5)        add('sta', -0.15, `Low sleep (${c.sleepHours}h)`);
  else if (c.sleepHours < 6.5) add('sta', -0.08, `Slightly fatigued (${c.sleepHours}h sleep)`);
  else if (c.sleepHours >= 7 && c.sleepHours <= 9) add('sta', +0.10, `Well-rested (${c.sleepHours}h)`);

  // ── Deep work → Focus ──
  if (c.deepWorkHours >= 3)  add('foc', +0.15, `Deep work ${c.deepWorkHours}h`);
  else if (c.deepWorkHours === 0) add('foc', -0.05, `No deep work logged`);

  // ── Distractions → Focus ──
  if (c.distractionHours >= 5) add('foc', -0.20, `High screen distraction (${c.distractionHours}h)`);
  else if (c.distractionHours >= 3) add('foc', -0.10, `Moderate distraction`);

  // ── Workout → Strength ──
  if (c.workoutDone) add('str', +0.10, `Workout completed`);

  // ── Energy → Discipline / global ──
  if (c.energy <= 2) add('dis', -0.08, `Low energy (${c.energy}/5)`);
  else if (c.energy >= 4) add('dis', +0.05, `High energy (${c.energy}/5)`);

  // ── Mood → EQ / Resilience ──
  if (c.mood <= 2) add('eq', -0.05, `Low mood (${c.mood}/5)`);
  else if (c.mood >= 4) add('eq', +0.05, `Positive mood`);

  // ── Sickness ── (soft, with recovery mode)
  if (c.sick) {
    add('hp', -0.25, `🤒 Sick`);
    add('sta', -0.20, `Sick — stamina drained`);
    add('foc', -0.10, `Sick — clouded focus`);
    add('str', -0.10, `Sick — body weakened`);
  }

  const hp = computeHP(c);
  const recoveryMode = c.sick || hp < 45;

  // ── System messages (Solo-Leveling style) ──
  const messages: SystemMessage[] = [];
  if (c.sick) messages.push(createSystemMessage('🤒 Recovery Mode Activated. Quest difficulty reduced.', 'warning'));
  if (hp < 40 && !c.sick) messages.push(createSystemMessage(`⚠️ Low HP (${hp}). The System recommends rest.`, 'warning'));
  if (c.sleepHours < 5) messages.push(createSystemMessage(`⚠️ Low Sleep — Stamina reduced by 15%`, 'warning'));
  if (c.distractionHours >= 5) messages.push(createSystemMessage(`📱 High distraction detected — Focus reduced 20%`, 'warning'));
  if (c.deepWorkHours >= 3) messages.push(createSystemMessage(`🎯 Deep Work Bonus — Focus +15%`, 'reward'));
  if (c.workoutDone) messages.push(createSystemMessage(`💪 Workout Logged — Strength +10%`, 'reward'));
  if (c.sleepHours >= 7 && c.sleepHours <= 9) messages.push(createSystemMessage(`😴 Well Rested — Stamina +10%`, 'reward'));

  const recoveryQuests = recoveryMode ? [
    { title: 'Drink 3L of water', reward: { hp: 1 } as Partial<Record<StatKey, number>> },
    { title: 'Walk 2,000 steps gently', reward: { sta: 1, hp: 1 } as Partial<Record<StatKey, number>> },
    { title: 'Sleep 8+ hours tonight', reward: { sta: 2, hp: 2 } as Partial<Record<StatKey, number>> },
  ] : [];

  return { hp, modifiers: mods, effects, recoveryMode, recoveryQuests, messages };
}

// ── Decay: applied when days are missed ──
// Returns adjusted stats + messages. Soft (max -2 per stat per check).
export function applyDecay(
  stats: HunterStats,
  history: DailyCheckIn[],
  todaysCheckIn: DailyCheckIn | null,
): { stats: HunterStats; messages: SystemMessage[] } {
  const messages: SystemMessage[] = [];
  const next = { ...stats };

  const recent = history.slice(-7);
  const last = (pred: (c: DailyCheckIn) => boolean) =>
    recent.length === 0 ? Infinity : recent.reverse().findIndex(pred);

  // No workout 5+ days → STR -1
  const lastWorkout = recent.findIndex(c => c.workoutDone);
  if (lastWorkout === -1 && recent.length >= 5) {
    next.str = Math.max(1, next.str - 1);
    messages.push(createSystemMessage(`💤 No workouts in 5+ days — Strength -1`, 'warning'));
  }

  // No deep work 5+ days → FOC -1
  const lastDeep = recent.findIndex(c => c.deepWorkHours >= 1);
  if (lastDeep === -1 && recent.length >= 5) {
    next.foc = Math.max(1, next.foc - 1);
    messages.push(createSystemMessage(`📉 No deep work in 5+ days — Focus -1`, 'warning'));
  }

  // 3+ consecutive low-sleep nights → STA -1
  const lowSleep = recent.slice(-3).every(c => c.sleepHours < 6);
  if (recent.length >= 3 && lowSleep) {
    next.sta = Math.max(1, next.sta - 1);
    messages.push(createSystemMessage(`😵 Bad sleep streak — Stamina -1`, 'warning'));
  }

  // Suppress unused-var warning (last is exported intent but unused in checks above)
  void last;

  return { stats: next, messages };
}

// ── Apply modifiers to an "effective" stats view (non-destructive) ──
export function applyModifiers(stats: HunterStats, mods: StatModifiers): HunterStats {
  const out = { ...stats };
  for (const k of Object.keys(mods) as StatKey[]) {
    const pct = mods[k] || 0;
    out[k] = Math.max(0, Math.round(out[k] * (1 + pct)));
  }
  return out;
}

// ── Quest difficulty adjustment in recovery mode ──
export function adjustQuestRewardsForRecovery<T extends { xpReward: number; coinReward: number }>(
  quest: T, recoveryMode: boolean,
): T {
  if (!recoveryMode) return quest;
  return { ...quest, xpReward: Math.round(quest.xpReward * 1.25), coinReward: Math.round(quest.coinReward * 1.25) };
}

// ── Persistence ──
const STORAGE_KEY = 'solo-leveling-daily';

export interface DailyStore {
  history: DailyCheckIn[];          // chronological
  lastDecayDate?: string;
}

export function loadDaily(): DailyStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DailyStore;
  } catch {}
  return { history: [] };
}

export function saveDaily(s: DailyStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function getTodayCheckIn(s: DailyStore): DailyCheckIn | null {
  const t = todayStr();
  return s.history.find(c => c.date === t) || null;
}

export function upsertCheckIn(s: DailyStore, c: DailyCheckIn): DailyStore {
  const idx = s.history.findIndex(x => x.date === c.date);
  const history = [...s.history];
  if (idx >= 0) history[idx] = c;
  else history.push(c);
  return { ...s, history };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
