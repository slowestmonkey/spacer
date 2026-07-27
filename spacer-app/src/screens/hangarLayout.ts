import { SPRITE_SIZE, TOTAL_SHIPS, UI_SCALE } from '../game/constants';

/**
 * The hangar's layout, resolved to explicit rectangles on the 393x852 design
 * surface.
 *
 * `menus/hangar.tscn` builds it from nested containers, and because the
 * `CenterContainer`'s parent is a `Node2D` its anchors resolve against an empty
 * parent rect — so the box is exactly the offsets in the scene file, `(1, 1)`
 * to `(131, 284)`, blown up 3x. Everything below is that container chain
 * evaluated ahead of time:
 *
 *   VBoxContainer (separation 4)
 *     VBoxContainer            custom_minimum_size = (0, 60)
 *       Label                  "Enter your username:"  (font_size 8)
 *       LineEdit
 *     Control2                 custom_minimum_size = (0, 20)
 *     HBoxContainer            alignment = center
 *       ScrollContainer        custom_minimum_size = (48, 60)
 *         HBoxContainer        six 48x48 TextureRects
 *     Control                  custom_minimum_size = (0, 60)
 *     StartButton
 *
 * Resolving it here (instead of leaning on flexbox) keeps the Skia layer and
 * the React Native layer pinned to the same coordinates — the ship carousel is
 * drawn on the canvas while the scroll gesture is handled by a view on top of it.
 */

/** `CenterContainer` offsets from `hangar.tscn`, scaled by the container's `scale = Vector2(3, 3)`. */
const BOX_X = 1;
const BOX_Y = 1;
const BOX_WIDTH = 130 * UI_SCALE;
const BOX_HEIGHT = 283 * UI_SCALE;

/** `BoxContainer` default `separation = 4`. */
export const SEPARATION = 4 * UI_SCALE;

/**
 * The `VBoxContainer` takes the widest minimum width among its children, and
 * that is the carousel row's `custom_minimum_size = Vector2(120, 0)` — wider
 * than "Enter your username:" (91 at font size 8), the `LineEdit` (48) and the
 * Start button (54).
 */
export const CONTENT_WIDTH = 120 * UI_SCALE;

const LABEL_HEIGHT = 10 * UI_SCALE;
const INPUT_HEIGHT = 30 * UI_SCALE;
const USERNAME_BLOCK_HEIGHT = 60 * UI_SCALE;
const GAP_BLOCK_HEIGHT = 20 * UI_SCALE;
const CAROUSEL_BLOCK_HEIGHT = 60 * UI_SCALE;
const BOTTOM_GAP_BLOCK_HEIGHT = 60 * UI_SCALE;
const BUTTON_HEIGHT = 28 * UI_SCALE;

export const CONTENT_HEIGHT =
  USERNAME_BLOCK_HEIGHT +
  GAP_BLOCK_HEIGHT +
  CAROUSEL_BLOCK_HEIGHT +
  BOTTOM_GAP_BLOCK_HEIGHT +
  BUTTON_HEIGHT +
  SEPARATION * 4;

export const CONTENT_X = BOX_X + (BOX_WIDTH - CONTENT_WIDTH) / 2;
export const CONTENT_Y = BOX_Y + (BOX_HEIGHT - CONTENT_HEIGHT) / 2;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const USERNAME_LABEL_RECT: Rect = {
  x: CONTENT_X,
  y: CONTENT_Y,
  width: CONTENT_WIDTH,
  height: LABEL_HEIGHT,
};

export const USERNAME_INPUT_RECT: Rect = {
  x: CONTENT_X,
  y: CONTENT_Y + LABEL_HEIGHT + SEPARATION,
  width: CONTENT_WIDTH,
  height: INPUT_HEIGHT,
};

/** One 48x48 ship, blown up by the container's 3x scale. */
export const SHIP_ITEM_SIZE = SPRITE_SIZE * UI_SCALE;

/** `HBoxContainer` separation between the ship thumbnails. */
export const SHIP_SEPARATION = SEPARATION;

/** `hangar.gd -> const SHIP_WIDTH = 52`, i.e. 48 + 4 separation, at 3x. */
export const SHIP_STRIDE = SHIP_ITEM_SIZE + SHIP_SEPARATION;

/**
 * `ScrollContainer.custom_minimum_size = Vector2(48, 60)` — a one-ship window,
 * centred by the `HBoxContainer`'s `alignment = 1` within the content column.
 */
export const CAROUSEL_RECT: Rect = {
  x: CONTENT_X + (CONTENT_WIDTH - SHIP_ITEM_SIZE) / 2,
  y: CONTENT_Y + USERNAME_BLOCK_HEIGHT + SEPARATION + GAP_BLOCK_HEIGHT + SEPARATION,
  width: SHIP_ITEM_SIZE,
  height: CAROUSEL_BLOCK_HEIGHT,
};

export const CAROUSEL_CONTENT_WIDTH = TOTAL_SHIPS * SHIP_ITEM_SIZE + (TOTAL_SHIPS - 1) * SHIP_SEPARATION;

/** `HScrollBar` at the bottom of the scroll container. */
export const SCROLLBAR_RECT: Rect = {
  x: CAROUSEL_RECT.x,
  y: CAROUSEL_RECT.y + SHIP_ITEM_SIZE + 8,
  width: CAROUSEL_RECT.width,
  height: 20,
};

export const START_BUTTON_RECT: Rect = {
  x: CONTENT_X,
  y:
    CONTENT_Y +
    USERNAME_BLOCK_HEIGHT +
    SEPARATION +
    GAP_BLOCK_HEIGHT +
    SEPARATION +
    CAROUSEL_BLOCK_HEIGHT +
    SEPARATION +
    BOTTOM_GAP_BLOCK_HEIGHT +
    SEPARATION,
  width: CONTENT_WIDTH,
  height: BUTTON_HEIGHT,
};

/** `hangar.gd -> snap_to_selected_ship()` */
export function selectedIndexForScroll(scrollX: number, totalShips = TOTAL_SHIPS): number {
  return Math.min(Math.max(Math.round(scrollX / SHIP_STRIDE), 0), totalShips - 1);
}

/**
 * `hangar.gd -> load_selection()`.
 *
 * Deliberate divergence from the original: `save_selection()` writes
 * `selected_index + 1` but `load_selection()` reads that number straight back
 * into `selected_index`, so re-entering the hangar preselects the ship *after*
 * the one that was chosen. The port converts the hull number back to an index.
 */
export function shipHullToIndex(shipHull: unknown, totalShips = TOTAL_SHIPS): number {
  if (typeof shipHull !== 'number' || !Number.isFinite(shipHull)) {
    return 0;
  }
  return Math.min(Math.max(Math.trunc(shipHull) - 1, 0), totalShips - 1);
}
