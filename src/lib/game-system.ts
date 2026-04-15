export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'boss';
export type QuestType = 'daily' | 'weekly' | 'main' | 'custom';

// ── Core Stats ──
export type CoreStatKey = 'str' | 'sta' | 'dis' | 'foc' | 'int' | 'eq';
// ── Secondary Stats ──
export type SecondaryStatKey = 'tech' | 'cre' | 'com' | 'conf' | 'cons';
// ── Hidden Stats ──
export type HiddenStatKey = 'luk' | 'rep' | 'res' | 'hp';

export type StatKey = CoreStatKey | SecondaryStatKey | HiddenStatKey;

export interface StatInfo {
  key: StatKey;
  label: string;
  fullLabel: string;
  category: 'core' | 'secondary' | 'hidden';
  description: string;
}

export const ALL_STATS: StatInfo[] = [
  // Core
  { key: 'str', label: 'STR', fullLabel: 'Strength', category: 'core', description: 'Physical power, gym, endurance' },
  { key: 'sta', label: 'STA', fullLabel: 'Stamina', category: 'core', description: 'Energy levels, sleep, consistency' },
  { key: 'dis', label: 'DIS', fullLabel: 'Discipline', category: 'core', description: 'Do hard tasks without motivation' },
  { key: 'foc', label: 'FOC', fullLabel: 'Focus', category: 'core', description: 'Deep work, distraction control' },
  { key: 'int', label: 'INT', fullLabel: 'Intelligence', category: 'core', description: 'Learning, problem-solving' },
  { key: 'eq', label: 'EQ', fullLabel: 'Emotional IQ', category: 'core', description: 'Social awareness, emotional control' },
  // Secondary
  { key: 'tech', label: 'TECH', fullLabel: 'Technical Skill', category: 'secondary', description: 'Coding, tools, systems' },
  { key: 'cre', label: 'CRE', fullLabel: 'Creativity', category: 'secondary', description: 'Design, ideas, innovation' },
  { key: 'com', label: 'COM', fullLabel: 'Communication', category: 'secondary', description: 'Speaking, writing, presenting' },
  { key: 'conf', label: 'CONF', fullLabel: 'Confidence', category: 'secondary', description: 'Taking action, public interaction' },
  { key: 'cons', label: 'CONS', fullLabel: 'Consistency', category: 'secondary', description: 'Streaks + long-term reliability' },
  // Hidden
  { key: 'luk', label: 'LUK', fullLabel: 'Luck', category: 'hidden', description: 'Random rewards/events' },
  { key: 'rep', label: 'REP', fullLabel: 'Reputation', category: 'hidden', description: 'Social credibility' },
  { key: 'res', label: 'RES', fullLabel: 'Resilience', category: 'hidden', description: 'Handling failure, stress' },
  { key: 'hp', label: 'HP', fullLabel: 'Health', category: 'hidden', description: 'Physical + mental health' },
];

export type HunterStats = Record<StatKey, number>;

export interface Quest {
  id: string;
  title: string;
  difficulty: Difficulty;
  questType: QuestType;
  xpReward: number;
  coinReward: number;
  statRewards: Partial<Record<StatKey, number>>;
  completed: boolean;
  createdAt: number;
}

export interface SystemMessage {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'reward' | 'event';
  timestamp: number;
  read: boolean;
}

export interface PlayerState {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  rank: Rank;
  stats: HunterStats;
  statPoints: number;
  quests: Quest[];
  coins: number;
  streak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalQuestsCompleted: number;
  dailyQuestsCompleted: number;
  weeklyQuestsCompleted: number;
  lastDailyReset: number;
  lastWeeklyReset: number;
  systemMessages: SystemMessage[];
}

const XP_REWARDS: Record<Difficulty, number> = {
  easy: 20,
  medium: 50,
  hard: 100,
  boss: 250,
};

const COIN_REWARDS: Record<Difficulty, number> = {
  easy: 5,
  medium: 15,
  hard: 30,
  boss: 100,
};

