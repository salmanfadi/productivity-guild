export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'boss';
export type QuestType = 'daily' | 'weekly' | 'main' | 'custom';

// ── Core Stats ──
export type StatKey = 'str' | 'sta' | 'dis' | 'foc' | 'int' | 'tech' | 'com' | 'conf';

export interface StatInfo {
  key: StatKey;
  label: string;
  fullLabel: string;
  category: 'core' | 'secondary';
  description: string;
}

export const ALL_STATS: StatInfo[] = [
  { key: 'str', label: 'STR', fullLabel: 'Strength', category: 'core', description: 'Physical power, workouts, and energy' },
  { key: 'sta', label: 'STA', fullLabel: 'Stamina', category: 'core', description: 'Sleep quality, endurance, and wellness' },
  { key: 'dis', label: 'DIS', fullLabel: 'Discipline', category: 'core', description: 'Consistency, task completion, and habit' },
  { key: 'foc', label: 'FOC', fullLabel: 'Focus', category: 'core', description: 'Deep work and distraction control' },
  { key: 'int', label: 'INT', fullLabel: 'Intelligence', category: 'core', description: 'Problem-solving, reading, and learning' },
  { key: 'tech', label: 'TECH', fullLabel: 'Technical Skill', category: 'secondary', description: 'Coding, tools, and technical execution' },
  { key: 'com', label: 'COM', fullLabel: 'Communication', category: 'secondary', description: 'Writing, speaking, and collaboration' },
  { key: 'conf', label: 'CONF', fullLabel: 'Confidence', category: 'secondary', description: 'Action, networking, and public interactions' },
];

export type HunterStats = Record<StatKey, number>;

export type QuestCategory = 'fitness' | 'coding' | 'study' | 'career' | 'social' | 'mindfulness' | 'creative' | 'health';

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
  { key: 'career',      label: 'Career',      emoji: '🎯', primaryStats: ['conf', 'dis'] },
  { key: 'social',      label: 'Social',      emoji: '🗣', primaryStats: ['com', 'conf'] },
  { key: 'mindfulness', label: 'Mindfulness', emoji: '🧘', primaryStats: ['foc', 'sta'] },
  { key: 'creative',    label: 'Creative',    emoji: '🎨', primaryStats: ['tech', 'com'] },
  { key: 'health',      label: 'Health',      emoji: '🩺', primaryStats: ['sta', 'str'] },
];

export interface Quest {
  id: string;
  title: string;
  description?: string;
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
  { id: 'disciplined-rookie', name: 'Disciplined Rookie', tier: 'beginner', path: 'beginner', requirements: { dis: 15 }, description: 'Showing early signs of consistency.' },
  { id: 'focused-learner', name: 'Focused Learner', tier: 'beginner', path: 'beginner', requirements: { foc: 20, int: 20 }, description: 'A sharp mind taking shape.' },

  // Physical
  { id: 'active-individual', name: 'Active Individual', tier: 'standard', path: 'physical', requirements: { str: 20, sta: 20 }, description: 'You move. You sweat. You grow.' },
  { id: 'athlete', name: 'Athlete', tier: 'standard', path: 'physical', requirements: { str: 50, sta: 50 }, description: 'Disciplined body, tested in motion.' },
  { id: 'endurance-warrior', name: 'Endurance Warrior', tier: 'elite', path: 'physical', requirements: { sta: 75, dis: 50 }, description: 'Pain is just data.' },
  { id: 'elite-performer', name: 'Elite Performer', tier: 'elite', path: 'physical', requirements: { str: 80, sta: 80, dis: 60 }, description: 'Top of the human curve.' },

  // Tech
  { id: 'code-apprentice', name: 'Code Apprentice', tier: 'beginner', path: 'tech', requirements: { tech: 20, int: 20 }, description: 'Hello, world.' },
  { id: 'developer', name: 'Developer', tier: 'standard', path: 'tech', requirements: { tech: 40, int: 35, foc: 30 }, description: 'You build things that work.' },
  { id: 'system-builder', name: 'System Builder', tier: 'standard', path: 'tech', requirements: { tech: 55, int: 50, foc: 45 }, description: 'Architectures live in your head.' },
  { id: 'algorithm-solver', name: 'Algorithm Solver', tier: 'elite', path: 'tech', requirements: { int: 70, tech: 70, foc: 60 }, description: 'Complexity bends to you.' },
  { id: 'software-engineer', name: 'Software Engineer', tier: 'elite', path: 'tech', requirements: { tech: 70, int: 60, foc: 55, dis: 50 }, description: 'Ship. Iterate. Repeat.' },
  { id: 'architect', name: 'Architect', tier: 'rare', path: 'tech', requirements: { tech: 85, int: 80, foc: 70, dis: 65 }, description: 'You design the systems others build inside.' },

