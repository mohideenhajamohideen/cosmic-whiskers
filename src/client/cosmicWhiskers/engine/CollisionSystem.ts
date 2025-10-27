// Collision System - Handles collision detection between Luna and rings
import { LunaState, CosmicRing } from '../../../shared/types/cosmicWhiskers';
import { GAME_CONFIG } from '../../../shared/cosmicWhiskersConstants';

export class CollisionSystem {
  public checkRingCollision(luna: LunaState, ring: CosmicRing): boolean {
    const lunaRadius = GAME_CONFIG.LUNA_HITBOX_RADIUS;
    const ringWidth = GAME_CONFIG.RING_WIDTH;

    // Check if Luna is horizontally aligned with the ring
    const lunaRight = luna.x + lunaRadius;
    const lunaLeft = luna.x - lunaRadius;
    const ringLeft = ring.x - ringWidth / 2;
    const ringRight = ring.x + ringWidth / 2;

    // Luna is not in the ring's horizontal range
    if (lunaRight < ringLeft || lunaLeft > ringRight) {
      return false;
    }

    // Luna is in the ring's horizontal range, check vertical position
    const gapTop = ring.gapY - ring.gapSize / 2;
    const gapBottom = ring.gapY + ring.gapSize / 2;
    const lunaTop = luna.y - lunaRadius;
    const lunaBottom = luna.y + lunaRadius;

    // Check if Luna is outside the gap (collision with ring)
    if (lunaTop < gapTop || lunaBottom > gapBottom) {
      return true; // Collision detected
    }

    return false; // Luna passed through the gap safely
  }

  public checkIfPassed(luna: LunaState, ring: CosmicRing): boolean {
    // Check if Luna has passed the ring (Luna's left edge is past ring's right edge)
    const lunaLeft = luna.x - GAME_CONFIG.LUNA_HITBOX_RADIUS;
    const ringRight = ring.x + GAME_CONFIG.RING_WIDTH / 2;

    return lunaLeft > ringRight;
  }
}
