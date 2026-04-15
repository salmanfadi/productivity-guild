export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'boss';
export type StatKey = 'str' | 'int' | 'vit' | 'agi' | 'per';

export interface HunterStats {
  str: number;
  int: number;
  vit: number;
  agi: number;
  per: number;
}

export interface Quest {
  id: string;
  title: string;
  difficulty: Difficulty;
  xpReward: number;
  completed: boolean;
  createdAt: number;
  isDaily?: boolean;
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
  totalQuestsCompleted: number;
  dailyQuestsCompleted: number;
  lastDailyReset: number;
}

const XP_REWARDS: Record<Difficulty, number> = {
  easy: 20,
  medium: 50,
  hard: 100,
  boss: 250,
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

export function createQuest(title: string, difficulty: Difficulty, isDaily = false): Quest {
  return {
    id: crypto.randomUUID(),
    title,
    difficulty,
    xpReward: XP_REWARDS[difficulty],
    completed: false,
    createdAt: Date.now(),
    isDaily,
  };
}

export function getDailyQuests(): Quest[] {
  return [
    createQuest('Complete 3 tasks today', 'medium', true),
    createQuest('Review your goals', 'easy', true),
    createQuest('Focus session (25 min)', 'hard', true),
  ];
}

export function getDefaultState(): PlayerState {
  return {
    name: 'Hunter',
    level: 1,
    xp: 0,
    xpToNext: getXpToNext(1),
    rank: 'E',
    stats: { str: 5, int: 5, vit: 5, agi: 5, per: 5 },
    statPoints: 0,
    quests: [],
    totalQuestsCompleted: 0,
    dailyQuestsCompleted: 0,
    lastDailyReset: Date.now(),
  };
}

export function loadState(): PlayerState {
  try {
    const saved = localStorage.getItem('solo-leveling-state');
    if (saved) {
      const state = JSON.parse(saved) as PlayerState;
      // Check daily reset
      const now = new Date();
      const last = new Date(state.lastDailyReset);
      if (now.toDateString() !== last.toDateString()) {
        state.quests = state.quests.filter(q => !q.isDaily);
        state.dailyQuestsCompleted = 0;
        state.lastDailyReset = Date.now();
      }
      return state;
    }
  } catch {}
  return getDefaultState();
}

export function saveState(state: PlayerState) {
  localStorage.setItem('solo-leveling-state', JSON.stringify(state));
}
