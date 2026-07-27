import { UI_SCALE } from '../game/constants';

/**
 * Chrome for the `Button`, `LineEdit` and `HScrollBar`.
 *
 * The metrics still come from Godot's built-in default theme (see
 * `scene/theme/default_theme.cpp`) pre-multiplied by the menus' 3x container
 * scale, but the colours are cooled to match the rest of the art: instrument
 * panels lit by nothing but starlight, with a single amber accent standing in
 * for the one warm light source in the sky.
 */
export const STYLE_NORMAL_COLOR = 'rgba(12, 16, 24, 0.72)';
export const STYLE_PRESSED_COLOR = 'rgba(4, 6, 10, 0.85)';
export const STYLE_FOCUS_COLOR = 'rgba(207, 228, 255, 0.7)';
export const GRABBER_COLOR = 'rgba(207, 228, 255, 0.5)';

/** Gargantua's amber, reused as the interface's only warm colour. */
export const ACCENT_COLOR = 'rgba(240, 162, 74, 0.85)';

export const CORNER_RADIUS = 3 * UI_SCALE;
export const CONTENT_MARGIN = 4 * UI_SCALE;
export const FOCUS_BORDER_WIDTH = UI_SCALE;
