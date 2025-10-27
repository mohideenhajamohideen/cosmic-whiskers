// Flappy Cat API Client
export class CosmicWhiskersApi {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async submitScore(themeId: number, score: number): Promise<{
    success: boolean;
    unlockedThemes?: number[];
    cumulativeScore: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/flappycat/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId, score }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit score');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting score:', error);
      return { success: false, cumulativeScore: 0 };
    }
  }

  async getLeaderboard(themeId: number): Promise<{
    entries: Array<{ username: string; score: number; rank: number }>;
    playerRank: number;
    playerScore: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/flappycat/leaderboard/${themeId}`);

      if (!response.ok) {
        throw new Error('Failed to get leaderboard');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return { entries: [], playerRank: 0, playerScore: 0 };
    }
  }

  async getProgress(): Promise<{
    cumulativeScore: number;
    unlockedThemes: number[];
    themeScores: Record<number, number>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/flappycat/progress`);

      if (!response.ok) {
        throw new Error('Failed to get progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting progress:', error);
      return { cumulativeScore: 0, unlockedThemes: [1], themeScores: {} };
    }
  }
}

// Default API instance
const api = new CosmicWhiskersApi();

// Helper functions for easy use
export const submitScore = (themeId: number, score: number) => api.submitScore(themeId, score);
export const getLeaderboard = (themeId: number) => api.getLeaderboard(themeId);
export const getProgress = () => api.getProgress();
