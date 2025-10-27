// Physics System - Handles gravity, velocity, and movement
import { LunaState } from '../../../shared/types/cosmicWhiskers';
import { GAME_CONFIG } from '../../../shared/cosmicWhiskersConstants';

export class PhysicsSystem {
  public applyGravity(luna: LunaState, deltaTime: number): void {
    // Apply downward gravity: 800 px/s²
    luna.velocityY += GAME_CONFIG.GRAVITY * deltaTime;
  }

  public applyFlapVelocity(luna: LunaState): void {
    // Apply upward velocity on flap: -350 px/s (negative = upward)
    luna.velocityY = GAME_CONFIG.FLAP_VELOCITY;
    luna.isFlapping = true;
  }

  public updatePosition(luna: LunaState, deltaTime: number): void {
    // Update vertical position based on velocity
    luna.y += luna.velocityY * deltaTime;

    // Update rotation based on velocity
    // Rotation ranges from -30° (going up) to +30° (falling)
    const rotationFactor = 0.05;
    luna.rotation = Math.max(
      -GAME_CONFIG.MAX_ROTATION,
      Math.min(GAME_CONFIG.MAX_ROTATION, luna.velocityY * rotationFactor)
    );

    // Reset flapping state
    if (luna.isFlapping) {
      luna.isFlapping = false;
    }
  }

  public checkBoundaryCollision(luna: LunaState, canvasHeight: number): boolean {
    const hitboxRadius = GAME_CONFIG.LUNA_HITBOX_RADIUS;

    // Check top boundary
    if (luna.y - hitboxRadius <= 0) {
      return true;
    }

    // Check bottom boundary
    if (luna.y + hitboxRadius >= canvasHeight) {
      return true;
    }

    return false;
  }

  public clampPosition(luna: LunaState, canvasHeight: number): void {
    const hitboxRadius = GAME_CONFIG.LUNA_HITBOX_RADIUS;

    // Clamp to top boundary
    if (luna.y - hitboxRadius < 0) {
      luna.y = hitboxRadius;
      luna.velocityY = 0;
    }

    // Clamp to bottom boundary
    if (luna.y + hitboxRadius > canvasHeight) {
      luna.y = canvasHeight - hitboxRadius;
      luna.velocityY = 0;
    }
  }
}
