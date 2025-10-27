// Ring Renderer - Renders cosmic rings with glow effects and animations
import { CosmicRing, Theme } from '../../../shared/types/cosmicWhiskers';
import { GAME_CONFIG } from '../../../shared/cosmicWhiskersConstants';

interface OrbitParticle {
  angle: number;
  distance: number;
  size: number;
}

export class RingRenderer {
  private orbitParticles: Map<CosmicRing, OrbitParticle[]> = new Map();

  public render(
    ctx: CanvasRenderingContext2D,
    rings: CosmicRing[],
    theme: Theme,
    time: number
  ): void {
    for (const ring of rings) {
      this.renderRing(ctx, ring, theme, time);
    }
  }

  private renderRing(
    ctx: CanvasRenderingContext2D,
    ring: CosmicRing,
    theme: Theme,
    time: number
  ): void {
    const ringWidth = GAME_CONFIG.RING_WIDTH;
    const gapTop = ring.gapY - ring.gapSize / 2;
    const gapBottom = ring.gapY + ring.gapSize / 2;

    // Pulsing scale animation
    const pulseScale = 1 + 0.05 * Math.sin((time / 1000) * Math.PI * 2 * GAME_CONFIG.RING_PULSE_SPEED);

    ctx.save();

    // Render outer bloom (soft glow)
    this.renderOuterBloom(ctx, ring, theme, ringWidth, gapTop, gapBottom);

    // Render ring body with pulsing
    ctx.save();
    ctx.translate(ring.x, ring.gapY);
    ctx.scale(pulseScale, pulseScale);
    ctx.translate(-ring.x, -ring.gapY);

    // Top part
    ctx.fillStyle = theme.visuals.ringColor;
    ctx.fillRect(ring.x - ringWidth / 2, 0, ringWidth, gapTop);

    // Bottom part
    ctx.fillRect(ring.x - ringWidth / 2, gapBottom, ringWidth, 600 - gapBottom);

    ctx.restore();

    // Render inner glow (bright)
    this.renderInnerGlow(ctx, ring, theme, ringWidth, gapTop, gapBottom);

    // Render shimmer effect
    this.renderShimmer(ctx, ring, theme, ringWidth, gapTop, gapBottom, time);

    // Render orbiting particles
    this.renderOrbitParticles(ctx, ring, theme, time);

    ctx.restore();
  }

  private renderOuterBloom(
    ctx: CanvasRenderingContext2D,
    ring: CosmicRing,
    theme: Theme,
    ringWidth: number,
    gapTop: number,
    gapBottom: number
  ): void {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.filter = 'blur(20px)';

    ctx.fillStyle = theme.visuals.ringGlowColor;
    ctx.fillRect(ring.x - ringWidth / 2 - 10, 0, ringWidth + 20, gapTop);
    ctx.fillRect(ring.x - ringWidth / 2 - 10, gapBottom, ringWidth + 20, 600 - gapBottom);

    ctx.filter = 'none';
    ctx.restore();
  }

  private renderInnerGlow(
    ctx: CanvasRenderingContext2D,
    ring: CosmicRing,
    theme: Theme,
    ringWidth: number,
    gapTop: number,
    gapBottom: number
  ): void {
    ctx.save();
    ctx.globalAlpha = 0.6;

    // Create gradient for inner glow
    const topGradient = ctx.createLinearGradient(
      ring.x - ringWidth / 2,
      0,
      ring.x + ringWidth / 2,
      0
    );
    topGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    topGradient.addColorStop(0.5, theme.visuals.ringGlowColor);
    topGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = topGradient;
    ctx.fillRect(ring.x - ringWidth / 2, 0, ringWidth, gapTop);
    ctx.fillRect(ring.x - ringWidth / 2, gapBottom, ringWidth, 600 - gapBottom);

    // Edge highlights
    ctx.strokeStyle = theme.visuals.ringGlowColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(ring.x - ringWidth / 2, 0, ringWidth, gapTop);
    ctx.strokeRect(ring.x - ringWidth / 2, gapBottom, ringWidth, 600 - gapBottom);

    ctx.restore();
  }

  private renderShimmer(
    ctx: CanvasRenderingContext2D,
    ring: CosmicRing,
    theme: Theme,
    ringWidth: number,
    gapTop: number,
    gapBottom: number,
    time: number
  ): void {
    ctx.save();
    ctx.globalAlpha = 0.4;

    // Moving highlight
    const shimmerPos = ((time / 1000) % 2) / 2; // 0 to 1 over 2 seconds

    const gradient = ctx.createLinearGradient(
      ring.x - ringWidth / 2,
      0,
      ring.x + ringWidth / 2,
      0
    );

    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(Math.max(0, shimmerPos - 0.1), 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(shimmerPos, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(Math.min(1, shimmerPos + 0.1), 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(ring.x - ringWidth / 2, 0, ringWidth, gapTop);
    ctx.fillRect(ring.x - ringWidth / 2, gapBottom, ringWidth, 600 - gapBottom);

    ctx.restore();
  }

  private renderOrbitParticles(
    ctx: CanvasRenderingContext2D,
    ring: CosmicRing,
    theme: Theme,
    time: number
  ): void {
    // Initialize particles for this ring if not exists
    if (!this.orbitParticles.has(ring)) {
      const particles: OrbitParticle[] = [];
      for (let i = 0; i < GAME_CONFIG.RING_ORBIT_PARTICLES; i++) {
        particles.push({
          angle: (i / GAME_CONFIG.RING_ORBIT_PARTICLES) * Math.PI * 2,
          distance: 50 + Math.random() * 10,
          size: 2 + Math.random() * 2,
        });
      }
      this.orbitParticles.set(ring, particles);
    }

    const particles = this.orbitParticles.get(ring)!;
    const rotationSpeed = 0.001;

    ctx.save();
    ctx.fillStyle = theme.visuals.ringAccentColor;
    ctx.globalAlpha = 0.8;

    for (const particle of particles) {
      // Update angle
      particle.angle += rotationSpeed * time;

      // Calculate position around gap center
      const x = ring.x + Math.cos(particle.angle) * particle.distance;
      const y = ring.gapY + Math.sin(particle.angle) * particle.distance;

      // Draw particle
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      // Add glow
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, particle.size * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.8;
    }

    ctx.restore();
  }

  public cleanupRing(ring: CosmicRing): void {
    this.orbitParticles.delete(ring);
  }
}
