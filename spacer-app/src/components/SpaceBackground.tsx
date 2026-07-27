import {
  Group,
  ImageShader,
  Rect,
  rect,
  useClock,
  useImage,
  type SkImage,
} from '@shopify/react-native-skia';
import { memo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import {
  CLOSE_STARS_TEXTURE,
  FAR_STARS_TEXTURE,
  GARGANTUA_TEXTURE,
  SPACE_TEXTURE,
} from '../game/assets';
import { DESIGN_HEIGHT, DESIGN_WIDTH, UI_SCALE } from '../game/constants';
import { NEAREST_SAMPLING, PixelImage } from './PixelSprite';

/**
 * Port of `effects/space_background.tscn` + `effects/space_background.gd`.
 *
 * Three `ParallaxLayer`s scroll downwards at different rates:
 *
 *   space_layer.motion_offset.y       += exponent * 100 * delta
 *   far_stars_layer.motion_offset.y   += exponent * 200 * delta
 *   close_stars_layer.motion_offset.y += exponent * 500 * delta
 */
export const SPACE_LAYER_SPEED = 100;
export const FAR_STARS_LAYER_SPEED = 200;
export const CLOSE_STARS_LAYER_SPEED = 500;

/**
 * Cruise speed, as a fraction of the Godot original's.
 *
 * At full speed the closest field crosses the screen in 1.7s, which at 3px per
 * star strobes rather than glides. Slower reads as a heavier ship under way,
 * and the parallax ratios between the three layers are untouched.
 */
export const FLIGHT_SPEED = 0.4;

/**
 * Explicit paint order. React Native Skia sorts sibling groups by `zIndex` and
 * treats a missing one as 0 — so every layer needs a value, or the opaque
 * backdrop would sort above Gargantua and hide it.
 */
export const BACKDROP_Z_INDEX = -2000;
export const GARGANTUA_Z_INDEX = -1000;
export const FAR_STARS_Z_INDEX = -200;
export const CLOSE_STARS_Z_INDEX = -100;

/**
 * Each layer's `TextureRect` has `stretch_mode = 1` (`STRETCH_TILE`), so the
 * 128x128 texture repeats rather than stretching. At the container's 3x scale
 * that is a 384px tile, which keeps every star a square 3x3 block.
 */
export const TILE_SIZE = 128 * UI_SCALE;

interface ParallaxLayerProps {
  image: SkImage | null;
  speed: number;
  clock: { value: number };
}

/**
 * One full-surface rectangle painted with a repeating image shader.
 *
 * Tiling in the shader rather than emitting a grid of image nodes turns each
 * layer into a single draw. Scrolling is the shader's local matrix, which the
 * GPU applies while it samples — nothing is re-uploaded per frame, and no part
 * of the scene graph is rebuilt.
 */
function ParallaxLayer({ image, speed, clock }: ParallaxLayerProps) {
  const transform = useDerivedValue(() => {
    // Wrapping on the tile size keeps the offset small and lands on the
    // texture's own seamless period.
    const offset = speed === 0 ? 0 : ((clock.value / 1000) * speed) % TILE_SIZE;
    return [{ translateY: offset }];
  }, [speed]);

  return (
    <Rect x={0} y={0} width={DESIGN_WIDTH} height={DESIGN_HEIGHT}>
      <ImageShader
        image={image}
        tx="repeat"
        ty="repeat"
        fit="fill"
        rect={rect(0, 0, TILE_SIZE, TILE_SIZE)}
        sampling={NEAREST_SAMPLING}
        transform={transform}
      />
    </Rect>
  );
}

/** The 96x96 source blown up 3x, like every other sprite. */
export const GARGANTUA_SIZE = 96 * UI_SCALE;

/**
 * Gargantua sits high on the surface and does not scroll: the parallax rushes
 * past it, and it never gets any closer. Clear of the fuel and goal readouts
 * above it and the ship below.
 */
export const GARGANTUA_RECT = {
  x: (DESIGN_WIDTH - GARGANTUA_SIZE) / 2,
  y: 250 - GARGANTUA_SIZE / 2,
  size: GARGANTUA_SIZE,
};

/** Held back from full brightness so it settles behind the starfields. */
const GARGANTUA_OPACITY = 0.8;

function Gargantua() {
  const image = useImage(GARGANTUA_TEXTURE);

  return (
    <Group opacity={GARGANTUA_OPACITY}>
      <PixelImage
        image={image}
        x={GARGANTUA_RECT.x}
        y={GARGANTUA_RECT.y}
        width={GARGANTUA_RECT.size}
        height={GARGANTUA_RECT.size}
      />
    </Group>
  );
}

interface SpaceBackgroundProps {
  /** `@export var exponent: int = 1` — the hangar instances the scene with `exponent = 0`. */
  exponent?: number;
}

/**
 * Memoised: the world scene re-renders every two seconds when the fuel readout
 * ticks, and the backdrop has no reason to be rebuilt for that.
 */
export const SpaceBackground = memo(function SpaceBackground({
  exponent = 1,
}: SpaceBackgroundProps) {
  const space = useImage(SPACE_TEXTURE);
  const farStars = useImage(FAR_STARS_TEXTURE);
  const closeStars = useImage(CLOSE_STARS_TEXTURE);
  const clock = useClock();

  const drift = exponent * FLIGHT_SPEED;

  return (
    <Group>
      <Group zIndex={BACKDROP_Z_INDEX}>
        <ParallaxLayer image={space} speed={drift * SPACE_LAYER_SPEED} clock={clock} />
      </Group>
      {/* Furthest thing in the sky: behind both starfields, above only the void. */}
      <Group zIndex={GARGANTUA_Z_INDEX}>
        <Gargantua />
      </Group>
      <Group zIndex={FAR_STARS_Z_INDEX}>
        <ParallaxLayer image={farStars} speed={drift * FAR_STARS_LAYER_SPEED} clock={clock} />
      </Group>
      <Group zIndex={CLOSE_STARS_Z_INDEX}>
        <ParallaxLayer image={closeStars} speed={drift * CLOSE_STARS_LAYER_SPEED} clock={clock} />
      </Group>
    </Group>
  );
});
