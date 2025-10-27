// Luna Renderer - Renders Luna with animations and expressions
import { LunaState, Theme } from '../../../shared/types/cosmicWhiskers';
import { GAME_CONFIG } from '../../../shared/cosmicWhiskersConstants';

type FacialExpression = 'happy' | 'determined' | 'worried';

export class LunaRenderer {
  private flapFrame: number = 0;
  private lastFlapTime: number = 0;

  public render(
    ctx: CanvasRenderingContext2D,
    luna: LunaState,
    theme: Theme,
    time: number
  ): void {
    ctx.save();

    // Translate to Luna's position
    ctx.translate(luna.x, luna.y);

    // Rotate based on velocity
    ctx.rotate((luna.rotation * Math.PI) / 180);

    // Squash and stretch effect on flap
    const squashStretch = luna.isFlapping ? 1 + GAME_CONFIG.SQUASH_STRETCH_AMOUNT : 1;
    ctx.scale(squashStretch, 1 / squashStretch);

    // Determine facial expression based on velocity
    const expression = this.getFacialExpression(luna.velocityY);

    // Render wings first (behind everything)
    this.renderWings(ctx, luna.isFlapping, time);

    // Render Luna's body
    this.renderBody(ctx);

    // Render jetpack (behind the face)
    this.renderJetpack(ctx, luna.isFlapping);

    // Render face (emoji on top!)
    this.renderFace(ctx, expression, time);

    // Render space helmet (transparent, over the face)
    this.renderHelmet(ctx);

    // Render glow aura
    this.renderAura(ctx, theme);

    ctx.restore();
  }

  private getFacialExpression(velocityY: number): FacialExpression {
    if (velocityY < -100) return 'happy'; // Going up
    if (velocityY > 200) return 'worried'; // Falling fast
    return 'determined'; // Normal flight
  }

  private renderBody(ctx: CanvasRenderingContext2D): void {
    const radius = GAME_CONFIG.LUNA_HITBOX_RADIUS;

    // Simple circular body for emoji face
    ctx.fillStyle = '#fbbf24'; // Orange cat color
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add subtle gradient for depth
    const gradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 0, 0, 0, radius);
    gradient.addColorStop(0, 'rgba(254, 243, 199, 0.8)');
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  private renderHelmet(ctx: CanvasRenderingContext2D): void {
    const radius = GAME_CONFIG.LUNA_HITBOX_RADIUS;

    ctx.save();
    
    // Simple space helmet bubble
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 3, 0, Math.PI * 2);
    ctx.stroke();

    // Cute reflection/shine
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-radius * 0.5, -radius * 0.5, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderFace(
    ctx: CanvasRenderingContext2D,
    expression: FacialExpression,
    time: number
  ): void {
    const radius = GAME_CONFIG.LUNA_HITBOX_RADIUS;
    
    // Choose emoji based on expression
    let emoji = '😸'; // Default happy cat
    switch (expression) {
      case 'happy':
        emoji = '😸'; // Grinning cat
        break;
      case 'worried':
        emoji = '🙀'; // Weary cat
        break;
      case 'determined':
        emoji = '😼'; // Cat with wry smile
        break;
    }
    
    // Render emoji face - make it nice and big!
    ctx.save();
    ctx.font = `${radius * 1.8}px Arial`; // Bigger emoji
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000'; // Ensure proper color
    
    // Add slight bounce animation
    const bounce = Math.sin(time * 0.01) * 1;
    ctx.fillText(emoji, 0, bounce);
    ctx.restore();
  }

  private renderJetpack(ctx: CanvasRenderingContext2D, isFlapping: boolean): void {
    const radius = GAME_CONFIG.LUNA_HITBOX_RADIUS;

    // Simple cute jetpack
    ctx.fillStyle = '#60a5fa';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.roundRect(-radius * 0.35, radius * 0.4, radius * 0.7, radius * 0.5, 3);
    ctx.fill();
    ctx.stroke();

    // Cute flame when flapping
    if (isFlapping) {
      ctx.save();
      ctx.globalAlpha = 0.9;

      const flameGradient = ctx.createLinearGradient(0, radius * 0.9, 0, radius * 1.4);
      flameGradient.addColorStop(0, '#fde047');
      flameGradient.addColorStop(0.5, '#fb923c');
      flameGradient.addColorStop(1, 'rgba(251, 146, 60, 0)');

      ctx.fillStyle = flameGradient;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.25, radius * 0.9);
      ctx.lineTo(0, radius * 1.4);
      ctx.lineTo(radius * 0.25, radius * 0.9);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  private renderWings(ctx: CanvasRenderingContext2D, isFlapping: boolean, time: number): void {
    // Update flap animation
    if (isFlapping && time - this.lastFlapTime > 83) {
      this.flapFrame = (this.flapFrame + 1) % 5;
      this.lastFlapTime = time;
    }

    const radius = GAME_CONFIG.LUNA_HITBOX_RADIUS;
    const wingAngles = [-0.6, -0.4, 0, 0.4, 0.6]; // 5 frames
    const wingAngle = wingAngles[this.flapFrame] ?? 0;

    // Simple cute wings
    ctx.fillStyle = '#fde68a';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;

    // Left wing
    ctx.save();
    ctx.translate(-radius * 0.8, 0);
    ctx.rotate(wingAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.35, radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Right wing
    ctx.save();
    ctx.translate(radius * 0.8, 0);
    ctx.rotate(-wingAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.35, radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.globalAlpha = 1;
  }

  private renderAura(ctx: CanvasRenderingContext2D, theme: Theme): void {
    const radius = GAME_CONFIG.LUNA_HITBOX_RADIUS;

    ctx.save();
    ctx.globalAlpha = 0.2;

    const gradient = ctx.createRadialGradient(0, 0, radius, 0, 0, radius + 10);
    gradient.addColorStop(0, theme.visuals.trailColor);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
