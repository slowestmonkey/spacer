import { Group, useClock, useImage } from '@shopify/react-native-skia';
import { memo } from 'react';

import { SHIP_TEXTURES, TURBO_BLUE_TEXTURE, shipTextureExists } from '../game/assets';
import { SPRITE_SIZE } from '../game/constants';
import { AnimatedSpriteFrame, SpriteFrame } from './PixelSprite';
import {
  SHIP_SCALE,
  SHIP_SPRITE_OFFSET,
  THRUSTER_FPS,
  THRUSTER_FRAME_COUNT,
  getThrusterLocalPositions,
  toDesignSpace,
} from './shipGeometry';

export * from './shipGeometry';

/**
 * Port of `player_ship/ship.tscn` + `player_ship/ship.gd`.
 *
 * Node order in the scene puts both thrusters after the hull, so they draw on
 * top of it.
 */
export const Ship = memo(function Ship({ shipHull }: { shipHull: number }) {
  const hullTexture = shipTextureExists(shipHull) ? SHIP_TEXTURES[shipHull] : null;
  const hull = useImage(hullTexture ?? undefined);
  const turbo = useImage(TURBO_BLUE_TEXTURE);
  const clock = useClock();

  const thrusters = getThrusterLocalPositions(shipHull);
  const hullCentre = toDesignSpace(SHIP_SPRITE_OFFSET);
  const leftCentre = toDesignSpace(thrusters.left);
  const rightCentre = toDesignSpace(thrusters.right);

  return (
    <Group>
      <SpriteFrame
        image={hull}
        frame={0}
        frameCount={1}
        frameSize={SPRITE_SIZE}
        scale={SHIP_SCALE}
        cx={hullCentre.x}
        cy={hullCentre.y}
      />
      <AnimatedSpriteFrame
        image={turbo}
        clock={clock}
        fps={THRUSTER_FPS}
        frameCount={THRUSTER_FRAME_COUNT}
        frameSize={SPRITE_SIZE}
        scale={SHIP_SCALE}
        cx={leftCentre.x}
        cy={leftCentre.y}
      />
      <AnimatedSpriteFrame
        image={turbo}
        clock={clock}
        fps={THRUSTER_FPS}
        frameCount={THRUSTER_FRAME_COUNT}
        frameSize={SPRITE_SIZE}
        scale={SHIP_SCALE}
        cx={rightCentre.x}
        cy={rightCentre.y}
      />
    </Group>
  );
});
