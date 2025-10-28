# Community Features Design Document

## Overview

This design document outlines the implementation of community-focused features for Cosmic Whiskers, including difficulty adjustments, Reddit-integrated leaderboards, community milestone tracking, and social elements. The system will make the game more accessible while fostering community engagement through shared achievements and competitive elements.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Game Engine  │  │ Leaderboard  │  │ Community Stats │  │
│  │              │  │  Component   │  │    Component    │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│         │                  │                    │           │
└─────────┼──────────────────┼────────────────────┼───────────┘
          │                  │                    │
          │         ┌────────▼────────────────────▼─────┐
          │         │      API Layer (Express)          │
          │         │  ┌──────────────────────────────┐ │
          │         │  │  Community Routes            │ │
          │         │  │  - Submit Score              │ │
          │         │  │  - Get Leaderboard           │ │
          │         │  │  - Get Community Stats       │ │
          │         │  └──────────────────────────────┘ │
          │         └────────┬──────────────────────────┘
          │                  │
          │         ┌────────▼────────────────────────┐
          │         │   Storage Layer (Redis)         │
          │         │  ┌──────────────────────────┐   │
          │         │  │ Sorted Sets (Leaderboard)│   │
          │         │  │ Hashes (User Data)       │   │
          │         │  │ Counters (Community Stats)│  │
          │         │  └──────────────────────────┘   │
          │         └─────────────────────────────────┘
          │
          └─────────► Theme System (Updated Constants)
```

### Component Interaction Flow

1. **Game Flow**: Player plays → Score achieved → Submit to server
2. **Leaderboard Flow**: Request leaderboard → Fetch from Redis → Display with rankings
3. **Community Stats Flow**: Game end → Update counters → Calculate averages → Display
4. **Theme Unlock Flow**: Score submitted → Check unlock thresholds → Update player progress

## Components and Interfaces

### 1. Updated Constants (cosmicWhiskersConstants.ts)

**Purpose**: Adjust theme unlock requirements to make progression easier

**Changes**:
- Theme 2: 50 → 10 rings
- Theme 3: 150 → 20 rings
- Theme 4: 300 → 30 rings
- Theme 5: 500 → 40 rings
- Theme 6: 800 → 50 rings

### 2. Community Stats Types (types/cosmicWhiskers.ts)

**New Interfaces**:

```typescript
export interface CommunityStats {
  totalPlayers: number;
  totalRingsPassed: number;
  averageScore: number;
  topScore: number;
  milestones: CommunityMilestone[];
}

