// Reddit Integration Module for Cosmic Whiskers
// Handles Reddit user data retrieval and caching
import { Devvit } from '@devvit/public-api';

// Redis key constants for username caching
const REDIS_KEYS = {
  usernameCache: (userId: string) => `cosmicwhiskers:username:${userId}`,
};

// Username cache TTL: 24 hours in seconds
const USERNAME_CACHE_TTL = 24 * 60 * 60;

/**
 * Get Reddit username for a given user ID
 * Uses caching to reduce API calls
 */
export async function getRedditUsername(
  context: Devvit.Context,
  userId: string
): Promise<string> {
  try {
    // Check cache first
    const cacheKey = REDIS_KEYS.usernameCache(userId);
    const cachedUsername = await context.redis.get(cacheKey);
    
    if (cachedUsername) {
      return cachedUsername;
    }

    // Fetch from Reddit API
    const user = await context.reddit.getUserById(userId);
    const username = user?.username || 'Guest Player';

    // Cache the username
    await cacheUsername(context, userId, username);

    return username;
  } catch (error) {
    console.error(`Error fetching Reddit username for ${userId}:`, error);
    return 'Guest Player';
  }
}

/**
 * Cache a username in Redis with TTL
 */
export async function cacheUsername(
  context: Devvit.Context,
  userId: string,
  username: string
): Promise<void> {
  try {
    const cacheKey = REDIS_KEYS.usernameCache(userId);
    await context.redis.set(cacheKey, username, {
      expiration: new Date(Date.now() + USERNAME_CACHE_TTL * 1000),
    });
  } catch (error) {
    console.error(`Error caching username for ${userId}:`, error);
    // Don't throw - caching failure shouldn't break the flow
  }
}

/**
 * Get current user information from Devvit context
 */
export async function getCurrentUser(
  context: Devvit.Context
): Promise<{ id: string; username: string }> {
  try {
    const userId = context.userId;
    
    if (!userId) {
      return {
        id: 'anonymous',
        username: 'Guest Player',
      };
    }

    const username = await getRedditUsername(context, userId);

    return {
      id: userId,
      username,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return {
      id: 'anonymous',
      username: 'Guest Player',
    };
  }
}
