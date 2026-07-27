import { Canvas, Group } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { BACKGROUND_COLOR, DESIGN_HEIGHT, DESIGN_WIDTH } from './constants';
import { computeStageMetrics, type StageMetrics } from './stageMetrics';

export type { StageMetrics };

/** Godot's viewport stretch, resolved against the current window size. */
export function useStage(): StageMetrics {
  const { width, height } = useWindowDimensions();
  return computeStageMetrics(width, height);
}

/** Root of every scene: the black letterbox Godot draws behind the viewport. */
export function Scene({ children }: { children: ReactNode }) {
  return <View style={styles.scene}>{children}</View>;
}

/**
 * The `Node2D` half of a scene.
 *
 * The canvas itself is laid out at full screen size so Skia rasterises at the
 * device's native resolution; the design-space -> screen transform is applied
 * inside the scene graph. Scaling the canvas *view* instead would rasterise at
 * 1x and then resample, which is exactly the blur pixel art must avoid.
 */
export function GameCanvas({ children }: { children: ReactNode }) {
  const { screenWidth, screenHeight, scale, offsetX, offsetY } = useStage();

  return (
    <Canvas style={[styles.canvas, { width: screenWidth, height: screenHeight }]}>
      <Group transform={[{ translateX: offsetX }, { translateY: offsetY }, { scale }]}>
        {children}
      </Group>
    </Canvas>
  );
}

/**
 * The `Control` half of a scene: regular React Native views positioned with the
 * same coordinates the `.tscn` files use, scaled onto the device as one unit.
 */
export function UiLayer({ children }: { children: ReactNode }) {
  const { scale, offsetX, offsetY } = useStage();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.ui,
        {
          left: offsetX,
          top: offsetY,
          transform: [{ scale }],
        },
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  canvas: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  ui: {
    position: 'absolute',
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    transformOrigin: 'top left',
  },
});
