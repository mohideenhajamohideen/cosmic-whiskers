# Implementation Plan

- [x] 1. Update theme unlock thresholds in constants
  - Modify THEMES array in cosmicWhiskersConstants.ts to reduce unlock scores
  - Change theme 2 from 50 to 10 rings
  - Change theme 3 from 150 to 20 rings
  - Change theme 4 from 300 to 30 rings
  - Change theme 5 from 500 to 40 rings
  - Change theme 6 from 800 to 50 rings
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Add community stats types and interfaces
  - Add CommunityStats interface to types/cosmicWhiskers.ts
  - Add CommunityMilestone interface
  - Update LeaderboardEntry interface to include isCurrentUser flag
  - Update LeaderboardData interface to include communityStats
  - Add milestone definitions constant
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 2.4_

- [x] 3. Implement Redis-based community stats tracking
- [x] 3.1 Create community stats handler module
  - Create server/cosmicWhiskers/communityHandlers.ts
  - Implement getCommunityStats function to retrieve stats from Redis
  - Implement updateCommunityStats function to increment counters
  - Implement checkMilestones function to detect milestone achievements
  - Add Redis key constants for community data
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.3, 5.4_

- [x] 3.2 Add community stats API endpoint
  - Add GET /api/cosmicwhiskers/community-stats route
  - Wire up route to communityHandlers.getCommunityStats
  - Add error handling for Redis failures
  - _Requirements: 3.5, 5.5_

- [x] 4. Enhance leaderboard system with Reddit usernames
- [x] 4.1 Create Reddit integration module
  - Create server/cosmicWhiskers/redditIntegration.ts
  - Implement getRedditUsername function using Devvit context
  - Implement cacheUsername function for Redis caching
  - Implement getCurrentUser function
  - Add username caching with 24-hour TTL
  - _Requirements: 4.1, 4.2, 5.1, 5.2_

- [x] 4.2 Update leaderboard handler to include usernames
  - Modify getLeaderboard function in handlers.ts
  - Fetch Reddit usernames for top 10 players
  - Add isCurrentUser flag to current player's entry
  - Include community stats in leaderboard response
  - Format usernames as "u/username"
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.2, 4.3_

- [x] 4.3 Update score submission to track community stats
  - Modify submitScore function in handlers.ts
  - Call updateCommunityStats after successful score save
  - Check and trigger milestone achievements
  - Return updated community stats in response
  - _Requirements: 2.5, 3.5, 5.4_

- [x] 5. Create leaderboard UI component
- [x] 5.1 Build Leaderboard component
  - Create client/cosmicWhiskers/components/Leaderboard.tsx
  - Display top 10 players with rank, username, and score
  - Add rank badges (🥇🥈🥉) for top 3
  - Highlight current user's entry with distinct styling
  - Add loading and error states
  - Make responsive for mobile and desktop
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.2, 4.3_

- [x] 5.2 Integrate leaderboard into game over screen
  - Update CosmicWhiskersApp.tsx to fetch and display leaderboard
  - Add leaderboard section to game over overlay
  - Fetch leaderboard data after score submission
  - Add refresh functionality
  - _Requirements: 2.5_

- [x] 6. Create community stats UI component
- [x] 6.1 Build CommunityStats component
  - Create client/cosmicWhiskers/components/CommunityStats.tsx
  - Display total rings passed by community
  - Display community average score
  - Display total player count
  - Add milestone progress indicators
  - Add celebration animations for achieved milestones
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6.2 Integrate community stats into game UI
  - Add CommunityStats component to menu screen
  - Add CommunityStats component to game over screen
  - Implement auto-refresh every 30 seconds
  - Add manual refresh button
  - _Requirements: 3.5_

- [x] 7. Add username display throughout game
- [x] 7.1 Create UsernameDisplay component
  - Create client/cosmicWhiskers/components/UsernameDisplay.tsx
  - Display "u/username" format
  - Add fallback to "Guest Player" for anonymous users
  - Support multiple positioning options
  - Style to match current theme
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7.2 Add username to game screens
  - Add UsernameDisplay to menu screen (top-right)
  - Add UsernameDisplay to playing screen (top-left)
  - Add UsernameDisplay to game over screen
  - Fetch username on app mount
  - _Requirements: 4.5_

- [x] 8. Implement error handling and fallbacks
  - Add try-catch blocks to all API calls
  - Implement fallback UI for network errors
  - Add retry buttons for failed requests
  - Cache leaderboard data for offline viewing
  - Add loading skeletons for better UX
  - _Requirements: 5.5_

- [x] 9. Add milestone celebration system
  - Create celebration animation component
  - Trigger celebrations when milestones are achieved
  - Add confetti or particle effects
  - Display milestone achievement notification
  - Add sound effects for milestone achievements
  - _Requirements: 3.4_

- [x] 10. Update API routes and wire everything together
  - Update routes.ts with new community endpoints
  - Ensure all handlers are properly imported
  - Update API client functions in cosmicWhiskersApi.ts
  - Add TypeScript types for all API responses
  - Test all endpoints with sample data
  - _Requirements: 2.5, 3.5, 5.1, 5.2, 5.3, 5.4_
