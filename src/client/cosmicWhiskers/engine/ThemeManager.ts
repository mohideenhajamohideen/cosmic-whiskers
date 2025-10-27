// Theme Manager - Handles theme selection, unlocking, and loading
import { Theme } from '../../../shared/types/cosmicWhiskers';
import { THEMES } from '../../../shared/cosmicWhiskersConstants';

export class ThemeManager {
  private unlockedThemes: Set<number>;
  private currentTheme: Theme;

  constructor(unlockedThemeIds: number[] = [1]) {
    this.unlockedThemes = new Set(unlockedThemeIds);
    this.currentTheme = THEMES[0]; // Default to first theme
  }

  public getTheme(themeId: number): Theme | undefined {
    return THEMES.find((theme) => theme.id === themeId);
  }

  public getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  public setCurrentTheme(themeId: number): boolean {
    if (!this.isThemeUnlocked(themeId)) {
      return false;
    }

    const theme = this.getTheme(themeId);
    if (theme) {
      this.currentTheme = theme;
      return true;
    }

    return false;
  }

  public isThemeUnlocked(themeId: number): boolean {
    return this.unlockedThemes.has(themeId);
  }

  public unlockTheme(themeId: number): void {
    this.unlockedThemes.add(themeId);
  }

  public getUnlockedThemes(): Theme[] {
    return THEMES.filter((theme) => this.unlockedThemes.has(theme.id));
  }

  public getLockedThemes(): Theme[] {
    return THEMES.filter((theme) => !this.unlockedThemes.has(theme.id));
  }

  public getAllThemes(): Theme[] {
    return THEMES;
  }

  public getNextLockedTheme(cumulativeScore: number): Theme | null {
    const lockedThemes = this.getLockedThemes();
    if (lockedThemes.length === 0) {
      return null;
    }

    // Find the next theme that can be unlocked
    const sortedLocked = lockedThemes.sort((a, b) => a.unlockScore - b.unlockScore);
    return sortedLocked[0];
  }

  public checkUnlocks(cumulativeScore: number): number[] {
    const newlyUnlocked: number[] = [];

    for (const theme of THEMES) {
      if (!this.isThemeUnlocked(theme.id) && cumulativeScore >= theme.unlockScore) {
        this.unlockTheme(theme.id);
        newlyUnlocked.push(theme.id);
      }
    }

    return newlyUnlocked;
  }

  public getUnlockedThemeIds(): number[] {
    return Array.from(this.unlockedThemes);
  }
}
