// Flappy Cat API Routes
import { Router } from 'express';
import { context } from '@devvit/web/server';
import { submitScore, getLeaderboard, getProgress } from './handlers';

export const cosmicWhiskersRouter = Router();

// Submit score
cosmicWhiskersRouter.post('/api/flappycat/submit-score', async (req, res) => {
  try {
    const { themeId, score } = req.body;
    const userId = context.userId ?? 'anonymous';

    const result = await submitScore(context, userId, themeId, score);
    res.json(result);
  } catch (error) {
    console.error('Error in submit-score:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get leaderboard
cosmicWhiskersRouter.get('/api/flappycat/leaderboard/:themeId', async (req, res) => {
  try {
    const themeId = parseInt(req.params.themeId);
    const userId = context.userId ?? 'anonymous';

    const result = await getLeaderboard(context, themeId, userId);
    res.json(result);
  } catch (error) {
    console.error('Error in leaderboard:', error);
    res.status(500).json({ entries: [], playerRank: 0, playerScore: 0 });
  }
});

// Get progress
cosmicWhiskersRouter.get('/api/flappycat/progress', async (req, res) => {
  try {
    const userId = context.userId ?? 'anonymous';

    const result = await getProgress(context, userId);
    res.json(result);
  } catch (error) {
    console.error('Error in progress:', error);
    res.status(500).json({ cumulativeScore: 0, unlockedThemes: [1], themeScores: {} });
  }
});
