/**
 * Redis storage layer for Cosmic Whiskers
 * Handles all data persistence and retrieval
 */

import { redis } from '@devvit/web/server';
import type {
  BattleState,
  PlayerData,
  PlayerScore,
  LeaderboardTimeframe,
} from '../../shared/types/game.js';
import { REDIS_KEYS } from '../../shared/constants.js';

// ============================================================================
// Battle State Storage
// ============================================================================

export async function saveBattleState(battleState: BattleState): Promise<void> {
  const key = REDIS_KEYS.BATTLE_STATE(battleState.battleId);
  
  // Convert Sets and Maps to serializable format
  const serializable = {
    ...battleState,
    activePlayers: Array.from(battleState.activePlayers),
    eliminatedPlayers: Array.from(battleState.eliminatedPlayers),
    spectators: Array.from(battleState.spectators),
    rounds: battleState.rounds.map(round => ({
      ...round,
      predictions: Object.fromEntries(round.predictions),
      votes: Object.fromEntries(round.votes),
    })),
  };

  await redis.set(key, JSON.stringify(serializable));
  
  // Store active battles as a JSON array instead of a set
  const activeBattlesKey = REDIS_KEYS.ACTIVE_BATTLES;
  const existingBattles = await redis.get(activeBattlesKey);
  const battles = existingBattles ? JSON.parse(existingBattles) : [];
  if (!battles.includes(battleState.battleId)) {
    battles.push(battleState.battleId);
    await redis.set(activeBattlesKey, JSON.stringify(battles));
  }
  
  // Map post ID to battle ID
  await redis.set(
    REDIS_KEYS.POST_BATTLE_MAP(battleState.postId),
    battleState.battleId
  );
}

export async function getBattleState(battleId: string): Promise<BattleState | null> {
  const key = REDIS_KEYS.BATTLE_STATE(battleId);
  const data = await redis.get(key);
  
  if (!data) return null;
  
  const parsed = JSON.parse(data);
  
  // Convert arrays back to Sets and objects back to Maps
  return {
    ...parsed,
    activePlayers: new Set(parsed.activePlayers),
    eliminatedPlayers: new Set(parsed.eliminatedPlayers),
    spectators: new Set(parsed.spectators),
    rounds: parsed.rounds.map((round: any) => ({
      ...round,
      predictions: new Map(Object.entries(round.predictions)),
      votes: new Map(Object.entries(round.votes)),
    })),
  };
}

export async function getBattleByPostId(postId: string): Promise<BattleState | null> {
  const battleId = await redis.get(REDIS_KEYS.POST_BATTLE_MAP(postId));
  if (!battleId) return null;
  
  return getBattleState(battleId);
}

export async function updateBattleState(
  battleId: string,
  updates: Partial<BattleState>
): Promise<void> {
  const current = await getBattleState(battleId);
  if (!current) {
    throw new Error(`Battle ${battleId} not found`);
  }
  
  const updated = { ...current, ...updates };
  await saveBattleState(updated);
}

export async function deleteBattleState(battleId: string): Promise<void> {
  const key = REDIS_KEYS.BATTLE_STATE(battleId);
  await redis.del(key);
  
  // Remove from active battles array
  const activeBattlesKey = REDIS_KEYS.ACTIVE_BATTLES;
  const existingBattles = await redis.get(activeBattlesKey);
  if (existingBattles) {
    const battles = JSON.parse(existingBattles);
    const filtered = battles.filter((id: string) => id !== battleId);
    await redis.set(activeBattlesKey, JSON.stringify(filtered));
  }
}

export async function getActiveBattles(): Promise<string[]> {
  const activeBattlesKey = REDIS_KEYS.ACTIVE_BATTLES;
  const existingBattles = await redis.get(activeBattlesKey);
  return existingBattles ? JSON.parse(existingBattles) : [];
}

// ============================================================================
// Player Data Storage
// ============================================================================

export async function savePlayerData(playerData: PlayerData): Promise<void> {
  const key = REDIS_KEYS.PLAYER_DATA(playerData.userId);
  
  // Convert Maps to serializable format
  const serializable = {
    ...playerData,
    currentBattleProgress: {
      ...playerData.currentBattleProgress,
      predictions: Object.fromEntries(playerData.currentBattleProgress.predictions),
    },
  };
  
  await redis.set(key, JSON.stringify(serializable));
}

export async function getPlayerData(userId: string): Promise<PlayerData | null> {
  const key = REDIS_KEYS.PLAYER_DATA(userId);
  const data = await redis.get(key);
  
  if (!data) return null;
  
  const parsed = JSON.parse(data);
  
  // Convert objects back to Maps
  return {
    ...parsed,
    currentBattleProgress: {
      ...parsed.currentBattleProgress,
      predictions: new Map(Object.entries(parsed.currentBattleProgress.predictions)),
    },
  };
}

export async function updatePlayerData(
  userId: string,
  updates: Partial<PlayerData>
): Promise<void> {
  const current = await getPlayerData(userId);
  if (!current) {
    throw new Error(`Player ${userId} not found`);
  }
  
  const updated = { ...current, ...updates };
  await savePlayerData(updated);
}

