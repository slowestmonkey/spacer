import { DESIGN_HEIGHT, DESIGN_WIDTH } from './constants';
import { computeStageMetrics } from './stageMetrics';

describe('computeStageMetrics', () => {
  it('maps 1:1 on a screen the size of the design surface', () => {
    const metrics = computeStageMetrics(DESIGN_WIDTH, DESIGN_HEIGHT);
    expect(metrics).toEqual({
      screenWidth: DESIGN_WIDTH,
      screenHeight: DESIGN_HEIGHT,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });

  it('letterboxes vertically on a taller screen', () => {
    // iPhone 17 Pro: 402 x 874.
    const metrics = computeStageMetrics(402, 874);
    expect(metrics.scale).toBeCloseTo(402 / DESIGN_WIDTH, 10);
    expect(metrics.offsetX).toBeCloseTo(0, 10);
    expect(metrics.offsetY).toBeGreaterThan(0);
  });

  it('letterboxes horizontally on a wider screen', () => {
    const metrics = computeStageMetrics(800, 852);
    expect(metrics.scale).toBe(1);
    expect(metrics.offsetX).toBe((800 - DESIGN_WIDTH) / 2);
    expect(metrics.offsetY).toBe(0);
  });

  it('never crops: the scaled surface always fits', () => {
    for (const [width, height] of [
      [320, 568],
      [375, 812],
      [393, 852],
      [430, 932],
      [1024, 1366],
    ]) {
      const { scale, offsetX, offsetY } = computeStageMetrics(width, height);
      expect(DESIGN_WIDTH * scale).toBeLessThanOrEqual(width + 1e-9);
      expect(DESIGN_HEIGHT * scale).toBeLessThanOrEqual(height + 1e-9);
      expect(offsetX).toBeGreaterThanOrEqual(0);
      expect(offsetY).toBeGreaterThanOrEqual(0);
    }
  });

  it('centres the surface in the leftover space', () => {
    const { scale, offsetX, offsetY } = computeStageMetrics(500, 1000);
    expect(offsetX * 2 + DESIGN_WIDTH * scale).toBeCloseTo(500, 10);
    expect(offsetY * 2 + DESIGN_HEIGHT * scale).toBeCloseTo(1000, 10);
  });
});
