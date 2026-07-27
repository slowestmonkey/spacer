/**
 * Values ported 1:1 from the Godot project so the React Native build lays out
 * identically to the original.
 *
 * Godot `project.godot`:
 *   window/size/viewport_width  = 393
 *   window/size/viewport_height = 852
 *   window/stretch/mode         = "viewport"  (aspect defaults to "keep")
 *
 * Every scene is authored against this 393x852 design surface and the whole
 * surface is uniformly scaled + letterboxed onto the device screen, exactly
 * like Godot's viewport stretch mode.
 */
export const DESIGN_WIDTH = 393;
export const DESIGN_HEIGHT = 852;

/**
 * The menus wrap their content in a `CenterContainer` with `scale = Vector2(3, 3)`
 * and the ship in `world.tscn` is placed with `scale = Vector2(3, 3)`. Pixel art
 * is authored at 1x and blown up by this factor.
 */
export const UI_SCALE = 3;

/** Every ship / effect frame in `assets/` is 48x48. */
export const SPRITE_SIZE = 48;

/** `fonts/kenney_mini_square.ttf`, registered under this family at runtime. */
export const FONT_FAMILY = 'KenneyMiniSquare';

/**
 * Godot's default theme `default_font_color` — what `Button` and `LineEdit`
 * inherit.
 */
export const TEXT_COLOR = '#dfdfdf';

/**
 * Every `Label` in the game is driven by a `LabelSettings` resource, and none of
 * the three set `font_color`, so they all take `LabelSettings`' own default of
 * `Color(1, 1, 1)` rather than the theme colour above.
 */
export const LABEL_TEXT_COLOR = '#ffffff';

/** `boot_splash/bg_color = Color(0, 0, 0, 1)` */
export const BACKGROUND_COLOR = '#000000';

/** Godot's `user://settings.cfg` — see `src/storage/ConfigFile.ts`. */
export const SETTINGS_FILE_PATH = 'user://settings.cfg';

export const SHIP_DATA_SECTION = 'ship_data';
export const GOAL_DATA_SECTION = 'goal_data';

export const SHIP_HULL_KEY = 'ship_hull';
export const USERNAME_KEY = 'username';
export const JOURNEY_STARTED_AT_KEY = 'journey_started_at';
export const GOAL_KEY = 'goal';
export const GOAL_SET_AT_KEY = 'goal_set_at';

/** Number of hull textures shipped in `assets/ships`. */
export const TOTAL_SHIPS = 6;