export async function createPlayerData(userId: string, username: string): Promise<PlayerData> {
  const playerData: PlayerData = {
    userId,
    username,
    joinedAt: Date.now(),
    lastBattleAt: 0,
    totalPoints: 0,
    stats: {
      battlesPlayed: 0,
      battlesWon: 0,
      totalRoundsSurvived: 0,
      predictionAccuracy: 0,
      bestRank: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPlayersEliminated: 0,
      revengeVotesCast: 0,
    },
    achievements: [],
    currentBattleProgress: {
      battleId: '',
      status: 'active',
      currentRound: 0,
      roundsWon: 0,
      predictions: new Map(),
      isSpectating: false,
    },
  };
  
  await savePlayerData(playerData);
  return playerData;
}

// ============================================================================
// Leaderboard Storage
// ============================================================================

export async function updateLeaderboard(
  timeframe: LeaderboardTimeframe,
  userId: string,
  score: number
): Promise<void> {
  const key = getLeaderboardKey(timeframe);
  
  // Store leaderboard as JSON array of {userId, score} objects
  const existingData = await redis.get(key);
  const leaderboard = existingData ? JSON.parse(existingData) : [];
  
  // Update or add player score
  const existingIndex = leaderboard.findIndex((entry: any) => entry.userId === userId);
  if (existingIndex >= 0) {
    leaderboard[existingIndex].score = score;
  } else {
    leaderboard.push({ userId, score });
  }
  
  // Sort by score descending
  leaderboard.sort((a: any, b: any) => b.score - a.score);
  
  // Keep only top 100
  const trimmed = leaderboard.slice(0, 100);
  
  await redis.set(key, JSON.stringify(trimmed));
}

export async function getLeaderboard(
  timeframe: LeaderboardTimeframe,
  limit: number = 10
): Promise<PlayerScore[]> {
  const key = getLeaderboardKey(timeframe);
  const existingData = await redis.get(key);
  
  if (!existingData) return [];
  
  const leaderboard = JSON.parse(existingData);
  const topPlayers = leaderboard.slice(0, limit);
  
  // Fetch player data for each
  const playerScores: PlayerScore[] = [];
  
  for (let i = 0; i < topPlayers.length; i++) {
    const { userId, score } = topPlayers[i];
    const playerData = await getPlayerData(userId);
    
    if (playerData) {
      playerScores.push({
        rank: i + 1,
        username: playerData.username,
        totalPoints: score,
        battlesPlayed: playerData.stats.battlesPlayed,
        battlesWon: playerData.stats.battlesWon,
        predictionAccuracy: playerData.stats.predictionAccuracy,
        currentStreak: playerData.stats.currentStreak,
        badges: playerData.achievements,
      });
    }
  }
  
  return playerScores;
}

export async function getPlayerRank(
  timeframe: LeaderboardTimeframe,
  userId: string
): Promise<number | null> {
  const key = getLeaderboardKey(timeframe);
  const existingData = await redis.get(key);
  
  if (!existingData) return null;
  
  const leaderboard = JSON.parse(existingData);
  const index = leaderboard.findIndex((entry: any) => entry.userId === userId);
  
  return index >= 0 ? index + 1 : null;
}

function getLeaderboardKey(timeframe: LeaderboardTimeframe): string {
  switch (timeframe) {
    case 'daily':
      return REDIS_KEYS.LEADERBOARD_DAILY;
    case 'weekly':
      return REDIS_KEYS.LEADERBOARD_WEEKLY;
    case 'monthly':
      return REDIS_KEYS.LEADERBOARD_MONTHLY;
    case 'alltime':
      return REDIS_KEYS.LEADERBOARD_ALLTIME;
  }
}

// ============================================================================
// Pub/Sub for Real-Time Updates
// ============================================================================

export async function publishBattleUpdate(battleId: string, data: any): Promise<void> {
  const channel = `battle:${battleId}:updates`;
  await redis.publish(channel, JSON.stringify(data));
}

export async function subscribeToBattleUpdates(
  battleId: string,
  callback: (data: any) => void
): Promise<void> {
  const channel = `battle:${battleId}:updates`;
  
  // Note: Devvit's Redis pub/sub implementation may differ
  // This is a placeholder for the actual implementation
  // You may need to use Devvit's realtime capabilities instead
  console.log(`Subscribed to ${channel}`);
}

// ============================================================================
// Utility Functions
// ============================================================================

export async function incrementPlayerStat(
  userId: string,
  stat: keyof PlayerData['stats'],
  amount: number = 1
): Promise<void> {
  const playerData = await getPlayerData(userId);
  if (!playerData) return;
  
  playerData.stats[stat] = (playerData.stats[stat] as number) + amount;
  await savePlayerData(playerData);
}

export async function addAchievement(
  userId: string,
  achievementId: string,
  name: string,
  description: string,
  icon: string,
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
): Promise<void> {
  const playerData = await getPlayerData(userId);
  if (!playerData) return;
  
  // Check if achievement already exists
  if (playerData.achievements.some(a => a.id === achievementId)) {
    return;
  }
  
  playerData.achievements.push({
    id: achievementId,
    name,
    description,
    icon,
    rarity,
    unlockedAt: Date.now(),
  });
  
  await savePlayerData(playerData);
}
