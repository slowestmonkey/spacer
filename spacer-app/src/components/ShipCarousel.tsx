import { Group, RoundedRect, rect, useImage } from '@shopify/react-native-skia';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { SHIP_TEXTURES } from '../game/assets';
import { SPRITE_SIZE, TOTAL_SHIPS, UI_SCALE } from '../game/constants';
import {
  CAROUSEL_CONTENT_WIDTH,
  CAROUSEL_RECT,
  SCROLLBAR_RECT,
  SHIP_ITEM_SIZE,
  SHIP_STRIDE,
} from '../screens/hangarLayout';
import { PixelImage } from './PixelSprite';
import { GRABBER_COLOR, STYLE_NORMAL_COLOR } from './theme';

/**
 * `hangar.tscn -> ScrollContainer`: a 48x60 window (3x = 144x180) over an
 * `HBoxContainer` of six 48x48 ship textures.
 *
 * The thumbnails are drawn on the Skia canvas so they get the same
 * nearest-neighbour upscale as the rest of the pixel art, and an invisible
 * `ScrollView` sits on top of the same rectangle to provide the gesture. Both
 * halves read their geometry from `hangarLayout`, so they cannot drift apart.
 */
export function ShipCarouselSprites({ scrollX }: { scrollX: SharedValue<number> }) {
  const transform = useDerivedValue(() => [{ translateX: -scrollX.value }]);

  const thumbWidth = (CAROUSEL_RECT.width / CAROUSEL_CONTENT_WIDTH) * SCROLLBAR_RECT.width;
  const thumbTravel = SCROLLBAR_RECT.width - thumbWidth;
  const maxScroll = CAROUSEL_CONTENT_WIDTH - CAROUSEL_RECT.width;
  const thumbTransform = useDerivedValue(() => [
    { translateX: maxScroll <= 0 ? 0 : (scrollX.value / maxScroll) * thumbTravel },
  ]);

  return (
    <Group>
      <Group
        clip={rect(CAROUSEL_RECT.x, CAROUSEL_RECT.y, CAROUSEL_RECT.width, SHIP_ITEM_SIZE)}>
        <Group transform={transform}>
          {Array.from({ length: TOTAL_SHIPS }, (_unused, index) => (
            <CarouselShip key={index} index={index} />
          ))}
        </Group>
      </Group>

      <RoundedRect
        x={SCROLLBAR_RECT.x}
        y={SCROLLBAR_RECT.y}
        width={SCROLLBAR_RECT.width}
        height={SCROLLBAR_RECT.height}
        r={SCROLLBAR_RECT.height / 2}
        color={STYLE_NORMAL_COLOR}
      />
      <Group transform={thumbTransform}>
        <RoundedRect
          x={SCROLLBAR_RECT.x}
          y={SCROLLBAR_RECT.y}
          width={thumbWidth}
          height={SCROLLBAR_RECT.height}
          r={SCROLLBAR_RECT.height / 2}
          color={GRABBER_COLOR}
        />
      </Group>
    </Group>
  );
}

function CarouselShip({ index }: { index: number }) {
  const image = useImage(SHIP_TEXTURES[index + 1]);

  return (
    <PixelImage
      image={image}
      x={CAROUSEL_RECT.x + index * SHIP_STRIDE}
      y={CAROUSEL_RECT.y}
      width={SPRITE_SIZE * UI_SCALE}
      height={SPRITE_SIZE * UI_SCALE}
    />
  );
}

interface ShipCarouselScrollerProps {
  scrollX: SharedValue<number>;
  initialIndex: number;
  onSelect: (index: number) => void;
}

/**
 * The gesture surface. `hangar.gd` snaps to the nearest ship on touch release
 * with a 0.3s tween; `snapToInterval` plus fast deceleration is the platform's
 * equivalent.
 */
export function ShipCarouselScroller({
  scrollX,
  initialIndex,
  onSelect,
}: ShipCarouselScrollerProps) {
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  return (
    <View
      style={[
        styles.scroller,
        {
          left: CAROUSEL_RECT.x,
          top: CAROUSEL_RECT.y,
          width: CAROUSEL_RECT.width,
          height: SHIP_ITEM_SIZE,
        },
      ]}>
      <Animated.ScrollView
        testID="ship-carousel"
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SHIP_STRIDE}
        decelerationRate="fast"
        disableIntervalMomentum
        contentOffset={{ x: initialIndex * SHIP_STRIDE, y: 0 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => onSelect(event.nativeEvent.contentOffset.x)}
        onScrollEndDrag={(event) => onSelect(event.nativeEvent.contentOffset.x)}>
        <View style={{ width: CAROUSEL_CONTENT_WIDTH, height: SHIP_ITEM_SIZE }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroller: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});
