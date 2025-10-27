// Flappy Cat Server Handlers
import { Devvit } from '@devvit/public-api';
import { THEMES } from '../../shared/cosmicWhiskersConstants';

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
): Promise<{ success: boolean; unlockedThemes?: number[]; cumulativeScore: number }> {
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
      await redis.zAdd(leaderboardKey, { member: userId, score });
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

    return { success: true, unlockedThemes, cumulativeScore: newCumulative };
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
): Promise<{
  entries: Array<{ username: string; score: number; rank: number }>;
  playerRank: number;
  playerScore: number;
}> {
  try {
    const redis = context.redis;
    const leaderboardKey = REDIS_KEYS.leaderboard(themeId);

    // Get top 10 scores
    const topScores = await redis.zRange(leaderboardKey, 0, 9, { reverse: true, by: 'rank' });

    // Get usernames
    const entries = await Promise.all(
      topScores.map(async (entry, index) => {
        const username = entry.member;
        return {
          username,
          score: entry.score,
          rank: index + 1,
        };
      })
    );

    // Get player's rank and score
    const playerRank = await redis.zRank(leaderboardKey, userId, { reverse: true });
    const playerScoreData = await redis.zScore(leaderboardKey, userId);

    return {
      entries,
      playerRank: playerRank !== undefined ? playerRank + 1 : 0,
      playerScore: playerScoreData || 0,
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return {
      entries: [],
      playerRank: 0,
      playerScore: 0,
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
