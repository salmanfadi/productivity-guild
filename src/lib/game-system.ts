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

// ── Quest Categories ──
export type QuestCategory =
  | 'fitness' | 'coding' | 'study' | 'career'
  | 'social' | 'mindfulness' | 'creative' | 'health';

export interface CategoryInfo {
  key: QuestCategory;
  label: string;
  emoji: string;
  primaryStats: StatKey[];
}

export const QUEST_CATEGORIES: CategoryInfo[] = [
  { key: 'fitness',     label: 'Fitness',     emoji: '💪', primaryStats: ['str', 'sta'] },
  { key: 'coding',      label: 'Coding',      emoji: '💻', primaryStats: ['tech', 'int'] },
  { key: 'study',       label: 'Study',       emoji: '📚', primaryStats: ['int', 'foc'] },
  { key: 'career',      label: 'Career',      emoji: '🎯', primaryStats: ['conf', 'rep'] },
  { key: 'social',      label: 'Social',      emoji: '🗣', primaryStats: ['com', 'eq'] },
  { key: 'mindfulness', label: 'Mindfulness', emoji: '🧘', primaryStats: ['eq', 'res'] },
  { key: 'creative',    label: 'Creative',    emoji: '🎨', primaryStats: ['cre', 'com'] },
  { key: 'health',      label: 'Health',      emoji: '🩺', primaryStats: ['hp', 'sta'] },
];

export interface Quest {
  id: string;
  title: string;
  difficulty: Difficulty;
  questType: QuestType;
  category?: QuestCategory;
  xpReward: number;
  coinReward: number;
  statRewards: Partial<Record<StatKey, number>>;
  completed: boolean;
  createdAt: number;
  mainQuestId?: string;
}

// ── Main Quests ──
export interface MainQuestSub {
  id: string;
  title: string;
  done: boolean;
}

export interface MainQuest {
  id: string;
  title: string;
  description?: string;
  category?: QuestCategory;
  subquests: MainQuestSub[];
  xpReward: number;
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
  mainQuests: MainQuest[];
  coins: number;
  streak: number;
  bestStreak: number;
  lastActiveDate: string;
  totalQuestsCompleted: number;
  dailyQuestsCompleted: number;
  weeklyQuestsCompleted: number;
  lastDailyReset: number;
  lastWeeklyReset: number;
  systemMessages: SystemMessage[];
  activeRole?: string;
  unlockedRoles?: string[];
}

// ── ROLE / IDENTITY SYSTEM ──
export type RoleTier = 'beginner' | 'standard' | 'elite' | 'rare';
export type RolePath = 'beginner' | 'physical' | 'tech' | 'intelligence' | 'social' | 'discipline' | 'hybrid';

export interface Role {
  id: string;
  name: string;
  tier: RoleTier;
  path: RolePath;
  requirements: Partial<Record<StatKey, number>>;
  description: string;
}

