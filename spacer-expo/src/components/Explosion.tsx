import { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

const explosionSheet = require('../../assets/effects/explosion.png');

const FRAME_COUNT = 7;
const FRAME_WIDTH = 48;
const FRAME_DURATION = 80;

interface ExplosionProps {
  size?: number;
  onComplete?: () => void;
}

export default function Explosion({ size = 64, onComplete }: ExplosionProps) {
  const [frame, setFrame] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const interval = setInterval(() => {
      if (!mounted.current) return;

      setFrame((f) => {
        if (f >= FRAME_COUNT - 1) {
          clearInterval(interval);
          Animated.timing(opacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            if (mounted.current) onComplete?.();
          });
          return f;
        }
        return f + 1;
      });
    }, FRAME_DURATION);

    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [onComplete]);

  const scale = size / FRAME_WIDTH;
  const sheetWidth = FRAME_WIDTH * FRAME_COUNT;

  return (
    <Animated.View style={[styles.container, { width: size, height: size, opacity }]}>
      <View style={[styles.frame, { width: size, height: size }]}>
        <Image
          source={explosionSheet}
          style={{
            width: sheetWidth * scale,
            height: size,
            marginLeft: -frame * FRAME_WIDTH * scale,
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
  frame: {
    overflow: 'hidden',
  },
});
