// Background Renderer - Renders animated gradient, stars, and space effects
import { Theme } from '../../../shared/types/cosmicWhiskers';
import { GAME_CONFIG } from '../../../shared/cosmicWhiskersConstants';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  layer: number;
  seed: number;
  color: string;
}

export class BackgroundRenderer {
  private stars: Star[] = [];
  private gradientShiftProgress: number = 0;

  constructor(private canvasWidth: number, private canvasHeight: number) {
    this.initializeStars();
  }

  private initializeStars(): void {
    this.stars = [];
    const totalStars = 100;

    for (let i = 0; i < totalStars; i++) {
      const layer = Math.floor(Math.random() * GAME_CONFIG.STAR_LAYERS);
      const colorIndex = Math.floor(Math.random() * 3);
      const colors = ['#ffffff', '#e0e7ff', '#c7d2fe'];

      this.stars.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.7,
        layer,
        seed: Math.random() * Math.PI * 2,
        color: colors[colorIndex],
      });
    }
  }

  public render(ctx: CanvasRenderingContext2D, theme: Theme, time: number): void {
    // Render animated gradient background
    this.renderGradient(ctx, theme, time);

    // Render twinkling stars with parallax
    this.renderStars(ctx, theme, time);

    // Render shooting stars occasionally
    if (Math.random() < 0.001) {
      this.renderShootingStar(ctx, theme);
    }
  }

  private renderGradient(ctx: CanvasRenderingContext2D, theme: Theme, time: number): void {
    // Animate gradient shift (30-second cycle)
    this.gradientShiftProgress = (time / 30000) % 1;

    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);

    // Interpolate between main gradient and shift gradient
    const color1 = this.interpolateColor(
      theme.visuals.backgroundGradient[0],
      theme.visuals.backgroundShift[0],
      Math.sin(this.gradientShiftProgress * Math.PI * 2) * 0.5 + 0.5
    );

    const color2 = this.interpolateColor(
      theme.visuals.backgroundGradient[1],
      theme.visuals.backgroundShift[1],
      Math.sin(this.gradientShiftProgress * Math.PI * 2) * 0.5 + 0.5
    );

    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  private renderStars(ctx: CanvasRenderingContext2D, theme: Theme, time: number): void {
    const themeStarColors = theme.visuals.starColors;

    for (const star of this.stars) {
      // Twinkling effect
      const twinkle =
        0.3 +
        0.7 * Math.sin(time * 0.001 * GAME_CONFIG.STAR_TWINKLE_SPEED * Math.PI * 2 + star.seed);

      // Use theme-specific star colors
      const colorIndex = Math.floor(star.seed * themeStarColors.length) % themeStarColors.length;
      ctx.fillStyle = themeStarColors[colorIndex];
      ctx.globalAlpha = star.opacity * twinkle;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  private renderShootingStar(ctx: CanvasRenderingContext2D, theme: Theme): void {
    const startX = Math.random() * this.canvasWidth;
    const startY = Math.random() * (this.canvasHeight / 2);
    const length = 50 + Math.random() * 50;
    const angle = Math.PI / 4 + Math.random() * (Math.PI / 6);

    const gradient = ctx.createLinearGradient(
      startX,
      startY,
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    );

    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
    ctx.stroke();
  }

  private interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    if (!c1 || !c2) return color1;

    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);

    return `rgb(${r}, ${g}, ${b})`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  public updateParallax(scrollSpeed: number): void {
    // Update star positions for parallax effect
    for (const star of this.stars) {
      const parallaxSpeed = GAME_CONFIG.PARALLAX_SPEEDS[star.layer];
      star.x -= scrollSpeed * parallaxSpeed;

      // Wrap around
      if (star.x < 0) {
        star.x = this.canvasWidth;
        star.y = Math.random() * this.canvasHeight;
      }
    }
  }
}
