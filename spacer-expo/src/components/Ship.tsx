import { useEffect, useRef } from 'react';
import { Image, StyleSheet, View, Animated } from 'react-native';
import { getShipById } from '../data/ships';

const thrusterImage = require('../../assets/effects/turbo_blue.png');

interface ShipProps {
  hullId: number;
  size?: number;
  showThruster?: boolean;
}

export default function Ship({ hullId, size = 64, showThruster = true }: ShipProps) {
  const ship = getShipById(hullId);
  const thrusterOpacity = useRef(new Animated.Value(0.6)).current;
  const thrusterScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!showThruster) return;

    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(thrusterOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(thrusterOpacity, {
            toValue: 0.5,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(thrusterScale, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(thrusterScale, {
            toValue: 0.9,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [showThruster]);

  if (!ship) {
    return null;
  }

  const thrusterSize = size * 0.4;

  return (
    <View style={styles.container}>
      <Image
        source={ship.image}
        style={[styles.ship, { width: size, height: size }]}
        resizeMode="contain"
      />
      {showThruster && (
        <Animated.Image
          source={thrusterImage}
          style={[
            styles.thruster,
            {
              width: thrusterSize,
              height: thrusterSize,
              bottom: -thrusterSize * 0.6,
              opacity: thrusterOpacity,
              transform: [{ scaleY: thrusterScale }],
            },
          ]}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ship: {},
  thruster: {
    position: 'absolute',
  },
});
