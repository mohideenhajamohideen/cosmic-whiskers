// Ring System - Handles cosmic ring generation, scrolling, and removal
import { CosmicRing, Theme } from '../../../shared/types/cosmicWhiskers';
import { GAME_CONFIG } from '../../../shared/cosmicWhiskersConstants';

export class RingSystem {
  private rings: CosmicRing[] = [];
  private canvasWidth: number;
  private canvasHeight: number;
  private theme: Theme;

  constructor(canvasWidth: number, canvasHeight: number, theme: Theme) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.theme = theme;
  }

  public initialize(): void {
    this.rings = [];
    // Generate initial rings
    for (let i = 0; i < 3; i++) {
      const x = this.canvasWidth + i * GAME_CONFIG.RING_SPACING;
      this.rings.push(this.createRing(x));
    }
  }

  private createRing(x: number): CosmicRing {
    // Randomize gap position between GAP_MIN_Y and GAP_MAX_Y
    const gapY =
      GAME_CONFIG.GAP_MIN_Y +
      Math.random() * (GAME_CONFIG.GAP_MAX_Y - GAME_CONFIG.GAP_MIN_Y);

    return {
      x,
      gapY,
      gapSize: GAME_CONFIG.GAP_SIZE,
      passed: false,
      color: this.theme.visuals.ringColor,
    };
  }

  public update(deltaTime: number): void {
    // Scroll all rings to the left
    const scrollDistance = GAME_CONFIG.SCROLL_SPEED * deltaTime;

    for (const ring of this.rings) {
      ring.x -= scrollDistance;
    }

    // Remove rings that are off-screen (left edge)
    this.rings = this.rings.filter((ring) => ring.x > -GAME_CONFIG.RING_WIDTH);

    // Generate new ring if needed
    const rightmostRing = this.rings[this.rings.length - 1];
    if (rightmostRing && rightmostRing.x < this.canvasWidth - 400) {
      const newX = rightmostRing.x + GAME_CONFIG.RING_SPACING;
      this.rings.push(this.createRing(newX));
    }
  }

  public getRings(): CosmicRing[] {
    return this.rings;
  }

  public setTheme(theme: Theme): void {
    this.theme = theme;
    // Update existing ring colors
    for (const ring of this.rings) {
      ring.color = theme.visuals.ringColor;
    }
  }

  public reset(): void {
    this.initialize();
  }
}
