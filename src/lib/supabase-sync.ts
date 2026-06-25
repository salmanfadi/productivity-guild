import { supabase } from '@/integrations/supabase/client';
import {
  type PlayerState, type Quest, type HunterStats, type StatKey, type Difficulty, type QuestType, type QuestCategory,
  getDefaultState, getRank, getXpToNext, ALL_STATS
} from './game-system';
import { type DailyCheckIn, type DailyStore } from './daily-system';

const STATS_MAP: Record<StatKey, string> = {
  str: 'strength',
  sta: 'stamina',
  dis: 'discipline',
  foc: 'focus',
  int: 'intelligence',
  tech: 'technical',
  com: 'communication',
  conf: 'confidence'
};

const REVERSE_STATS_MAP: Record<string, StatKey> = {
  strength: 'str',
  stamina: 'sta',
  discipline: 'dis',
  focus: 'foc',
  intelligence: 'int',
  technical: 'tech',
  communication: 'com',
  confidence: 'conf'
};

// Single shared user for the whole app — every login sees the same data
const SINGLE_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function getOrCreateUserId(): Promise<string> {
  const userId = SINGLE_USER_ID;

  // Ensure user row exists
  const { data: existing } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();

  if (!existing) {
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      name: 'Hunter',
      level: 1,
      xp: 0,
      coins: 0,
      active_role: 'initiate'
    });
    if (userError) console.error('Error creating user row:', userError);

    const { error: statsError } = await supabase.from('player_stats').insert({
      user_id: userId,
      strength: 5, stamina: 5, discipline: 5, focus: 5,
      intelligence: 5, technical: 5, communication: 5, confidence: 5
    });
    if (statsError) console.error('Error creating stats row:', statsError);
  }

  localStorage.setItem('solo_leveling_user_id', userId);
  return userId;
}


// Fetch complete state from Supabase
export async function fetchFullState(userId: string): Promise<{ player: PlayerState; checkins: DailyCheckIn[] } | null> {
  try {
    const [userRes, statsRes, questsRes, checkinsRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).maybeSingle(),
      supabase.from('player_stats').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('quests').select(`
        id,
        title,
        description,
        difficulty,
        xp_reward,
        completed,
        quest_type,
        created_at,
        quest_rewards (
          stat_name,
          reward_amount
        )
      `).eq('user_id', userId),
      supabase.from('daily_checkins').select('*').eq('user_id', userId)
    ]);

    if (userRes.error || !userRes.data) return null;

    const user = userRes.data;
    const dbStats = statsRes.data || {
      strength: 5, stamina: 5, discipline: 5, focus: 5,
      intelligence: 5, technical: 5, communication: 5, confidence: 5
    };

    // Transform stats
    const stats: HunterStats = {
      str: dbStats.strength ?? 5,
      sta: dbStats.stamina ?? 5,
      dis: dbStats.discipline ?? 5,
      foc: dbStats.focus ?? 5,
      int: dbStats.intelligence ?? 5,
      tech: dbStats.technical ?? 5,
      com: dbStats.communication ?? 5,
      conf: dbStats.confidence ?? 5
    };

    // Transform quests
    const quests: Quest[] = (questsRes.data || []).map((q: any) => {
      const statRewards: Partial<Record<StatKey, number>> = {};
      (q.quest_rewards || []).forEach((r: any) => {
        const key = REVERSE_STATS_MAP[r.stat_name];
        if (key) {
          statRewards[key] = r.reward_amount;
        }
      });

      return {
        id: q.id,
        title: q.title,
        description: q.description || '',
        difficulty: q.difficulty as Difficulty,
        questType: q.quest_type as QuestType,
        xpReward: q.xp_reward,
        coinReward: q.difficulty === 'easy' ? 5 : q.difficulty === 'medium' ? 10 : q.difficulty === 'hard' ? 20 : 50,
        statRewards,
        completed: q.completed,
        createdAt: new Date(q.created_at).getTime()
      };
    });

    // Transform check-ins
    const checkins: DailyCheckIn[] = (checkinsRes.data || []).map((c: any) => ({
      date: new Date(c.created_at).toISOString().slice(0, 10),
      sleepHours: Number(c.sleep_hours),
      energy: c.energy,
      mood: c.mood,
      sick: c.sick,
      workoutDone: c.workout_completed,
      deepWorkHours: 0,
      distractionHours: 0
    }));

    const player: PlayerState = {
      name: user.name || 'Hunter',
      level: user.level || 1,
      xp: user.xp || 0,
      xpToNext: getXpToNext(user.level || 1),
      rank: getRank(user.level || 1),
      stats,
      statPoints: 0, // In standard Solo Leveling, points are allocated on leveling up; defaults to 0
      quests,
      mainQuests: [], // Unify under quests as database entries
      coins: user.coins || 0,
      streak: 0,
      bestStreak: 0,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      totalQuestsCompleted: quests.filter(q => q.completed).length,
      dailyQuestsCompleted: quests.filter(q => q.completed && q.questType === 'daily').length,
      weeklyQuestsCompleted: quests.filter(q => q.completed && q.questType === 'weekly').length,
      lastDailyReset: Date.now(),
      lastWeeklyReset: Date.now(),
      systemMessages: []
    };

    return { player, checkins };
  } catch (err) {
    console.error('Failed to fetch full state from Supabase:', err);
    return null;
  }
}

