import { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

function generateStars(count: number, layer: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT * 2, // Double height for seamless loop
    size: 1 + layer * 0.5 + Math.random(),
    opacity: 0.3 + layer * 0.2 + Math.random() * 0.3,
  }));
}

interface StarLayerProps {
  stars: Star[];
  speed: number;
}

function StarLayer({ stars, speed }: StarLayerProps) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = (SCREEN_HEIGHT * 2) / speed * 1000;

    const animation = Animated.loop(
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration,
        useNativeDriver: true,
      })
    );

    animation.start();
    return () => animation.stop();
  }, [speed]);

  return (
    <Animated.View
      style={[
        styles.layer,
        { transform: [{ translateY }] },
      ]}
    >
      {stars.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y - SCREEN_HEIGHT,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

export default function StarBackground() {
  const layers = useMemo(() => [
    { stars: generateStars(30, 0), speed: 20 },  // Far stars (slow)
    { stars: generateStars(20, 1), speed: 40 },  // Mid stars
    { stars: generateStars(10, 2), speed: 80 },  // Close stars (fast)
  ], []);

  return (
    <View style={styles.container}>
      {layers.map((layer, i) => (
        <StarLayer key={i} stars={layer.stars} speed={layer.speed} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});
