import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color palette
const PALETTE = {
  space: '#0b0f16',
  starBright: '#e6edf5',
  starSoft: '#aebcca',
  starDim: '#7a8897',
  starWarm: '#d9c8a4',
};

const PIXEL_SIZE = 2;

interface Star {
  id: number;
  x: number;
  y: number;
  color: string;
  twinkle: boolean;
  twinkleSpeed: number;
  size: number;
}

// Star color pools
const FAR_COLORS = [PALETTE.starDim];
const MID_COLORS = [PALETTE.starSoft, PALETTE.starDim];
const CLOSE_COLORS = [PALETTE.starBright, PALETTE.starSoft, PALETTE.starWarm];

// Generate stars for a specific layer
const generateLayerStars = (count: number, colors: string[], baseSize: number, idOffset: number): Star[] => {
  const stars: Star[] = [];
  const gridWidth = Math.ceil(width / PIXEL_SIZE);
  const gridHeight = Math.ceil(height / PIXEL_SIZE);

  for (let i = 0; i < count; i++) {
    stars.push({
      id: idOffset + i,
      x: Math.floor(Math.random() * gridWidth) * PIXEL_SIZE,
      y: Math.floor(Math.random() * gridHeight) * PIXEL_SIZE,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkle: Math.random() > 0.6,
      twinkleSpeed: Math.floor(Math.random() * 3),
      size: baseSize + (Math.random() > 0.7 ? PIXEL_SIZE : 0),
    });
  }
  return stars;
};

export const StarfieldBackground: React.FC = () => {
  // Generate stars separately for each layer
  const farStars = useMemo(() => generateLayerStars(42, FAR_COLORS, PIXEL_SIZE, 0), []);
  const midStars = useMemo(() => generateLayerStars(28, MID_COLORS, PIXEL_SIZE, 100), []);
  const closeStars = useMemo(() => generateLayerStars(14, CLOSE_COLORS, PIXEL_SIZE * 2, 200), []);

  const [twinkleState, setTwinkleState] = useState(0);

  // Animation values for each layer
  const farAnim = useRef(new Animated.Value(0)).current;
  const midAnim = useRef(new Animated.Value(0)).current;
  const closeAnim = useRef(new Animated.Value(0)).current;

  // All layers scroll exactly 'height' pixels, but at different speeds
  // This ensures seamless looping since stars are distributed across 'height'

  // Far layer - slowest
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(farAnim, {
        toValue: height,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [farAnim]);

  // Mid layer - medium
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(midAnim, {
        toValue: height,
        duration: 11000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [midAnim]);

  // Close layer - fastest
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(closeAnim, {
        toValue: height,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [closeAnim]);

  // Twinkle
  useEffect(() => {
    const interval = setInterval(() => {
      setTwinkleState(s => (s + 1) % 6);
    }, 240);
    return () => clearInterval(interval);
  }, []);

  const renderStarLayer = (stars: Star[], anim: Animated.Value) => (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { transform: [{ translateY: anim }] },
      ]}
    >
      {stars.map(star => {
        const visible = !star.twinkle || ((twinkleState + star.twinkleSpeed) % 3 !== 0);
        const color = visible ? star.color : 'transparent';

        return (
          <React.Fragment key={star.id}>
            {/* Primary star */}
            <View
              style={[
                styles.star,
                {
                  left: star.x,
                  top: star.y,
                  width: star.size,
                  height: star.size,
                  backgroundColor: color,
                },
              ]}
            />
            {/* Duplicate star offset by -height for seamless wrap */}
            <View
              style={[
                styles.star,
                {
                  left: star.x,
                  top: star.y - height,
                  width: star.size,
                  height: star.size,
                  backgroundColor: color,
                },
              ]}
            />
          </React.Fragment>
        );
      })}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderStarLayer(farStars, farAnim)}
      {renderStarLayer(midStars, midAnim)}
      {renderStarLayer(closeStars, closeAnim)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: PALETTE.space,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
  },
});
