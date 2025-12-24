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
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT * 2,
      size: 1 + layer * 0.5 + Math.random() * 0.5,
      opacity: 0.3 + layer * 0.2 + Math.random() * 0.2,
    });
  }
  return stars;
}

interface StarLayerProps {
  stars: Star[];
  speed: number;
}

function StarLayer({ stars, speed }: StarLayerProps) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = (SCREEN_HEIGHT / speed) * 1000;

    const animation = Animated.loop(
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration,
        useNativeDriver: true,
        isInteraction: false,
      })
    );

    animation.start();

    return () => {
      animation.stop();
      translateY.setValue(0);
    };
  }, [speed, translateY]);

  return (
    <Animated.View
      style={[styles.layer, { transform: [{ translateY }] }]}
      pointerEvents="none"
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
  const layers = useMemo(
    () => [
      { stars: generateStars(25, 0), speed: 15 },
      { stars: generateStars(15, 1), speed: 30 },
      { stars: generateStars(8, 2), speed: 60 },
    ],
    []
  );

  return (
    <View style={styles.container} pointerEvents="none">
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
