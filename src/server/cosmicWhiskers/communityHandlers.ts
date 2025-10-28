// Community Stats Handlers for Cosmic Whiskers
import { Devvit } from '@devvit/public-api';
import type { CommunityStats, CommunityMilestone } from '../../shared/types/cosmicWhiskers.js';

// Redis key constants for community data
export const COMMUNITY_REDIS_KEYS = {
  totalPlayers: 'cosmicwhiskers:community:total_players',
  totalRings: 'cosmicwhiskers:community:total_rings',
  totalScore: 'cosmicwhiskers:community:total_score',
  gamesPlayed: 'cosmicwhiskers:community:games_played',
  milestone: (id: string) => `cosmicwhiskers:community:milestone:${id}`,
  playerSet: 'cosmicwhiskers:community:player_set',
};

// Milestone definitions
export const MILESTONES: CommunityMilestone[] = [
  {
    id: '1000rings',
    threshold: 1000,
    title: 'First Thousand! 🎉',
    description: 'The community has passed 1,000 cosmic rings together!',
    achieved: false,
  },
  {
    id: '10000rings',
    threshold: 10000,
    title: 'Ten Thousand Strong! 🚀',
    description: 'Amazing! 10,000 rings passed by our space explorers!',
    achieved: false,
  },
  {
    id: '50000rings',
    threshold: 50000,
    title: 'Cosmic Legends! ✨',
    description: '50,000 rings! Luna is proud of this amazing community!',
    achieved: false,
  },
  {
    id: '100players',
    threshold: 100,
    title: 'Growing Fleet! 👥',
    description: "100 brave pilots have joined Luna's adventure!",
    achieved: false,
  },
  {
    id: '1000players',
    threshold: 1000,
    title: 'Massive Community! 🌟',
    description: '1,000 players helping Luna find her way home!',
    achieved: false,
  },
];

/**
 * Retrieve community statistics from Redis
 */
export async function getCommunityStats(context: Devvit.Context): Promise<CommunityStats> {
  try {
    const redis = context.redis;

    // Get all community counters
    const [totalPlayersStr, totalRingsStr, totalScoreStr, gamesPlayedStr] = await Promise.all([
      redis.get(COMMUNITY_REDIS_KEYS.totalPlayers),
      redis.get(COMMUNITY_REDIS_KEYS.totalRings),
      redis.get(COMMUNITY_REDIS_KEYS.totalScore),
      redis.get(COMMUNITY_REDIS_KEYS.gamesPlayed),
    ]);

    const totalPlayers = totalPlayersStr ? parseInt(totalPlayersStr) : 0;
    const totalRingsPassed = totalRingsStr ? parseInt(totalRingsStr) : 0;
    const totalScore = totalScoreStr ? parseInt(totalScoreStr) : 0;
    const gamesPlayed = gamesPlayedStr ? parseInt(gamesPlayedStr) : 0;

    // Calculate average score
    const averageScore = gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0;

    // Get top score from leaderboard (theme 1 for now)
    const leaderboardKey = `flappycat:leaderboard:1`;
    const topScores = await redis.zRange(leaderboardKey, 0, 0, { reverse: true, by: 'rank' });
    const topScore = topScores && topScores.length > 0 && topScores[0] ? topScores[0].score : 0;

    // Check milestone achievements
    const milestones = await checkMilestones(context, totalRingsPassed, totalPlayers);

    return {
      totalPlayers,
      totalRingsPassed,
      averageScore,
      topScore,
      milestones,
    };
  } catch (error) {
    console.error('Error getting community stats:', error);
    // Return default stats on error
    return {
      totalPlayers: 0,
      totalRingsPassed: 0,
      averageScore: 0,
      topScore: 0,
      milestones: MILESTONES.map(m => ({ ...m, achieved: false })),
    };
  }
}

/**
 * Update community statistics after a game ends
 */
export async function updateCommunityStats(
  context: Devvit.Context,
  userId: string,
  score: number
): Promise<void> {
  try {
    const redis = context.redis;

    // Check if this is a new player by checking if they have a progress key
    const playerProgressKey = `flappycat:progress:${userId}`;
    const existingProgress = await redis.get(playerProgressKey);
    
    if (!existingProgress) {
      // New player - increment total players counter
      await redis.incrBy(COMMUNITY_REDIS_KEYS.totalPlayers, 1);
    }

    // Increment community counters
    await Promise.all([
      redis.incrBy(COMMUNITY_REDIS_KEYS.totalRings, score),
      redis.incrBy(COMMUNITY_REDIS_KEYS.totalScore, score),
      redis.incrBy(COMMUNITY_REDIS_KEYS.gamesPlayed, 1),
    ]);
  } catch (error) {
    console.error('Error updating community stats:', error);
    // Don't throw - we don't want to fail score submission if stats update fails
  }
}

/**
 * Check and update milestone achievements
 */
export async function checkMilestones(
  context: Devvit.Context,
  totalRings: number,
  totalPlayers: number
): Promise<CommunityMilestone[]> {
  try {
    const redis = context.redis;
    const milestones: CommunityMilestone[] = [];

    for (const milestone of MILESTONES) {
      // Determine which metric to check based on milestone ID
      const metricValue = milestone.id.includes('rings') ? totalRings : totalPlayers;
      
      // Check if milestone is achieved
      const achieved = metricValue >= milestone.threshold;
      
      // Get stored milestone data
      const milestoneKey = COMMUNITY_REDIS_KEYS.milestone(milestone.id);
      const storedData = await redis.get(milestoneKey);
      
      let achievedAt: number | undefined;
      
      if (achieved && !storedData) {
        // Milestone just achieved - store it
        achievedAt = Date.now();
        await redis.set(
          milestoneKey,
          JSON.stringify({ achieved: true, achievedAt })
        );
      } else if (storedData) {
        // Milestone was previously achieved
        const parsed = JSON.parse(storedData);
        achievedAt = parsed.achievedAt;
      }

      const milestoneData: CommunityMilestone = {
        ...milestone,
        achieved,
      };
      
      if (achievedAt !== undefined) {
        milestoneData.achievedAt = achievedAt;
      }
      
      milestones.push(milestoneData);
    }

    return milestones;
  } catch (error) {
    console.error('Error checking milestones:', error);
    // Return milestones with default achieved status
    return MILESTONES.map(m => ({ ...m, achieved: false }));
  }
}
