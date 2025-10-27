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
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  rank: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  playerRank: number;
  playerScore: number;
}
