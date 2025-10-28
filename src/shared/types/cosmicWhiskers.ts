// Flappy Cat Game Types

export type GameStatus = 'menu' | 'ready' | 'playing' | 'gameover' | 'cutscene';

export interface LunaState {
  x: number;
  y: number;
  velocityY: number;
  rotation: number;
  isFlapping: boolean;
}

export interface CosmicRing {
  x: number;
  gapY: number;
  gapSize: number;
  passed: boolean;
  color: string;
}

export interface GameState {
  status: GameStatus;
  score: number;
  luna: LunaState;
  rings: CosmicRing[];
  theme: Theme;
  frameCount: number;
}

export interface PlayerState {
  userId: string;
  username: string;
  cumulativeScore: number;
  unlockedThemes: number[];
  themeHighScores: Record<number, number>;
  currentTheme: number;
}

export interface Theme {
  id: number;
  name: string;
  unlockScore: number;
  story: {
    title: string;
    description: string;
  };
  visuals: {
    backgroundGradient: [string, string];
    backgroundShift: [string, string];
    ringColor: string;
    ringGlowColor: string;
    ringAccentColor: string;
    particleColor: string;
    trailColor: string;
    starDensity: number;
    starColors: string[];
    nebulaColor?: string;
    nebulaOpacity?: number;
    planetImage?: string;
    specialEffect?: 'aurora' | 'lightRays' | 'energyField' | 'none';
  };
  audio?: {
    ambientSound?: string;
    ringPassSound?: string;
  };
}

export interface CosmicWhiskersProgress {
  cumulativeScore: number;
  unlockedThemes: number[];
  themeScores: Record<number, number>;
}

export interface ScoreSubmissionResult {
  success: boolean;
  unlockedThemes?: number[];
  cumulativeScore: number;
  communityStats?: CommunityStats;
  error?: string;
  code?: string;
}

export interface CommunityMilestone {
  id: string;
  threshold: number;
  title: string;
  description: string;
  achieved: boolean;
  achievedAt?: number;
}

export interface CommunityStats {
  totalPlayers: number;
  totalRingsPassed: number;
  averageScore: number;
  topScore: number;
  milestones: CommunityMilestone[];
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
  error?: string;
  code?: string;
  cached?: boolean;
}

export interface CurrentUserResponse {
  id: string;
  username: string;
  error?: string;
  code?: string;
}

export interface CommunityStatsResponse extends CommunityStats {
  error?: string;
  code?: string;
  cached?: boolean;
}

export interface ProgressResponse {
  cumulativeScore: number;
  unlockedThemes: number[];
  themeScores: Record<number, number>;
  error?: string;
  code?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'RATE_LIMIT';
  retryable: boolean;
}
