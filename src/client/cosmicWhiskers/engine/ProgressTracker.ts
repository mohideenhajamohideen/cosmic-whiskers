// Progress Tracker - Tracks cumulative score and theme unlocks
export class ProgressTracker {
  private cumulativeScore: number;
  private themeScores: Map<number, number>;

  constructor(initialCumulativeScore: number = 0, themeScores: Record<number, number> = {}) {
    this.cumulativeScore = initialCumulativeScore;
    this.themeScores = new Map(Object.entries(themeScores).map(([k, v]) => [Number(k), v]));
  }

  public addScore(themeId: number, score: number): void {
    // Add to cumulative score
    this.cumulativeScore += score;

    // Update theme-specific high score
    const currentHighScore = this.themeScores.get(themeId) || 0;
    if (score > currentHighScore) {
      this.themeScores.set(themeId, score);
    }
  }

  public getCumulativeScore(): number {
    return this.cumulativeScore;
  }

  public getThemeHighScore(themeId: number): number {
    return this.themeScores.get(themeId) || 0;
  }

  public getAllThemeScores(): Record<number, number> {
    const scores: Record<number, number> = {};
    this.themeScores.forEach((score, themeId) => {
      scores[themeId] = score;
    });
    return scores;
  }

  public getProgressToNextUnlock(nextUnlockScore: number): number {
    if (this.cumulativeScore >= nextUnlockScore) {
      return 1; // 100% complete
    }
    return this.cumulativeScore / nextUnlockScore;
  }

  public reset(): void {
    this.cumulativeScore = 0;
    this.themeScores.clear();
  }
}