export interface CommunityMilestone {
  id: string;
  threshold: number;
  title: string;
  description: string;
  achieved: boolean;
  achievedAt?: number;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  playerRank: number;
  playerScore: number;
  communityStats: CommunityStats;
}
```

### 3. Server-Side Handlers

#### a. Community Stats Handler (server/cosmicWhiskers/communityHandlers.ts)

**Responsibilities**:
- Calculate and retrieve community statistics
- Track milestone achievements
- Update aggregate counters

**Key Functions**:
```typescript
async function getCommunityStats(context): Promise<CommunityStats>
async function updateCommunityStats(context, score: number): Promise<void>
async function checkMilestones(context, totalRings: number): Promise<CommunityMilestone[]>
```

**Redis Keys**:
- `community:total_players` - Counter
- `community:total_rings` - Counter
- `community:total_score` - Counter
- `community:milestones:{id}` - Hash

#### b. Enhanced Leaderboard Handler (server/cosmicWhiskers/handlers.ts)

**Updates**:
- Include Reddit username in leaderboard entries
- Add community stats to leaderboard response
- Highlight current user's position

**Key Functions**:
```typescript
async function getLeaderboard(context, themeId: number, userId: string): Promise<LeaderboardData>
async function submitScore(context, userId: string, themeId: number, score: number): Promise<ScoreSubmissionResult>
```

**Redis Keys**:
- `leaderboard:theme:{themeId}` - Sorted Set (score → username)
- `user:{userId}:username` - String
- `user:{userId}:best_score:theme:{themeId}` - String

### 4. Client Components

#### a. Leaderboard Component (client/cosmicWhiskers/components/Leaderboard.tsx)

**Purpose**: Display top scores with Reddit usernames

**Features**:
- Top 10 players display
- Current user highlight
- Rank badges (🥇🥈🥉)
- Real-time updates
- Reddit username format (u/username)

**Props**:
```typescript
interface LeaderboardProps {
  themeId: number;
  currentUserId: string;
  onClose: () => void;
}
```

#### b. Community Stats Component (client/cosmicWhiskers/components/CommunityStats.tsx)

**Purpose**: Display community-wide achievements and statistics

**Features**:
- Total rings passed by all players
- Community average score
- Total player count
- Milestone progress bars
- Celebration animations for milestones

**Props**:
```typescript
interface CommunityStatsProps {
  stats: CommunityStats;
  refreshInterval?: number;
}
```

#### c. Username Display Component (client/cosmicWhiskers/components/UsernameDisplay.tsx)

**Purpose**: Show current player's Reddit username

**Features**:
- Display "u/username" format
- Fallback to "Guest Player" for anonymous users
- Positioned in game UI
- Styled to match theme

**Props**:
```typescript
interface UsernameDisplayProps {
  username: string | null;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
```

### 5. API Routes (server/cosmicWhiskers/routes.ts)

**New Endpoints**:

```typescript
// Get community statistics
GET /api/cosmicwhiskers/community-stats
Response: CommunityStats

// Get leaderboard with community stats
GET /api/cosmicwhiskers/leaderboard/:themeId
Response: LeaderboardData

// Submit score (updated to include community stats update)
POST /api/cosmicwhiskers/submit-score
Body: { themeId: number, score: number }
Response: ScoreSubmissionResult & { communityStats: CommunityStats }
```

### 6. Reddit Integration (server/cosmicWhiskers/redditIntegration.ts)

**Purpose**: Interface with Devvit APIs for user data

**Key Functions**:
```typescript
async function getRedditUsername(context, userId: string): Promise<string>
async function cacheUsername(context, userId: string, username: string): Promise<void>
async function getCurrentUser(context): Promise<{ id: string; username: string }>
```

## Data Models

### Redis Data Structure

```
# Leaderboards (Sorted Sets)
leaderboard:theme:1 → { "u/player1": 45, "u/player2": 38, ... }
leaderboard:theme:2 → { "u/player1": 25, "u/player3": 22, ... }

# User Data (Hashes)
user:{userId}:data → {
  username: "player1",
  totalScore: 150,
  gamesPlayed: 10,
  lastPlayed: 1698765432
}

# User Best Scores (Strings)
user:{userId}:best_score:theme:1 → "45"
user:{userId}:best_score:theme:2 → "25"

# Community Stats (Counters & Hashes)
community:total_players → 1234
community:total_rings → 45678
community:total_score → 123456
community:games_played → 5678

# Milestones (Hashes)
community:milestone:1000rings → {
  achieved: "true",
  achievedAt: "1698765432",
  title: "First Thousand",
  description: "Community passed 1,000 rings!"
}
```

### Milestone Definitions

```typescript
const MILESTONES: CommunityMilestone[] = [
  {
    id: '1000rings',
    threshold: 1000,
    title: 'First Thousand! 🎉',
    description: 'The community has passed 1,000 cosmic rings together!',
    achieved: false
  },
  {
    id: '10000rings',
    threshold: 10000,
    title: 'Ten Thousand Strong! 🚀',
    description: 'Amazing! 10,000 rings passed by our space explorers!',
    achieved: false
  },
  {
    id: '100players',
    threshold: 100,
    title: 'Growing Fleet! 👥',
    description: '100 brave pilots have joined Luna\'s adventure!',
    achieved: false
  },
  {
    id: '1000players',
    threshold: 1000,
    title: 'Massive Community! 🌟',
    description: '1,000 players helping Luna find her way home!',
    achieved: false
  }
];
```

## Error Handling

### Client-Side Error Handling

1. **Network Failures**: Display cached data with "offline" indicator
2. **API Errors**: Show friendly error messages, allow retry
3. **Missing Username**: Fallback to "Guest Player"
4. **Leaderboard Load Failure**: Show placeholder with retry button

### Server-Side Error Handling

1. **Redis Connection Errors**: Log error, return empty/default data
2. **Invalid User ID**: Treat as anonymous user
3. **Score Validation**: Reject impossible scores (> max possible)
4. **Rate Limiting**: Implement per-user submission limits

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'RATE_LIMIT';
  retryable: boolean;
}
```

## Testing Strategy

### Unit Tests

1. **Theme Unlock Logic**
   - Test unlock thresholds (10, 20, 30, 40, 50)
   - Verify cumulative score calculation
   - Test edge cases (score = threshold, score = threshold - 1)

2. **Community Stats Calculations**
   - Test average score calculation
   - Test milestone threshold detection
   - Test counter increments

3. **Leaderboard Ranking**
   - Test rank assignment
   - Test tie-breaking logic
   - Test current user highlighting

### Integration Tests

1. **Score Submission Flow**
   - Submit score → Verify leaderboard update
   - Submit score → Verify community stats update
   - Submit score → Verify theme unlock

2. **Leaderboard Retrieval**
   - Fetch leaderboard → Verify top 10
   - Fetch leaderboard → Verify current user rank
   - Fetch leaderboard → Verify username display

3. **Redis Operations**
   - Test sorted set operations
   - Test atomic counter updates
   - Test hash operations

### End-to-End Tests

1. **Complete Game Flow**
   - Play game → Submit score → View leaderboard
   - Unlock theme → Verify UI update
   - Achieve milestone → Verify celebration

2. **Multi-User Scenarios**
   - Multiple users submit scores
   - Verify leaderboard ordering
   - Verify community stats accuracy

### Manual Testing Checklist

- [ ] Theme unlocks at correct scores
- [ ] Leaderboard displays correctly on mobile
- [ ] Leaderboard displays correctly on desktop
- [ ] Username displays in all locations
- [ ] Community stats update in real-time
- [ ] Milestone celebrations trigger correctly
- [ ] Error states display properly
- [ ] Offline mode works with cached data
- [ ] Share functionality works
- [ ] Performance is acceptable with 100+ leaderboard entries

## Performance Considerations

### Optimization Strategies

1. **Leaderboard Caching**
   - Cache top 10 for 30 seconds
   - Invalidate on new high score
   - Use Redis TTL for automatic expiry

2. **Community Stats Caching**
   - Update every 5 seconds max
   - Use debouncing for rapid submissions
   - Batch updates when possible

3. **Username Caching**
   - Cache username in Redis for 24 hours
   - Reduce API calls to Reddit
   - Update on user profile changes

4. **Client-Side Optimization**
   - Lazy load leaderboard component
   - Virtualize long leaderboard lists
   - Debounce stat refresh requests

### Scalability Considerations

1. **Redis Performance**
   - Use pipelining for batch operations
   - Implement connection pooling
   - Monitor memory usage

2. **API Rate Limiting**
   - Limit score submissions to 1 per 2 seconds per user
   - Limit leaderboard fetches to 1 per 5 seconds per user
   - Implement exponential backoff

3. **Data Retention**
   - Keep leaderboard entries for current season
   - Archive old data monthly
   - Implement data cleanup jobs

## Security Considerations

1. **Score Validation**
   - Validate score is within possible range (0-1000)
   - Check submission timestamp for replay attacks
   - Implement server-side score verification

2. **User Authentication**
   - Use Devvit context for user identification
   - Never trust client-provided user IDs
   - Validate Reddit username format

3. **Rate Limiting**
   - Prevent spam submissions
   - Protect against DDoS
   - Implement IP-based rate limiting

4. **Data Privacy**
   - Only store public Reddit usernames
   - Don't store sensitive user data
   - Comply with Reddit's privacy policies

## Deployment Strategy

### Phase 1: Theme Unlock Adjustment
1. Update constants file
2. Test theme progression
3. Deploy to production

### Phase 2: Basic Leaderboard
1. Implement Redis storage
2. Add leaderboard API endpoints
3. Create leaderboard UI component
4. Test with sample data
5. Deploy to production

### Phase 3: Community Stats
1. Implement community stats tracking
2. Add milestone system
3. Create community stats UI
4. Test milestone triggers
5. Deploy to production

### Phase 4: Polish & Optimization
1. Add animations and celebrations
2. Optimize caching strategies
3. Implement error handling
4. Performance testing
5. Final deployment

## Future Enhancements

1. **Seasonal Leaderboards**: Reset leaderboards monthly/weekly
2. **Friend Leaderboards**: Show scores from Reddit friends
3. **Achievements System**: Badges for specific accomplishments
4. **Daily Challenges**: Special objectives with bonus rewards
5. **Community Events**: Time-limited collaborative goals
6. **Replay System**: Watch top players' runs
7. **Custom Themes**: Community-created visual themes
8. **Tournament Mode**: Organized competitive events