// Create new Quest in Supabase
export async function createQuestInDB(userId: string, quest: Quest): Promise<boolean> {
  try {
    const { error: questError } = await supabase.from('quests').insert({
      id: quest.id,
      user_id: userId,
      title: quest.title,
      description: quest.description || '',
      difficulty: quest.difficulty,
      xp_reward: quest.xpReward,
      completed: quest.completed,
      quest_type: quest.questType,
      created_at: new Date(quest.createdAt).toISOString()
    });

    if (questError) throw questError;

    // Insert rewards if present
    const rewardEntries = Object.entries(quest.statRewards).filter(([_, amount]) => amount && amount > 0);
    if (rewardEntries.length > 0) {
      const rewardsToInsert = rewardEntries.map(([k, amount]) => ({
        quest_id: quest.id,
        stat_name: STATS_MAP[k as StatKey],
        reward_amount: amount
      }));

      const { error: rewardError } = await supabase.from('quest_rewards').insert(rewardsToInsert);
      if (rewardError) throw rewardError;
    }

    return true;
  } catch (err) {
    console.error('Error saving quest in Supabase:', err);
    return false;
  }
}

// Complete Quest in Supabase and update user XP/stats
export async function completeQuestInDB(
  userId: string,
  questId: string,
  updatedUser: { level: number; xp: number; coins: number },
  rewards: Partial<Record<StatKey, number>>
): Promise<boolean> {
  try {
    // 1. Mark quest completed
    const { error: questError } = await supabase.from('quests').update({ completed: true }).eq('id', questId);
    if (questError) throw questError;

    // 2. Update user level and XP
    const { error: userError } = await supabase.from('users').update({
      level: updatedUser.level,
      xp: updatedUser.xp,
      coins: updatedUser.coins
    }).eq('id', userId);
    if (userError) throw userError;

    // 3. Increment player stats if there are rewards
    const rewardEntries = Object.entries(rewards).filter(([_, amount]) => amount && amount > 0);
    if (rewardEntries.length > 0) {
      // Fetch current stats first
      const { data: currentStats, error: fetchError } = await supabase
        .from('player_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError || !currentStats) throw fetchError || new Error('Stats row not found');

      // Build updated stats structure
      const statsUpdates: Record<string, number> = {};
      rewardEntries.forEach(([k, amount]) => {
        const columnName = STATS_MAP[k as StatKey];
        if (columnName) {
          statsUpdates[columnName] = (currentStats[columnName] || 0) + (amount || 0);
        }
      });

      const { error: statsError } = await supabase.from('player_stats').update(statsUpdates).eq('user_id', userId);
      if (statsError) throw statsError;
    }

    return true;
  } catch (err) {
    console.error('Error completing quest in Supabase:', err);
    return false;
  }
}

// Delete Quest from Supabase
export async function deleteQuestInDB(questId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('quests').delete().eq('id', questId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting quest from Supabase:', err);
    return false;
  }
}

// Update Active Role in Supabase
export async function setActiveRoleInDB(userId: string, roleId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').update({ active_role: roleId }).eq('id', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error updating active role in Supabase:', err);
    return false;
  }
}

// Update Name in Supabase
export async function updateNameInDB(userId: string, name: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').update({ name }).eq('id', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error updating name in Supabase:', err);
    return false;
  }
}

// Update User Stats in Supabase (manual allocation)
export async function updatePlayerStatsInDB(userId: string, stats: HunterStats): Promise<boolean> {
  try {
    const dbUpdates: Record<string, number> = {};
    Object.entries(stats).forEach(([k, amount]) => {
      dbUpdates[STATS_MAP[k as StatKey]] = amount;
    });

    const { error } = await supabase.from('player_stats').update(dbUpdates).eq('user_id', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error updating player stats in Supabase:', err);
    return false;
  }
}

// Save Daily Check-in in Supabase
export async function saveCheckinInDB(userId: string, checkin: DailyCheckIn, hpScore: number): Promise<boolean> {
  try {
    // Check if check-in exists for today
    const { data: existing } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('user_id', userId)
      .filter('created_at', 'gte', checkin.date + 'T00:00:00Z')
      .filter('created_at', 'lte', checkin.date + 'T23:59:59Z')
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('daily_checkins').update({
        sleep_hours: checkin.sleepHours,
        energy: checkin.energy,
        mood: checkin.mood,
        workout_completed: checkin.workoutDone,
        sick: checkin.sick,
        hp: hpScore
      }).eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from('daily_checkins').insert({
        user_id: userId,
        sleep_hours: checkin.sleepHours,
        energy: checkin.energy,
        mood: checkin.mood,
        workout_completed: checkin.workoutDone,
        sick: checkin.sick,
        hp: hpScore,
        created_at: new Date(checkin.date + 'T12:00:00Z').toISOString()
      });

      if (error) throw error;
    }

    return true;
  } catch (err) {
    console.error('Error saving check-in in Supabase:', err);
    return false;
  }
}
