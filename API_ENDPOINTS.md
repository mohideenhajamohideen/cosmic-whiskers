# Cosmic Whiskers API Endpoints

This document describes all available API endpoints for the Cosmic Whiskers game.

## Base URL

All endpoints are prefixed with `/api/cosmicwhiskers`

## Endpoints

### 1. Submit Score

**POST** `/api/cosmicwhiskers/submit-score`

Submit a player's score for a specific theme.

**Request Body:**
```json
{
  "themeId": 1,
  "score": 25
}
```

**Response:**
```json
{
  "success": true,
  "unlockedThemes": [1, 2, 3],
  "cumulativeScore": 125,
  "communityStats": {
    "totalPlayers": 150,
    "totalRingsPassed": 5000,
    "averageScore": 33.33,
    "topScore": 150,
    "milestones": [...]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "VALIDATION_ERROR" | "SERVER_ERROR",
  "retryable": true
}
```

---

### 2. Get Leaderboard

**GET** `/api/cosmicwhiskers/leaderboard/:themeId`

Retrieve the top 10 players for a specific theme, including community stats.

**Parameters:**
- `themeId` (path parameter): The theme ID (1-6)

**Response:**
```json
{
  "entries": [
    {
      "username": "u/player1",
      "score": 150,
      "rank": 1,
      "isCurrentUser": false
    }
  ],
  "playerRank": 5,
  "playerScore": 75,
  "communityStats": {
    "totalPlayers": 150,
    "totalRingsPassed": 5000,
    "averageScore": 33.33,
    "topScore": 150,
    "milestones": [...]
  }
}
```

---

### 3. Get Player Progress

**GET** `/api/cosmicwhiskers/progress`

Retrieve the current player's progress across all themes.

**Response:**
```json
{
  "cumulativeScore": 125,
  "unlockedThemes": [1, 2, 3],
  "themeScores": {
    "1": 50,
    "2": 40,
    "3": 35
  }
}
```

---

### 4. Get Community Stats

**GET** `/api/cosmicwhiskers/community-stats`

Retrieve community-wide statistics and milestone achievements.

**Response:**
```json
{
  "totalPlayers": 150,
  "totalRingsPassed": 5000,
  "averageScore": 33.33,
  "topScore": 150,
  "milestones": [
    {
      "id": "1000rings",
      "threshold": 1000,
      "title": "First Thousand! 🎉",
      "description": "The community has passed 1,000 cosmic rings together!",
      "achieved": true,
      "achievedAt": 1698765432
    }
  ]
}
```

---

### 5. Get Current User

**GET** `/api/cosmicwhiskers/current-user`

Retrieve the current Reddit user's information.

**Response:**
```json
{
  "id": "t2_abc123",
  "username": "player1"
}
```

**Anonymous User Response:**
```json
{
  "id": "anonymous",
  "username": "Guest Player"
}
```

---

## Error Codes

All endpoints may return the following error codes:

- `VALIDATION_ERROR`: Invalid request parameters
- `SERVER_ERROR`: Internal server error
- `NETWORK_ERROR`: Network connection failed (client-side)
- `RATE_LIMIT`: Too many requests

## Caching

The client API implements automatic caching with a 1-minute TTL for:
- Leaderboard data
- Community stats
- Player progress
- Current user information

Cached data is automatically returned when network requests fail, with a `cached: true` flag in the response.

## Rate Limiting

To prevent abuse, the following rate limits are recommended:
- Score submissions: 1 per 2 seconds per user
- Leaderboard fetches: 1 per 5 seconds per user
- Community stats: 1 per 5 seconds per user

## Authentication

All endpoints use the Devvit context for user authentication. The user ID is automatically extracted from the request context. Anonymous users are assigned the ID "anonymous".
