// Cosmic Whiskers API Routes
import { Router } from 'express';
import { context } from '@devvit/web/server';
import { submitScore, getLeaderboard, getProgress } from './handlers.js';
import { getCommunityStats } from './communityHandlers.js';
import { getCurrentUser } from './redditIntegration.js';

export const cosmicWhiskersRouter = Router();

// Submit score - includes community stats update
cosmicWhiskersRouter.post('/api/cosmicwhiskers/submit-score', async (req, res) => {
  try {
    const { themeId, score } = req.body;
    const userId = context.userId ?? 'anonymous';

    // Validate input
    if (typeof themeId !== 'number' || typeof score !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: themeId and score must be numbers',
        code: 'VALIDATION_ERROR',
        retryable: false,
      });
    }

    const result = await submitScore(context, userId, themeId, score);
    res.json(result);
  } catch (error) {
    console.error('Error in submit-score:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR',
      retryable: true,
    });
  }
});

// Get leaderboard - includes community stats and Reddit usernames
cosmicWhiskersRouter.get('/api/cosmicwhiskers/leaderboard/:themeId', async (req, res) => {
  try {
    const themeId = parseInt(req.params.themeId);
    const userId = context.userId ?? 'anonymous';

    if (isNaN(themeId)) {
      return res.status(400).json({
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
        error: 'Invalid theme ID',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await getLeaderboard(context, themeId, userId);
    res.json(result);
  } catch (error) {
    console.error('Error in leaderboard:', error);
    res.status(500).json({
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
      error: 'Failed to retrieve leaderboard',
      code: 'SERVER_ERROR',
    });
  }
});

// Get player progress
cosmicWhiskersRouter.get('/api/cosmicwhiskers/progress', async (_req, res) => {
  try {
    const userId = context.userId ?? 'anonymous';

    const result = await getProgress(context, userId);
    res.json(result);
  } catch (error) {
    console.error('Error in progress:', error);
    res.status(500).json({
      cumulativeScore: 0,
      unlockedThemes: [1],
      themeScores: {},
      error: 'Failed to retrieve progress',
      code: 'SERVER_ERROR',
    });
  }
});

// Get community stats
cosmicWhiskersRouter.get('/api/cosmicwhiskers/community-stats', async (_req, res) => {
  try {
    const result = await getCommunityStats(context);
    res.json(result);
  } catch (error) {
    console.error('Error in community-stats:', error);
    res.status(500).json({
      totalPlayers: 0,
      totalRingsPassed: 0,
      averageScore: 0,
      topScore: 0,
      milestones: [],
      error: 'Failed to retrieve community statistics',
      code: 'SERVER_ERROR',
    });
  }
});

// Get current user
cosmicWhiskersRouter.get('/api/cosmicwhiskers/current-user', async (_req, res) => {
  try {
    const result = await getCurrentUser(context);
    res.json(result);
  } catch (error) {
    console.error('Error in current-user:', error);
    res.status(500).json({
      id: 'anonymous',
      username: 'Guest Player',
      error: 'Failed to retrieve user information',
    });
  }
});