  // Intelligence
  { id: 'student', name: 'Student', tier: 'beginner', path: 'intelligence', requirements: { int: 25, foc: 20 }, description: 'Hungry to learn.' },
  { id: 'analyst', name: 'Analyst', tier: 'standard', path: 'intelligence', requirements: { int: 50, foc: 40 }, description: 'Patterns reveal themselves to you.' },
  { id: 'strategist', name: 'Strategist', tier: 'elite', path: 'intelligence', requirements: { int: 65, foc: 55, dis: 45 }, description: 'You play three moves ahead.' },
  { id: 'problem-solver', name: 'Problem Solver', tier: 'elite', path: 'intelligence', requirements: { int: 75, foc: 65 }, description: 'No problem is unsolvable.' },

  // Social
  { id: 'communicator', name: 'Communicator', tier: 'beginner', path: 'social', requirements: { com: 25 }, description: 'You make ideas clear.' },
  { id: 'influencer', name: 'Influencer', tier: 'standard', path: 'social', requirements: { com: 50, conf: 45 }, description: 'People listen when you speak.' },
  { id: 'leader', name: 'Leader', tier: 'elite', path: 'social', requirements: { com: 60, conf: 55, dis: 50 }, description: 'Others rally to your direction.' },
  { id: 'negotiator', name: 'Negotiator', tier: 'elite', path: 'social', requirements: { com: 65, conf: 60, int: 50 }, description: 'You shape outcomes through dialogue.' },

  // Discipline
  { id: 'consistent-performer', name: 'Consistent Performer', tier: 'standard', path: 'discipline', requirements: { dis: 50 }, description: 'You show up. Every day.' },
  { id: 'relentless', name: 'Relentless', tier: 'elite', path: 'discipline', requirements: { dis: 70 }, description: 'Stopping is not an option.' },
  { id: 'unstoppable', name: 'Unstoppable', tier: 'rare', path: 'discipline', requirements: { dis: 85, sta: 50 }, description: 'A force of pure will.' },

  // Hybrid / S-rank
  { id: 'founder', name: 'Founder', tier: 'rare', path: 'hybrid', requirements: { tech: 60, com: 60, conf: 60, dis: 70 }, description: 'You build worlds from nothing.' },
  { id: 'data-scientist', name: 'Data Scientist', tier: 'rare', path: 'hybrid', requirements: { int: 70, tech: 65, foc: 60 }, description: 'The numbers speak through you.' },
  { id: 'athlete-programmer', name: 'Athlete Programmer', tier: 'rare', path: 'hybrid', requirements: { str: 50, sta: 50, tech: 60, foc: 50 }, description: 'Body and mind, both sharpened.' },
  { id: 'strategic-leader', name: 'Strategic Leader', tier: 'rare', path: 'hybrid', requirements: { int: 70, com: 65, dis: 60 }, description: 'You see the board. You move the pieces.' },
  { id: 'elite-operator', name: 'Elite Operator', tier: 'rare', path: 'hybrid', requirements: { str: 60, int: 60, foc: 60, dis: 60, conf: 55 }, description: 'Balanced excellence. The rarest path.' },
];

export function getRoleProgress(role: Role, stats: HunterStats): number {
  const reqs = Object.entries(role.requirements);
  if (reqs.length === 0) return 1;
  const ratios = reqs.map(([k, need]) => Math.min((stats[k as StatKey] || 0) / (need as number), 1));
  return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}

export function isRoleUnlocked(role: Role, stats: HunterStats): boolean {
  return Object.entries(role.requirements).every(([k, need]) => (stats[k as StatKey] || 0) >= (need as number));
}

export function getUnlockedRoles(stats: HunterStats): Role[] {
  return ALL_ROLES.filter(r => isRoleUnlocked(r, stats));
}

const XP_REWARDS: Record<Difficulty, number> = {
  easy: 15,
  medium: 30,
  hard: 60,
  boss: 120,
};

const COIN_REWARDS: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 20,
  boss: 50,
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
  category?: QuestCategory,
  mainQuestId?: string,
): Quest {
  return {
    id: crypto.randomUUID(),
    title,
    difficulty,
    questType,
    category: category ?? suggestCategory(title),
    xpReward: XP_REWARDS[difficulty],
    coinReward: COIN_REWARDS[difficulty],
    statRewards,
    completed: false,
    createdAt: Date.now(),
    mainQuestId,
  };
}

export function createMainQuest(
  title: string,
  subTitles: string[],
  category?: QuestCategory,
  description?: string,
): MainQuest {
  return {
    id: crypto.randomUUID(),
    title,
    description,
    category: category ?? suggestCategory(title),
    subquests: subTitles.filter(t => t.trim()).map(t => ({
      id: crypto.randomUUID(),
      title: t.trim(),
      done: false,
    })),
    xpReward: 150 + subTitles.length * 25,
    completed: false,
    createdAt: Date.now(),
  };
}