export const ALL_ROLES: Role[] = [
  // Beginner
  { id: 'initiate', name: 'Initiate', tier: 'beginner', path: 'beginner', requirements: {}, description: 'Your journey begins. Complete your first quests.' },
  { id: 'disciplined-rookie', name: 'Disciplined Rookie', tier: 'beginner', path: 'beginner', requirements: { dis: 15, cons: 10 }, description: 'Showing early signs of consistency.' },
  { id: 'focused-learner', name: 'Focused Learner', tier: 'beginner', path: 'beginner', requirements: { foc: 20, int: 20 }, description: 'A sharp mind taking shape.' },

  // Physical
  { id: 'active-individual', name: 'Active Individual', tier: 'standard', path: 'physical', requirements: { str: 20, sta: 20 }, description: 'You move. You sweat. You grow.' },
  { id: 'athlete', name: 'Athlete', tier: 'standard', path: 'physical', requirements: { str: 50, sta: 50 }, description: 'Disciplined body, tested in motion.' },
  { id: 'endurance-warrior', name: 'Endurance Warrior', tier: 'elite', path: 'physical', requirements: { sta: 75, dis: 50, hp: 30 }, description: 'Pain is just data.' },
  { id: 'elite-performer', name: 'Elite Performer', tier: 'elite', path: 'physical', requirements: { str: 80, sta: 80, dis: 60 }, description: 'Top of the human curve.' },

  // Tech
  { id: 'code-apprentice', name: 'Code Apprentice', tier: 'beginner', path: 'tech', requirements: { tech: 20, int: 20 }, description: 'Hello, world.' },
  { id: 'developer', name: 'Developer', tier: 'standard', path: 'tech', requirements: { tech: 40, int: 35, foc: 30 }, description: 'You build things that work.' },
  { id: 'system-builder', name: 'System Builder', tier: 'standard', path: 'tech', requirements: { tech: 55, int: 50, foc: 45 }, description: 'Architectures live in your head.' },
  { id: 'algorithm-solver', name: 'Algorithm Solver', tier: 'elite', path: 'tech', requirements: { int: 60, tech: 60, foc: 50 }, description: 'Complexity bends to you.' },
  { id: 'software-engineer', name: 'Software Engineer', tier: 'elite', path: 'tech', requirements: { tech: 70, int: 60, foc: 55, dis: 50 }, description: 'Ship. Iterate. Repeat.' },
  { id: 'architect', name: 'Architect', tier: 'rare', path: 'tech', requirements: { tech: 85, int: 80, foc: 70, dis: 65 }, description: 'You design the systems others build inside.' },

  // Intelligence
  { id: 'student', name: 'Student', tier: 'beginner', path: 'intelligence', requirements: { int: 25, foc: 20 }, description: 'Hungry to learn.' },
  { id: 'analyst', name: 'Analyst', tier: 'standard', path: 'intelligence', requirements: { int: 50, foc: 40 }, description: 'Patterns reveal themselves to you.' },
  { id: 'strategist', name: 'Strategist', tier: 'elite', path: 'intelligence', requirements: { int: 65, foc: 55, dis: 45 }, description: 'You play three moves ahead.' },
  { id: 'problem-solver', name: 'Problem Solver', tier: 'elite', path: 'intelligence', requirements: { int: 75, foc: 65, cre: 50 }, description: 'No problem is unsolvable.' },

  // Social
  { id: 'communicator', name: 'Communicator', tier: 'beginner', path: 'social', requirements: { com: 25, eq: 20 }, description: 'You make ideas clear.' },
  { id: 'influencer', name: 'Influencer', tier: 'standard', path: 'social', requirements: { com: 50, conf: 45, rep: 25 }, description: 'People listen when you speak.' },
  { id: 'leader', name: 'Leader', tier: 'elite', path: 'social', requirements: { eq: 60, com: 60, conf: 55, dis: 50 }, description: 'Others rally to your direction.' },
  { id: 'negotiator', name: 'Negotiator', tier: 'elite', path: 'social', requirements: { eq: 70, com: 65, conf: 60, int: 50 }, description: 'You shape outcomes through dialogue.' },

  // Discipline
  { id: 'consistent-performer', name: 'Consistent Performer', tier: 'standard', path: 'discipline', requirements: { dis: 50, cons: 50 }, description: 'You show up. Every day.' },
  { id: 'relentless', name: 'Relentless', tier: 'elite', path: 'discipline', requirements: { dis: 70, cons: 70, res: 40 }, description: 'Stopping is not an option.' },
  { id: 'unstoppable', name: 'Unstoppable', tier: 'rare', path: 'discipline', requirements: { dis: 85, cons: 85, res: 60, sta: 50 }, description: 'A force of pure will.' },

  // Hybrid / S-rank
  { id: 'founder', name: 'Founder', tier: 'rare', path: 'hybrid', requirements: { tech: 60, com: 60, conf: 60, dis: 70 }, description: 'You build worlds from nothing.' },
  { id: 'data-scientist', name: 'Data Scientist', tier: 'rare', path: 'hybrid', requirements: { int: 70, tech: 65, foc: 60 }, description: 'The numbers speak through you.' },
  { id: 'athlete-programmer', name: 'Athlete Programmer', tier: 'rare', path: 'hybrid', requirements: { str: 50, sta: 50, tech: 60, foc: 50 }, description: 'Body and mind, both sharpened.' },
  { id: 'strategic-leader', name: 'Strategic Leader', tier: 'rare', path: 'hybrid', requirements: { int: 70, eq: 65, com: 65, dis: 60 }, description: 'You see the board. You move the pieces.' },
  { id: 'elite-operator', name: 'Elite Operator', tier: 'rare', path: 'hybrid', requirements: { str: 60, int: 60, foc: 60, dis: 60, conf: 55, res: 50 }, description: 'Balanced excellence. The rarest path.' },
];

export function getRoleProgress(role: Role, stats: HunterStats): number {
  const reqs = Object.entries(role.requirements);
  if (reqs.length === 0) return 1;
  const ratios = reqs.map(([k, need]) => Math.min(stats[k as StatKey] / (need as number), 1));
  return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}

export function isRoleUnlocked(role: Role, stats: HunterStats): boolean {
  return Object.entries(role.requirements).every(([k, need]) => stats[k as StatKey] >= (need as number));
}

export function getUnlockedRoles(stats: HunterStats): Role[] {
  return ALL_ROLES.filter(r => isRoleUnlocked(r, stats));
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
    activeRole: 'initiate',
    unlockedRoles: ['initiate'],
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
      if (!state.unlockedRoles) state.unlockedRoles = ['initiate'];
      if (!state.activeRole) state.activeRole = 'initiate';

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
