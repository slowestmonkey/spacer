import { useImage } from '@shopify/react-native-skia';

import { EXPLOSION_TEXTURE } from '../game/assets';
import { SPRITE_SIZE } from '../game/constants';
import { SpriteFrame, useSpriteFrame } from './PixelSprite';

/**
 * Port of `effects/explosion_effect.tscn` driven by
 * `components/onetime_animated_effect.gd`.
 *
 * Seven 48x48 regions of `explosion.png` at `speed = 6.0`, `scale = Vector2(5, 5)`.
 * The animation is marked looping and the script frees the node on
 * `animation_looped`, so it plays through exactly once (~1.17s) and disappears.
 */
export const EXPLOSION_FRAME_COUNT = 7;
export const EXPLOSION_FPS = 6;
export const EXPLOSION_SCALE = 5;

interface ExplosionEffectProps {
  /** Centre of the effect on the design surface. */
  x: number;
  y: number;
  /** `queue_free()` — the parent stops rendering the effect. */
  onFinished?: () => void;
}

export function ExplosionEffect({ x, y, onFinished }: ExplosionEffectProps) {
  const image = useImage(EXPLOSION_TEXTURE);
  const frame = useSpriteFrame(EXPLOSION_FRAME_COUNT, EXPLOSION_FPS, onFinished);

  return (
    <SpriteFrame
      image={image}
      frame={frame}
      frameCount={EXPLOSION_FRAME_COUNT}
      frameSize={SPRITE_SIZE}
      scale={EXPLOSION_SCALE}
      cx={x}
      cy={y}
    />
  );
}
