import { useEffect, useRef } from 'react';
import { Image, StyleSheet, View, Animated } from 'react-native';
import { getShipById } from '../data/ships';

const thrusterImage = require('../../assets/effects/turbo_blue.png');

// Thruster offsets per ship (relative to ship center, in original 32px scale)
// Format: { left: [x, y], right: [x, y] }
const THRUSTER_OFFSETS: Record<number, { left: [number, number]; right: [number, number] }> = {
  1: { left: [-3, 12], right: [3, 12] },
  2: { left: [-10, 10], right: [10, 10] },
  3: { left: [-2, 8], right: [2, 8] },
  4: { left: [0, 10], right: [0, 10] }, // Single center thruster
  5: { left: [-4, 11], right: [4, 11] },
  6: { left: [-2, 12], right: [2, 12] },
};

const BASE_SHIP_SIZE = 32; // Original ship sprite size
const THRUSTER_SIZE = 8; // Original thruster size

interface ShipProps {
  hullId: number;
  size?: number;
  showThruster?: boolean;
}

export default function Ship({ hullId, size = 64, showThruster = true }: ShipProps) {
  const ship = getShipById(hullId);
  const thrusterOpacity = useRef(new Animated.Value(0.8)).current;
  const thrusterScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!showThruster) return;

    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(thrusterOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(thrusterOpacity, {
            toValue: 0.6,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(thrusterScale, {
            toValue: 1.3,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(thrusterScale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [showThruster]);

  if (!ship) return null;

  const scale = size / BASE_SHIP_SIZE;
  const offsets = THRUSTER_OFFSETS[hullId] ?? THRUSTER_OFFSETS[1];
  const thrusterDisplaySize = THRUSTER_SIZE * scale;

  // Check if single center thruster (left and right same position)
  const isSingleThruster =
    offsets.left[0] === offsets.right[0] &&
    offsets.left[1] === offsets.right[1];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={ship.image}
        style={[styles.ship, { width: size, height: size }]}
        resizeMode="contain"
      />

      {showThruster && (
        <>
          {/* Left thruster */}
          <Animated.Image
            source={thrusterImage}
            style={[
              styles.thruster,
              {
                width: thrusterDisplaySize,
                height: thrusterDisplaySize * 1.5,
                left: size / 2 + offsets.left[0] * scale - thrusterDisplaySize / 2,
                top: size / 2 + offsets.left[1] * scale,
                opacity: thrusterOpacity,
                transform: [{ scaleY: thrusterScale }],
              },
            ]}
            resizeMode="contain"
          />

          {/* Right thruster (skip if single center) */}
          {!isSingleThruster && (
            <Animated.Image
              source={thrusterImage}
              style={[
                styles.thruster,
                {
                  width: thrusterDisplaySize,
                  height: thrusterDisplaySize * 1.5,
                  left: size / 2 + offsets.right[0] * scale - thrusterDisplaySize / 2,
                  top: size / 2 + offsets.right[1] * scale,
                  opacity: thrusterOpacity,
                  transform: [{ scaleY: thrusterScale }],
                },
              ]}
              resizeMode="contain"
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  ship: {},
  thruster: {
    position: 'absolute',
  },
});
