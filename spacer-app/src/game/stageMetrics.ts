import { DESIGN_HEIGHT, DESIGN_WIDTH } from './constants';

export interface StageMetrics {
  screenWidth: number;
  screenHeight: number;
  /** Design pixels -> screen points. */
  scale: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Godot's `window/stretch/mode = "viewport"` with the default `aspect = "keep"`:
 * scale the 393x852 surface uniformly to fit the device and letterbox whatever
 * is left over.
 */
export function computeStageMetrics(screenWidth: number, screenHeight: number): StageMetrics {
  const scale = Math.min(screenWidth / DESIGN_WIDTH, screenHeight / DESIGN_HEIGHT);

  return {
    screenWidth,
    screenHeight,
    scale,
    offsetX: (screenWidth - DESIGN_WIDTH * scale) / 2,
    offsetY: (screenHeight - DESIGN_HEIGHT * scale) / 2,
  };
}
