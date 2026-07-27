import {
  BACKDROP_Z_INDEX,
  CLOSE_STARS_LAYER_SPEED,
  CLOSE_STARS_Z_INDEX,
  FAR_STARS_LAYER_SPEED,
  FAR_STARS_Z_INDEX,
  FLIGHT_SPEED,
  GARGANTUA_RECT,
  GARGANTUA_Z_INDEX,
  SPACE_LAYER_SPEED,
  TILE_SIZE,
} from './SpaceBackground';
import { DESIGN_HEIGHT, DESIGN_WIDTH, UI_SCALE } from '../game/constants';

describe('paint order', () => {
  it('puts Gargantua behind both starfields', () => {
    expect(GARGANTUA_Z_INDEX).toBeLessThan(FAR_STARS_Z_INDEX);
    expect(GARGANTUA_Z_INDEX).toBeLessThan(CLOSE_STARS_Z_INDEX);
  });

  it('keeps the opaque backdrop behind Gargantua, or it would hide it', () => {
    expect(BACKDROP_Z_INDEX).toBeLessThan(GARGANTUA_Z_INDEX);
  });

  it('gives every layer an explicit index, since a missing one would sort as 0', () => {
    for (const zIndex of [
      BACKDROP_Z_INDEX,
      GARGANTUA_Z_INDEX,
      FAR_STARS_Z_INDEX,
      CLOSE_STARS_Z_INDEX,
    ]) {
      expect(typeof zIndex).toBe('number');
      expect(zIndex).toBeLessThan(0);
    }
  });

  it('draws the nearest field last', () => {
    expect(CLOSE_STARS_Z_INDEX).toBeGreaterThan(FAR_STARS_Z_INDEX);
  });
});

describe('parallax', () => {
  it('keeps the layers ordered by speed, so depth still reads', () => {
    expect(SPACE_LAYER_SPEED).toBeLessThan(FAR_STARS_LAYER_SPEED);
    expect(FAR_STARS_LAYER_SPEED).toBeLessThan(CLOSE_STARS_LAYER_SPEED);
  });

  it('flies slower than the Godot original without changing the ratios', () => {
    expect(FLIGHT_SPEED).toBeGreaterThan(0);
    expect(FLIGHT_SPEED).toBeLessThan(1);
  });

  it('takes over a second for the nearest field to cross the screen', () => {
    const crossing = DESIGN_HEIGHT / (CLOSE_STARS_LAYER_SPEED * FLIGHT_SPEED);
    expect(crossing).toBeGreaterThan(2);
  });
});

describe('tiling', () => {
  it('repeats on the 3x-scaled texture size', () => {
    expect(TILE_SIZE).toBe(128 * UI_SCALE);
  });

  it('covers the surface in both directions', () => {
    expect(TILE_SIZE).toBeGreaterThanOrEqual(DESIGN_WIDTH - UI_SCALE * 4);
  });
});

describe('Gargantua', () => {
  it('is centred horizontally', () => {
    expect(GARGANTUA_RECT.x + GARGANTUA_RECT.size / 2).toBe(DESIGN_WIDTH / 2);
  });

  it('sits clear of the HUD above it and the ship below', () => {
    // FuelLabel/GoalLabel occupy y 62..95; the hull spans roughly y 497..641.
    expect(GARGANTUA_RECT.y).toBeGreaterThan(95);
    expect(GARGANTUA_RECT.y + GARGANTUA_RECT.size).toBeLessThan(497);
  });
});