export function getDailyQuests(): Quest[] {
  return [
    createQuest('Complete 3 tasks today', 'medium', 'daily', { dis: 1, foc: 1 }, 'mindfulness'),
    createQuest('Review your goals', 'easy', 'daily', { int: 1 }, 'study'),
    createQuest('Focus session (25 min)', 'hard', 'daily', { foc: 2 }, 'study'),
  ];
}

export function getWeeklyQuests(): Quest[] {
  return [
    createQuest('Complete all daily quests 5 days', 'boss', 'weekly', { dis: 3 }, 'mindfulness'),
    createQuest('Learn something new', 'hard', 'weekly', { int: 2, tech: 1 }, 'study'),
    createQuest('Exercise 3 times', 'hard', 'weekly', { str: 2, sta: 2 }, 'fitness'),
  ];
}

export function getDefaultStats(): HunterStats {
  return {
    str: 5,
    sta: 5,
    dis: 5,
    foc: 5,
    int: 5,
    tech: 5,
    com: 5,
    conf: 5,
  };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createSystemMessage(text: string, type: SystemMessage['type'] = 'info'): SystemMessage {
  return { id: crypto.randomUUID(), text, type, timestamp: Date.now(), read: false };
}

const RANDOM_EVENTS = [
  { text: '⚡ A surge of energy! +5 bonus XP on your next quest.', type: 'event' as const },
  { text: '🧠 Neural pathways strengthening. +1 INT.', type: 'reward' as const },
  { text: '🔥 Your discipline is being tested. Stay focused, Hunter.', type: 'warning' as const },
  { text: '⚔️ A shadow monarch watches your progress...', type: 'info' as const },
];

export function maybeGenerateRandomEvent(): SystemMessage | null {
  if (Math.random() < 0.1) {
    const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    return createSystemMessage(event.text, event.type);
  }
  return null;
}

export function getDefaultState(): PlayerState {
  return {
    mainQuests: [],
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

      // Migrate stats
      const defaults = getDefaultStats();
      if (!state.stats) {
        state.stats = defaults;
      } else {
        for (const k of Object.keys(defaults) as StatKey[]) {
          if (state.stats[k] === undefined) {
            state.stats[k] = defaults[k];
          }
        }
      }

      const today = todayStr();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      if (state.lastActiveDate !== today) {
        if (state.lastActiveDate !== yesterdayStr && state.lastActiveDate !== today) {
          state.streak = 0;
        }
        state.lastActiveDate = today;
      }

      if (now.toDateString() !== last.toDateString()) {
        state.quests = state.quests.filter(q => q.questType !== 'daily');
        state.quests.push(...getDailyQuests());
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

const STAT_SUGGESTIONS: { keywords: string[]; stats: Partial<Record<StatKey, number>> }[] = [
  { keywords: ['gym', 'workout', 'exercise', 'push-up', 'run', 'lift', 'cardio'], stats: { str: 2, sta: 1 } },
  { keywords: ['leetcode', 'dsa', 'algorithm', 'code', 'program', 'coding'], stats: { int: 2, tech: 1 } },
  { keywords: ['read', 'study', 'learn', 'course', 'book'], stats: { int: 2, foc: 1 } },
  { keywords: ['meditat', 'journal', 'reflect', 'breath'], stats: { foc: 2, sta: 1 } },
  { keywords: ['social', 'meet', 'network', 'talk', 'present'], stats: { com: 2, conf: 1 } },
  { keywords: ['focus', 'pomodoro', 'deep work'], stats: { foc: 2, dis: 1 } },
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

const CATEGORY_SUGGESTIONS: { keywords: string[]; category: QuestCategory }[] = [
  { keywords: ['gym', 'workout', 'exercise', 'push-up', 'run', 'lift', 'cardio', 'yoga'], category: 'fitness' },
  { keywords: ['leetcode', 'dsa', 'algorithm', 'code', 'program', 'debug', 'commit'], category: 'coding' },
  { keywords: ['read', 'study', 'learn', 'course', 'book', 'lecture'], category: 'study' },
  { keywords: ['interview', 'resume', 'apply', 'linkedin'], category: 'career' },
  { keywords: ['meet', 'network', 'talk', 'call'], category: 'social' },
  { keywords: ['meditat', 'journal', 'reflect', 'breath', 'mindful'], category: 'mindfulness' },
  { keywords: ['design', 'create', 'art', 'write', 'blog'], category: 'creative' },
  { keywords: ['sleep', 'rest', 'recover', 'water'], category: 'health' },
];

export function suggestCategory(title: string): QuestCategory | undefined {
  const lower = title.toLowerCase();
  for (const s of CATEGORY_SUGGESTIONS) {
    if (s.keywords.some(k => lower.includes(k))) return s.category;
  }
  return undefined;
}

export function getCategoryInfo(key?: QuestCategory): CategoryInfo | undefined {
  if (!key) return undefined;
  return QUEST_CATEGORIES.find(c => c.key === key);
}
