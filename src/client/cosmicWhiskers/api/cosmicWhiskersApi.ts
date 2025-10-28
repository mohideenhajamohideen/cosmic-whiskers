// Flappy Cat API Client
export class CosmicWhiskersApi {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 60000; // 1 minute cache

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async fetchWithRetry(
    url: string,
    options?: RequestInit,
    retries: number = 2
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (error) {
        lastError = error as Error;
        if (i < retries) {
          // Exponential backoff: 500ms, 1000ms
          await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, i)));
        }
      }
    }

    throw lastError || new Error('Failed to fetch');
  }

  async submitScore(themeId: number, score: number): Promise<{
    success: boolean;
    unlockedThemes?: number[];
    cumulativeScore: number;
    communityStats?: {
      totalPlayers: number;
      totalRingsPassed: number;
      averageScore: number;
      topScore: number;
      milestones: Array<{
        id: string;
        threshold: number;
        title: string;
        description: string;
        achieved: boolean;
        achievedAt?: number;
      }>;
    };
    error?: string;
    code?: string;
  }> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/api/cosmicwhiskers/submit-score`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ themeId, score }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to submit score: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting score:', error);
      return {
        success: false,
        cumulativeScore: 0,
        error: error instanceof Error ? error.message : 'Failed to submit score',
        code: 'NETWORK_ERROR',
      };
    }
  }

  async getLeaderboard(themeId: number): Promise<{
    entries: Array<{ username: string; score: number; rank: number; isCurrentUser: boolean }>;
    playerRank: number;
    playerScore: number;
    communityStats: {
      totalPlayers: number;
      totalRingsPassed: number;
      averageScore: number;
      topScore: number;
      milestones: Array<{
        id: string;
        threshold: number;
        title: string;
        description: string;
        achieved: boolean;
        achievedAt?: number;
      }>;
    };
    error?: string;
    code?: string;
    cached?: boolean;
  }> {
    const cacheKey = `leaderboard:${themeId}`;

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/api/cosmicwhiskers/leaderboard/${themeId}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to get leaderboard: ${response.status}`);
      }

      const data = await response.json();
      // Cache successful response
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting leaderboard:', error);

      // Try to return cached data
      const cachedData = this.getCachedData<any>(cacheKey);
      if (cachedData) {
        console.log('Returning cached leaderboard data');
        return { ...cachedData, cached: true };
      }

      // Return empty data with error
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
        error: error instanceof Error ? error.message : 'Failed to load leaderboard',
        code: 'NETWORK_ERROR',
      };
    }
  }

  async getProgress(): Promise<{
    cumulativeScore: number;
    unlockedThemes: number[];
    themeScores: Record<number, number>;
    error?: string;
    code?: string;
  }> {
    const cacheKey = 'progress';

    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/api/cosmicwhiskers/progress`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to get progress: ${response.status}`);
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting progress:', error);

      // Try to return cached data
      const cachedData = this.getCachedData<any>(cacheKey);
      if (cachedData) {
        console.log('Returning cached progress data');
        return cachedData;
      }

      return {
        cumulativeScore: 0,
        unlockedThemes: [1],
        themeScores: {},
        error: error instanceof Error ? error.message : 'Failed to load progress',
        code: 'NETWORK_ERROR',
      };
    }
  }

  async getCommunityStats(): Promise<{
    totalPlayers: number;
    totalRingsPassed: number;
    averageScore: number;
    topScore: number;
    milestones: Array<{
      id: string;
      threshold: number;
      title: string;
      description: string;
      achieved: boolean;
      achievedAt?: number;
    }>;
    error?: string;
    code?: string;
    cached?: boolean;
  }> {
    const cacheKey = 'community-stats';

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/api/cosmicwhiskers/community-stats`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to get community stats: ${response.status}`);
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting community stats:', error);

      // Try to return cached data
      const cachedData = this.getCachedData<any>(cacheKey);
      if (cachedData) {
        console.log('Returning cached community stats');
        return { ...cachedData, cached: true };
      }

      return {
        totalPlayers: 0,
        totalRingsPassed: 0,
        averageScore: 0,
        topScore: 0,
        milestones: [],
        error: error instanceof Error ? error.message : 'Failed to load community stats',
        code: 'NETWORK_ERROR',
      };
    }
  }

  async getCurrentUser(): Promise<{
    id: string;
    username: string;
    error?: string;
    code?: string;
  }> {
    const cacheKey = 'current-user';

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/api/cosmicwhiskers/current-user`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to get current user: ${response.status}`);
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting current user:', error);

      // Try to return cached data
      const cachedData = this.getCachedData<any>(cacheKey);
      if (cachedData) {
        console.log('Returning cached user data');
        return cachedData;
      }

      return {
        id: 'anonymous',
        username: 'Guest Player',
        error: error instanceof Error ? error.message : 'Failed to load user',
        code: 'NETWORK_ERROR',
      };
    }
  }
}

// Default API instance
const api = new CosmicWhiskersApi();

// Helper functions for easy use
export const submitScore = (themeId: number, score: number) => api.submitScore(themeId, score);
export const getLeaderboard = (themeId: number) => api.getLeaderboard(themeId);
export const getProgress = () => api.getProgress();
export const getCommunityStats = () => api.getCommunityStats();
export const getCurrentUser = () => api.getCurrentUser();
