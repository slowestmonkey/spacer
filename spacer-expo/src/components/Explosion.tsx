import { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

const explosionSheet = require('../../assets/effects/explosion.png');

const FRAME_COUNT = 7;
const FRAME_DURATION = 80; // ms per frame

interface ExplosionProps {
  size?: number;
  onComplete?: () => void;
}

export default function Explosion({ size = 64, onComplete }: ExplosionProps) {
  const [frame, setFrame] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => {
        if (f >= FRAME_COUNT - 1) {
          clearInterval(interval);
          // Fade out
          Animated.timing(opacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start(() => onComplete?.());
          return f;
        }
        return f + 1;
      });
    }, FRAME_DURATION);

    return () => clearInterval(interval);
  }, []);

  // Each frame is ~48px wide in the sprite sheet
  const frameWidth = 48;
  const sheetWidth = frameWidth * FRAME_COUNT;
  const scale = size / frameWidth;

  return (
    <Animated.View style={[styles.container, { width: size, height: size, opacity }]}>
      <View style={[styles.frameContainer, { width: size, height: size }]}>
        <Image
          source={explosionSheet}
          style={{
            width: sheetWidth * scale,
            height: size,
            transform: [{ translateX: -frame * frameWidth * scale }],
          }}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  frameContainer: {
    overflow: 'hidden',
  },
});
