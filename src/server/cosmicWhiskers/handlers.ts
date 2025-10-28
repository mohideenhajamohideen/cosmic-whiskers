// Flappy Cat Server Handlers
import { Devvit } from '@devvit/public-api';
import { THEMES } from '../../shared/cosmicWhiskersConstants';
import { getRedditUsername } from './redditIntegration.js';
import { getCommunityStats, updateCommunityStats } from './communityHandlers.js';
import type { LeaderboardData, CommunityStats } from '../../shared/types/cosmicWhiskers.js';

const REDIS_KEYS = {
  leaderboard: (themeId: number) => `flappycat:leaderboard:${themeId}`,
  playerProgress: (userId: string) => `flappycat:progress:${userId}`,
  playerThemeScore: (userId: string, themeId: number) => `flappycat:score:${userId}:${themeId}`,
};

// Score submission handler
export async function submitScore(
  context: Devvit.Context,
  userId: string,
  themeId: number,
  score: number
): Promise<{ success: boolean; unlockedThemes?: number[]; cumulativeScore: number; communityStats?: CommunityStats }> {
  try {
    const redis = context.redis;

    // Validate score
    if (score < 0 || score > 10000) {
      return { success: false, cumulativeScore: 0 };
    }

    // Get current cumulative score
    const progressKey = REDIS_KEYS.playerProgress(userId);
    const currentCumulativeStr = await redis.get(progressKey);
    const currentCumulative = currentCumulativeStr ? parseInt(currentCumulativeStr) : 0;

    // Add to cumulative score
    const newCumulative = currentCumulative + score;
    await redis.set(progressKey, newCumulative.toString());

    // Update theme-specific high score
    const themeScoreKey = REDIS_KEYS.playerThemeScore(userId, themeId);
    const currentHighScoreStr = await redis.get(themeScoreKey);
    const currentHighScore = currentHighScoreStr ? parseInt(currentHighScoreStr) : 0;

    if (score > currentHighScore) {
      await redis.set(themeScoreKey, score.toString());

      // Update leaderboard
      const leaderboardKey = REDIS_KEYS.leaderboard(themeId);
      console.log(`Adding score to leaderboard: ${leaderboardKey}, user: ${userId}, score: ${score}`);
      await redis.zAdd(leaderboardKey, { member: userId, score });
      console.log(`Score added successfully`);
    } else {
      console.log(`Score ${score} not higher than current high score ${currentHighScore}, not updating leaderboard`);
    }

    // Check for theme unlocks
    const unlockedThemes: number[] = [];
    for (const theme of THEMES) {
      if (newCumulative >= theme.unlockScore) {
        const unlockKey = `flappycat:unlocked:${userId}:${theme.id}`;
        const alreadyUnlocked = await redis.get(unlockKey);
        if (!alreadyUnlocked) {
          await redis.set(unlockKey, '1');
          unlockedThemes.push(theme.id);
        }
      }
    }

    // Update community stats after successful score save
    await updateCommunityStats(context, userId, score);

    // Get updated community stats to return
    const communityStats = await getCommunityStats(context);

    return { success: true, unlockedThemes, cumulativeScore: newCumulative, communityStats };
  } catch (error) {
    console.error('Error submitting score:', error);
    return { success: false, cumulativeScore: 0 };
  }
}

// Leaderboard query handler
export async function getLeaderboard(
  context: Devvit.Context,
  themeId: number,
  userId: string
): Promise<LeaderboardData> {
  try {
    const redis = context.redis;
    const leaderboardKey = REDIS_KEYS.leaderboard(themeId);

    console.log(`Fetching leaderboard for theme ${themeId}, key: ${leaderboardKey}`);

    // Get top 10 scores
    const topScores = await redis.zRange(leaderboardKey, 0, 9, { reverse: true, by: 'rank' });
    
    console.log(`Found ${topScores.length} leaderboard entries:`, topScores);

    // Fetch Reddit usernames for top 10 players
    const entries = await Promise.all(
      topScores.map(async (entry, index) => {
        const playerId = entry.member;
        const username = await getRedditUsername(context, playerId);
        
        return {
          username: `u/${username}`,
          score: entry.score,
          rank: index + 1,
          isCurrentUser: playerId === userId,
        };
      })
    );

    // Get player's rank and score (using zRevRank for reverse order)
    const playerRank = await redis.zRevRank(leaderboardKey, userId);
    const playerScoreData = await redis.zScore(leaderboardKey, userId);

    console.log(`Player rank: ${playerRank}, score: ${playerScoreData}`);

    // Include community stats in leaderboard response
    const communityStats = await getCommunityStats(context);

    return {
      entries,
      playerRank: playerRank !== undefined ? playerRank + 1 : 0,
      playerScore: playerScoreData || 0,
      communityStats,
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return {
      entries: [],
      playerRank: 0,
      playerScore: 0,
      communityStats: {
        totalPlayers: 0,
        totalRingsPassed: 0,
        averageScore: 0,
        topScore: 0,
        milestones: [],
      },
    };
  }
}

// Progress query handler
export async function getProgress(
  context: Devvit.Context,
  userId: string
): Promise<{
  cumulativeScore: number;
  unlockedThemes: number[];
  themeScores: Record<number, number>;
}> {
  try {
    const redis = context.redis;

    // Get cumulative score
    const progressKey = REDIS_KEYS.playerProgress(userId);
    const cumulativeStr = await redis.get(progressKey);
    const cumulativeScore = cumulativeStr ? parseInt(cumulativeStr) : 0;

    // Get unlocked themes
    const unlockedThemes: number[] = [];
    for (const theme of THEMES) {
      if (cumulativeScore >= theme.unlockScore) {
        unlockedThemes.push(theme.id);
      }
    }

    // Get theme-specific scores
    const themeScores: Record<number, number> = {};
    for (const theme of THEMES) {
      const scoreKey = REDIS_KEYS.playerThemeScore(userId, theme.id);
      const scoreStr = await redis.get(scoreKey);
      themeScores[theme.id] = scoreStr ? parseInt(scoreStr) : 0;
    }

    return {
      cumulativeScore,
      unlockedThemes,
      themeScores,
    };
  } catch (error) {
    console.error('Error getting progress:', error);
    return {
      cumulativeScore: 0,
      unlockedThemes: [1],
      themeScores: {},
    };
  }
}
