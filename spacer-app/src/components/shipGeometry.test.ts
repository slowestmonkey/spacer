import { DESIGN_HEIGHT, DESIGN_WIDTH, SPRITE_SIZE, TOTAL_SHIPS } from '../game/constants';
import {
  SHIP_POSITION,
  SHIP_SCALE,
  SHIP_SPRITE_OFFSET,
  THRUSTER_OFFSETS,
  getShipDestroyPosition,
  getThrusterLocalPositions,
  toDesignSpace,
} from './shipGeometry';

describe('toDesignSpace', () => {
  it('places the hull where world.tscn puts it', () => {
    expect(toDesignSpace(SHIP_SPRITE_OFFSET)).toEqual({ x: 204, y: 569 });
  });

  it('applies the ship node position and 3x scale', () => {
    expect(toDesignSpace({ x: 0, y: 0 })).toEqual(SHIP_POSITION);
    expect(toDesignSpace({ x: 1, y: 1 })).toEqual({
      x: SHIP_POSITION.x + SHIP_SCALE,
      y: SHIP_POSITION.y + SHIP_SCALE,
    });
  });
});

describe('getThrusterLocalPositions', () => {
  it('adds the hull offset to the sprite position', () => {
    // Ranger: left (-6, 29), right (5, 29) from the sprite at (2, 23).
    expect(getThrusterLocalPositions(1)).toEqual({
      left: { x: -4, y: 52 },
      right: { x: 7, y: 52 },
    });
  });

  it('falls back to the hull 0 offsets for an unknown hull', () => {
    expect(getThrusterLocalPositions(99)).toEqual(getThrusterLocalPositions(0));
  });

  it('places every hull symmetrically about the sprite mirror axis', () => {
    // A 48px sprite is mirrored about column 23.5, while offsets are measured
    // from column 24 — so a symmetric pair sums to -1, not 0.
    for (let hull = 1; hull <= TOTAL_SHIPS; hull += 1) {
      const { left, right } = THRUSTER_OFFSETS[hull];
      expect(left.x + right.x).toBe(-1);
      expect(left.y).toBe(right.y);
    }
  });

  it('covers every hull the hangar can select', () => {
    for (let hull = 1; hull <= TOTAL_SHIPS; hull += 1) {
      expect(THRUSTER_OFFSETS[hull]).toBeDefined();
    }
  });

  it('keeps every thruster below the hull centre and on screen', () => {
    const half = (SPRITE_SIZE * SHIP_SCALE) / 2;

    for (let hull = 1; hull <= TOTAL_SHIPS; hull += 1) {
      const { left, right } = getThrusterLocalPositions(hull);

      for (const thruster of [left, right]) {
        expect(thruster.y).toBeGreaterThan(SHIP_SPRITE_OFFSET.y);

        const centre = toDesignSpace(thruster);
        expect(centre.x - half).toBeGreaterThanOrEqual(0);
        expect(centre.x + half).toBeLessThanOrEqual(DESIGN_WIDTH);
        expect(centre.y + half).toBeLessThanOrEqual(DESIGN_HEIGHT);
      }
    }
  });

  it('keeps the left thruster left of the right one on every hull', () => {
    for (let hull = 1; hull <= TOTAL_SHIPS; hull += 1) {
      const { left, right } = getThrusterLocalPositions(hull);
      expect(left.x).toBeLessThan(right.x);
    }
  });
});

describe('getShipDestroyPosition', () => {
  it('spawns the explosion 100px below the ship, as destroyed_component.gd does', () => {
    expect(getShipDestroyPosition()).toEqual({ x: 198, y: 600 });
  });
});
