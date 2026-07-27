import {
  FilterMode,
  Group,
  Image as SkiaImage,
  MipmapMode,
  rect,
  type SkImage,
  type SamplingOptions,
} from '@shopify/react-native-skia';
import { useEffect, useRef, useState } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

/**
 * `project.godot -> textures/canvas_textures/default_texture_filter = 0` (Nearest).
 *
 * Without this every sprite would be bilinear-filtered on the way up to 3x/5x
 * and the art would smear.
 */
export const NEAREST_SAMPLING: SamplingOptions = {
  filter: FilterMode.Nearest,
  mipmap: MipmapMode.None,
};

interface PixelImageProps {
  image: SkImage | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A texture blown up with nearest-neighbour sampling, positioned by its top-left corner. */
export function PixelImage({ image, x, y, width, height }: PixelImageProps) {
  if (!image) {
    return null;
  }

  return (
    <SkiaImage
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      fit="fill"
      sampling={NEAREST_SAMPLING}
    />
  );
}

interface SpriteFrameProps {
  image: SkImage | null;
  /** Index into a horizontal strip of square frames. */
  frame: number;
  frameCount: number;
  frameSize: number;
  scale: number;
  /** Centre of the sprite, matching Godot's `AnimatedSprite2D` which is centred by default. */
  cx: number;
  cy: number;
}

/**
 * One frame of a horizontal sprite sheet — the runtime equivalent of the
 * `AtlasTexture` regions in `explosion_effect.tscn` and `ship.tscn`.
 *
 * The whole strip is drawn scaled up and clipped to the frame's window, which
 * keeps the sampling exact and works for single-frame textures too.
 */
export function SpriteFrame({
  image,
  frame,
  frameCount,
  frameSize,
  scale,
  cx,
  cy,
}: SpriteFrameProps) {
  if (!image) {
    return null;
  }

  const size = frameSize * scale;
  const left = cx - size / 2;
  const top = cy - size / 2;

  return (
    <Group clip={rect(left, top, size, size)}>
      <SkiaImage
        image={image}
        x={left - frame * size}
        y={top}
        width={size * frameCount}
        height={size}
        fit="fill"
        sampling={NEAREST_SAMPLING}
      />
    </Group>
  );
}

interface AnimatedSpriteFrameProps extends Omit<SpriteFrameProps, 'frame'> {
  /** Elapsed milliseconds, from Skia's `useClock`. */
  clock: { value: number };
  fps: number;
}

/**
 * A looping sprite-sheet animation driven entirely on the UI thread.
 *
 * The frame index only ever moves the sheet horizontally, so it can be a
 * derived value feeding the image's `x` — no React state, no re-render per
 * frame. Continuous animations (the engine plumes) use this; one-shot effects
 * that have to tell JavaScript when they finish use `useSpriteFrame` instead.
 */
export function AnimatedSpriteFrame({
  image,
  clock,
  fps,
  frameCount,
  frameSize,
  scale,
  cx,
  cy,
}: AnimatedSpriteFrameProps) {
  const size = frameSize * scale;
  const left = cx - size / 2;
  const top = cy - size / 2;

  const x = useDerivedValue(() => {
    const frame = Math.floor((clock.value / 1000) * fps) % frameCount;
    return left - frame * size;
  }, [left, size, fps, frameCount]);

  if (!image) {
    return null;
  }

  return (
    <Group clip={rect(left, top, size, size)}>
      <SkiaImage
        image={image}
        x={x}
        y={top}
        width={size * frameCount}
        height={size}
        fit="fill"
        sampling={NEAREST_SAMPLING}
      />
    </Group>
  );
}

/**
 * `AnimatedSprite2D` playback for a looping animation.
 *
 * `onLoop` fires when the last frame rolls back to the first, standing in for
 * Godot's `animation_looped` signal — the one `OnetimeAnimatedEffect` uses to
 * free itself.
 */
export function useSpriteFrame(frameCount: number, fps: number, onLoop?: () => void): number {
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);
  const onLoopRef = useRef(onLoop);
  onLoopRef.current = onLoop;

  useEffect(() => {
    if (frameCount <= 1 || fps <= 0) {
      return;
    }

    const interval = setInterval(() => {
      const next = frameRef.current + 1;
      if (next >= frameCount) {
        frameRef.current = 0;
        setFrame(0);
        onLoopRef.current?.();
      } else {
        frameRef.current = next;
        setFrame(next);
      }
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [frameCount, fps]);

  return frame;
}