const RANK_THRESHOLDS: { level: number; rank: Rank }[] = [
  { level: 1, rank: 'E' },
  { level: 10, rank: 'D' },
  { level: 20, rank: 'C' },
  { level: 35, rank: 'B' },
  { level: 50, rank: 'A' },
  { level: 75, rank: 'S' },
];

export function getRank(level: number): Rank {
  let rank: Rank = 'E';
  for (const t of RANK_THRESHOLDS) {
    if (level >= t.level) rank = t.rank;
  }
  return rank;
}

export function getXpToNext(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function getXpReward(difficulty: Difficulty): number {
  return XP_REWARDS[difficulty];
}

export function getCoinReward(difficulty: Difficulty): number {
  return COIN_REWARDS[difficulty];
}

export function createQuest(
  title: string,
  difficulty: Difficulty,
  questType: QuestType = 'custom',
  statRewards: Partial<Record<StatKey, number>> = {},
): Quest {
  return {
    id: crypto.randomUUID(),
    title,
    difficulty,
    questType,
    xpReward: XP_REWARDS[difficulty],
    coinReward: COIN_REWARDS[difficulty],
    statRewards,
    completed: false,
    createdAt: Date.now(),
  };
}

export function getDailyQuests(): Quest[] {
  return [
    createQuest('Complete 3 tasks today', 'medium', 'daily', { dis: 1, foc: 1 }),
    createQuest('Review your goals', 'easy', 'daily', { int: 1 }),
    createQuest('Focus session (25 min)', 'hard', 'daily', { foc: 2, dis: 1 }),
  ];
}

export function getWeeklyQuests(): Quest[] {
  return [
    createQuest('Complete all daily quests 5 days', 'boss', 'weekly', { cons: 3, dis: 2 }),
    createQuest('Learn something new', 'hard', 'weekly', { int: 2, tech: 1 }),
    createQuest('Exercise 3 times', 'hard', 'weekly', { str: 2, sta: 2 }),
  ];
}

function getDefaultStats(): HunterStats {
  const stats = {} as HunterStats;
  for (const s of ALL_STATS) {
    stats[s.key] = s.category === 'hidden' ? 1 : 5;
  }
  return stats;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createSystemMessage(text: string, type: SystemMessage['type'] = 'info'): SystemMessage {
  return { id: crypto.randomUUID(), text, type, timestamp: Date.now(), read: false };
}

// Random events
const RANDOM_EVENTS = [
  { text: '⚡ A surge of energy! +5 bonus XP on your next quest.', type: 'event' as const },
  { text: '🎲 The System smiles upon you. +2 LUK.', type: 'reward' as const },
  { text: '🔥 Your discipline is being tested. Stay focused, Hunter.', type: 'warning' as const },
  { text: '💎 Hidden dungeon discovered! Complete a boss quest for 2x rewards.', type: 'event' as const },
  { text: '🧠 Neural pathways strengthening. +1 INT.', type: 'reward' as const },
  { text: '⚔️ A shadow monarch watches your progress...', type: 'info' as const },
];

export function maybeGenerateRandomEvent(): SystemMessage | null {
  if (Math.random() < 0.15) {
    const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    return createSystemMessage(event.text, event.type);
  }
  return null;
}

export function getDefaultState(): PlayerState {
  return {
    name: 'Hunter',
    level: 1,
    xp: 0,
    xpToNext: getXpToNext(1),
    rank: 'E',
    stats: getDefaultStats(),
    statPoints: 0,
    quests: [],
    coins: 0,
    streak: 0,
    bestStreak: 0,
    lastActiveDate: todayStr(),
    totalQuestsCompleted: 0,
    dailyQuestsCompleted: 0,
    weeklyQuestsCompleted: 0,
    lastDailyReset: Date.now(),
    lastWeeklyReset: Date.now(),
    systemMessages: [
      createSystemMessage('Welcome, Hunter. The System has awakened. Complete quests to grow stronger.', 'info'),
    ],
  };
}

export function loadState(): PlayerState {
  try {
    const saved = localStorage.getItem('solo-leveling-state');
    if (saved) {
      const state = JSON.parse(saved) as PlayerState;
      const now = new Date();
      const last = new Date(state.lastDailyReset);

      // Migrate missing fields
      if (!state.coins) state.coins = 0;
      if (!state.streak) state.streak = 0;
      if (!state.bestStreak) state.bestStreak = 0;
      if (!state.lastActiveDate) state.lastActiveDate = todayStr();
      if (!state.weeklyQuestsCompleted) state.weeklyQuestsCompleted = 0;
      if (!state.lastWeeklyReset) state.lastWeeklyReset = Date.now();
      if (!state.systemMessages) state.systemMessages = [];

      // Migrate old stats to new system
      const defaultStats = getDefaultStats();
      for (const key of Object.keys(defaultStats) as StatKey[]) {
        if (state.stats[key] === undefined) state.stats[key] = defaultStats[key];
      }

      // Streak tracking
      const today = todayStr();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      if (state.lastActiveDate !== today) {
        if (state.lastActiveDate === yesterdayStr) {
          // Streak continues
        } else if (state.lastActiveDate !== today) {
          // Streak broken
          if (state.streak > 0) {
            state.systemMessages.push(
              createSystemMessage(`⚠️ Streak broken! You lost your ${state.streak}-day streak. Start again, Hunter.`, 'warning')
            );
          }
          state.streak = 0;
        }
        state.lastActiveDate = today;
      }

      // Daily reset
      if (now.toDateString() !== last.toDateString()) {
        state.quests = state.quests.filter(q => q.questType !== 'daily');
        state.dailyQuestsCompleted = 0;
        state.lastDailyReset = Date.now();
      }

      // Weekly reset (Monday)
      const lastWeekly = new Date(state.lastWeeklyReset);
      const daysSinceWeekly = Math.floor((now.getTime() - lastWeekly.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceWeekly >= 7) {
        state.quests = state.quests.filter(q => q.questType !== 'weekly');
        state.weeklyQuestsCompleted = 0;
        state.lastWeeklyReset = Date.now();
      }

      return state;
    }
  } catch {}
  return getDefaultState();
}

export function saveState(state: PlayerState) {
  localStorage.setItem('solo-leveling-state', JSON.stringify(state));
}

// Suggested stat rewards based on quest title keywords
const STAT_SUGGESTIONS: { keywords: string[]; stats: Partial<Record<StatKey, number>> }[] = [
  { keywords: ['gym', 'workout', 'exercise', 'push-up', 'run', 'lift'], stats: { str: 2, sta: 1 } },
  { keywords: ['leetcode', 'dsa', 'algorithm', 'code', 'program'], stats: { int: 2, tech: 1 } },
  { keywords: ['read', 'study', 'learn', 'course', 'book'], stats: { int: 2, foc: 1 } },
  { keywords: ['meditat', 'journal', 'reflect'], stats: { eq: 2, res: 1 } },
  { keywords: ['social', 'meet', 'network', 'talk', 'present'], stats: { com: 1, conf: 1, eq: 1 } },
  { keywords: ['design', 'create', 'art', 'write', 'blog'], stats: { cre: 2, com: 1 } },
  { keywords: ['focus', 'pomodoro', 'deep work'], stats: { foc: 2, dis: 1 } },
  { keywords: ['sleep', 'rest', 'recover'], stats: { hp: 2, sta: 1 } },
  { keywords: ['project', 'build', 'ship', 'deploy'], stats: { tech: 2, conf: 1, rep: 1 } },
  { keywords: ['interview', 'resume', 'apply'], stats: { conf: 2, com: 1, rep: 1 } },
];

export function suggestStatRewards(title: string): Partial<Record<StatKey, number>> {
  const lower = title.toLowerCase();
  for (const suggestion of STAT_SUGGESTIONS) {
    if (suggestion.keywords.some(k => lower.includes(k))) {
      return { ...suggestion.stats };
    }
  }
  return {};
}
