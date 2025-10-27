// Particle System - Manages various particle effects
import { Theme } from '../../../shared/types/cosmicWhiskers';
import { GAME_CONFIG } from '../../../shared/cosmicWhiskersConstants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation?: number;
  rotationSpeed?: number;
}

export class ParticleSystem {
  private trailParticles: Particle[] = [];
  private celebrationParticles: Particle[] = [];
  private collisionParticles: Particle[] = [];

  public update(deltaTime: number): void {
    // Update all particle types
    this.updateParticles(this.trailParticles, deltaTime);
    this.updateParticles(this.celebrationParticles, deltaTime);
    this.updateParticles(this.collisionParticles, deltaTime);
  }

  private updateParticles(particles: Particle[], deltaTime: number): void {
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];

      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;

      // Apply gravity to some particles
      if (particle.vy !== undefined) {
        particle.vy += 200 * deltaTime; // Gravity
      }

      // Update rotation
      if (particle.rotation !== undefined && particle.rotationSpeed !== undefined) {
        particle.rotation += particle.rotationSpeed * deltaTime;
      }

      // Update life
      particle.life -= deltaTime;

      // Remove dead particles
      if (particle.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderParticles(ctx, this.trailParticles);
    this.renderParticles(ctx, this.celebrationParticles);
    this.renderParticles(ctx, this.collisionParticles);
  }

  private renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
    for (const particle of particles) {
      const alpha = particle.life / particle.maxLife;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (particle.rotation !== undefined) {
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.translate(-particle.x, -particle.y);
      }

      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // Trail particles behind Luna
  public spawnTrailParticles(x: number, y: number, theme: Theme): void {
    const count = 3; // Spawn 3 per frame

    for (let i = 0; i < count; i++) {
      this.trailParticles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: -50 + (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        life: 0.5,
        maxLife: 0.5,
        size: 3 + Math.random() * 2,
        color: theme.visuals.trailColor,
      });
    }

    // Limit trail particles
    if (this.trailParticles.length > GAME_CONFIG.TRAIL_PARTICLE_COUNT * 3) {
      this.trailParticles.splice(0, this.trailParticles.length - GAME_CONFIG.TRAIL_PARTICLE_COUNT * 3);
    }
  }

  // Celebration particles when passing through a ring
  public spawnCelebrationParticles(x: number, y: number, theme: Theme): void {
    const count = GAME_CONFIG.CELEBRATION_PARTICLE_COUNT;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 100 + Math.random() * 100;

      this.celebrationParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50, // Slight upward bias
        life: 1,
        maxLife: 1,
        size: 3 + Math.random() * 3,
        color: theme.visuals.ringAccentColor,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
  }

  // Collision particles when hitting a ring or boundary
  public spawnCollisionParticles(x: number, y: number, theme: Theme): void {
    const count = GAME_CONFIG.COLLISION_PARTICLE_COUNT;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 150;

      this.collisionParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.5,
        maxLife: 1.5,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#ffffff' : theme.visuals.particleColor,
      });
    }
  }

  public clear(): void {
    this.trailParticles = [];
    this.celebrationParticles = [];
    this.collisionParticles = [];
  }
}
