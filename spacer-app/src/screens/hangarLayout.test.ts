import { DESIGN_HEIGHT, DESIGN_WIDTH, SPRITE_SIZE, TOTAL_SHIPS, UI_SCALE } from '../game/constants';
import {
  CAROUSEL_CONTENT_WIDTH,
  CAROUSEL_RECT,
  CONTENT_WIDTH,
  CONTENT_X,
  SHIP_ITEM_SIZE,
  SHIP_STRIDE,
  START_BUTTON_RECT,
  USERNAME_INPUT_RECT,
  USERNAME_LABEL_RECT,
  selectedIndexForScroll,
  shipHullToIndex,
} from './hangarLayout';

describe('carousel geometry', () => {
  it('advances by hangar.gd SHIP_WIDTH (52) at the container scale', () => {
    expect(SHIP_STRIDE).toBe(52 * UI_SCALE);
  });

  it('shows exactly one 48x48 ship at a time', () => {
    expect(SHIP_ITEM_SIZE).toBe(SPRITE_SIZE * UI_SCALE);
    expect(CAROUSEL_RECT.width).toBe(SHIP_ITEM_SIZE);
  });

  it('is centred within the content column', () => {
    expect(CAROUSEL_RECT.x + CAROUSEL_RECT.width / 2).toBe(CONTENT_X + CONTENT_WIDTH / 2);
  });

  it('sits within half a pixel of the middle of the screen', () => {
    expect(Math.abs(CAROUSEL_RECT.x + CAROUSEL_RECT.width / 2 - DESIGN_WIDTH / 2)).toBeLessThanOrEqual(0.5);
  });

  it('scrolls exactly far enough to reach the last ship', () => {
    expect(CAROUSEL_CONTENT_WIDTH - CAROUSEL_RECT.width).toBe((TOTAL_SHIPS - 1) * SHIP_STRIDE);
  });
});

describe('layout rects', () => {
  it('keeps every element inside the design surface', () => {
    for (const rect of [
      USERNAME_LABEL_RECT,
      USERNAME_INPUT_RECT,
      CAROUSEL_RECT,
      START_BUTTON_RECT,
    ]) {
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.y).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(DESIGN_WIDTH);
      expect(rect.y + rect.height).toBeLessThanOrEqual(DESIGN_HEIGHT);
    }
  });

  it('stacks the column in scene order without overlapping', () => {
    expect(USERNAME_LABEL_RECT.y + USERNAME_LABEL_RECT.height).toBeLessThanOrEqual(
      USERNAME_INPUT_RECT.y,
    );
    expect(USERNAME_INPUT_RECT.y + USERNAME_INPUT_RECT.height).toBeLessThanOrEqual(CAROUSEL_RECT.y);
    expect(CAROUSEL_RECT.y + CAROUSEL_RECT.height).toBeLessThanOrEqual(START_BUTTON_RECT.y);
  });
});

describe('selectedIndexForScroll', () => {
  it('snaps to the nearest ship', () => {
    expect(selectedIndexForScroll(0)).toBe(0);
    expect(selectedIndexForScroll(SHIP_STRIDE * 0.49)).toBe(0);
    expect(selectedIndexForScroll(SHIP_STRIDE * 0.51)).toBe(1);
    expect(selectedIndexForScroll(SHIP_STRIDE * 2)).toBe(2);
  });

  it('clamps past either end, matching hangar.gd', () => {
    expect(selectedIndexForScroll(-500)).toBe(0);
    expect(selectedIndexForScroll(SHIP_STRIDE * 99)).toBe(TOTAL_SHIPS - 1);
  });
});

describe('shipHullToIndex', () => {
  it('maps the stored 1-based hull back to a 0-based index', () => {
    expect(shipHullToIndex(1)).toBe(0);
    expect(shipHullToIndex(6)).toBe(5);
  });

  it('falls back to the first ship when the hull was never saved', () => {
    expect(shipHullToIndex(0)).toBe(0);
    expect(shipHullToIndex(null)).toBe(0);
    expect(shipHullToIndex(undefined)).toBe(0);
    expect(shipHullToIndex('3')).toBe(0);
  });

  it('clamps a hull number beyond the ships that ship with the game', () => {
    expect(shipHullToIndex(99)).toBe(TOTAL_SHIPS - 1);
    expect(shipHullToIndex(-4)).toBe(0);
  });

  it('round-trips what save_selection() writes', () => {
    for (let index = 0; index < TOTAL_SHIPS; index += 1) {
      expect(shipHullToIndex(index + 1)).toBe(index);
    }
  });
});
