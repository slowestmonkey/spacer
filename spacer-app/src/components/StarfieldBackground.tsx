import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

// 16-bit style palette
const PALETTE = {
  space: '#000011',
  spaceDark: '#000008',
  starWhite: '#ffffff',
  starDim: '#888899',
  starYellow: '#ffff00',
  starCyan: '#00ffff',
  starPink: '#ff00ff',
  // Earth colors
  earthBlue: '#0066cc',
  earthBlueDark: '#003366',
  earthGreen: '#00aa00',
  earthGreenDark: '#006600',
  earthWhite: '#ffffff',
  earthCyan: '#00aaaa',
};

// Pixel size for that chunky 16-bit look
const PIXEL_SIZE = 4;

interface Star {
  id: number;
  x: number;
  y: number;
  color: string;
  twinkle: boolean;
  layer: number; // 0=far, 1=mid, 2=close
}

// Generate stars with pixel-aligned positions
const generateStars = (): Star[] => {
  const stars: Star[] = [];
  const gridWidth = Math.ceil(width / PIXEL_SIZE);
  const gridHeight = Math.ceil(height / PIXEL_SIZE);

  // Far stars - small, dim, many
  for (let i = 0; i < 60; i++) {
    stars.push({
      id: i,
      x: Math.floor(Math.random() * gridWidth) * PIXEL_SIZE,
      y: Math.floor(Math.random() * gridHeight * 2) * PIXEL_SIZE,
      color: Math.random() > 0.7 ? PALETTE.starDim : PALETTE.starWhite,
      twinkle: Math.random() > 0.8,
      layer: 0,
    });
  }

  // Mid stars - medium brightness
  for (let i = 60; i < 100; i++) {
    const colorRand = Math.random();
    let color = PALETTE.starWhite;
    if (colorRand > 0.9) color = PALETTE.starYellow;
    else if (colorRand > 0.8) color = PALETTE.starCyan;

    stars.push({
      id: i,
      x: Math.floor(Math.random() * gridWidth) * PIXEL_SIZE,
      y: Math.floor(Math.random() * gridHeight * 2) * PIXEL_SIZE,
      color,
      twinkle: Math.random() > 0.6,
      layer: 1,
    });
  }

  // Close stars - bright, colorful, few
  for (let i = 100; i < 120; i++) {
    const colorRand = Math.random();
    let color = PALETTE.starWhite;
    if (colorRand > 0.85) color = PALETTE.starYellow;
    else if (colorRand > 0.7) color = PALETTE.starCyan;
    else if (colorRand > 0.6) color = PALETTE.starPink;

    stars.push({
      id: i,
      x: Math.floor(Math.random() * gridWidth) * PIXEL_SIZE,
      y: Math.floor(Math.random() * gridHeight * 2) * PIXEL_SIZE,
      color,
      twinkle: Math.random() > 0.5,
      layer: 2,
    });
  }

  return stars;
};

export const StarfieldBackground: React.FC = () => {
  const stars = useMemo(() => generateStars(), []);
  const [twinkleState, setTwinkleState] = useState(0);

  const scrollAnim = useRef(new Animated.Value(0)).current;

  // Parallax scrolling
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [scrollAnim]);

  // Twinkle effect (toggle every 500ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setTwinkleState(s => (s + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Layer translations
  const farTranslate = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.3],
  });

  const midTranslate = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.6],
  });

  const closeTranslate = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 1.0],
  });

  const getTranslate = (layer: number) => {
    if (layer === 0) return farTranslate;
    if (layer === 1) return midTranslate;
    return closeTranslate;
  };

  const getStarSize = (layer: number) => {
    if (layer === 0) return PIXEL_SIZE;
    if (layer === 1) return PIXEL_SIZE * 1.5;
    return PIXEL_SIZE * 2;
  };

  return (
    <View style={styles.container}>
      {/* Render stars by layer */}
      {[0, 1, 2].map(layer => (
        <Animated.View
          key={layer}
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ translateY: getTranslate(layer) }] },
          ]}
        >
          {stars
            .filter(s => s.layer === layer)
            .map(star => {
              const size = getStarSize(star.layer);
              const visible = !star.twinkle || (twinkleState % 2 === 0);

              return (
                <React.Fragment key={star.id}>
                  {/* Main star position */}
                  <View
                    style={[
                      styles.star,
                      {
                        left: star.x,
                        top: star.y % height,
                        width: size,
                        height: size,
                        backgroundColor: visible ? star.color : 'transparent',
                      },
                    ]}
                  />
                  {/* Duplicate for seamless scroll */}
                  <View
                    style={[
                      styles.star,
                      {
                        left: star.x,
                        top: (star.y % height) - height,
                        width: size,
                        height: size,
                        backgroundColor: visible ? star.color : 'transparent',
                      },
                    ]}
                  />
                </React.Fragment>
              );
            })}
        </Animated.View>
      ))}

      {/* Earth at bottom */}
      <PixelEarth />
    </View>
  );
};

// Pixel art Earth component
const PixelEarth: React.FC = () => {
  const earthWidth = Math.ceil(width / PIXEL_SIZE) + 10;
  const earthHeight = 20; // pixels tall

  // Generate Earth pixel data - curved horizon with continents
  const earthPixels = useMemo(() => {
    const pixels: { x: number; y: number; color: string }[] = [];

    for (let x = 0; x < earthWidth; x++) {
      // Curved horizon - parabola
      const centerX = earthWidth / 2;
      const distFromCenter = Math.abs(x - centerX) / centerX;
      const curveHeight = Math.floor(earthHeight * (1 - distFromCenter * distFromCenter * 0.3));

      for (let y = 0; y < curveHeight; y++) {
        // Determine if land or ocean based on x position
        const isLand = (
          (x > earthWidth * 0.1 && x < earthWidth * 0.25) ||
          (x > earthWidth * 0.4 && x < earthWidth * 0.6) ||
          (x > earthWidth * 0.75 && x < earthWidth * 0.85)
        );

        // Add some variation
        const noise = Math.sin(x * 0.5) * 2;

        let color: string;
        if (y === curveHeight - 1) {
          // Atmosphere edge
          color = PALETTE.earthCyan;
        } else if (y > curveHeight - 3 && Math.random() > 0.7) {
          // Clouds near top
          color = PALETTE.earthWhite;
        } else if (isLand && y < curveHeight - 2) {
          color = y > curveHeight / 2 + noise ? PALETTE.earthGreen : PALETTE.earthGreenDark;
        } else {
          color = y > curveHeight / 2 + noise ? PALETTE.earthBlue : PALETTE.earthBlueDark;
        }

        pixels.push({ x, y: earthHeight - curveHeight + y, color });
      }
    }

    return pixels;
  }, [earthWidth]);

  return (
    <View style={styles.earthContainer}>
      {earthPixels.map((pixel, i) => (
        <View
          key={i}
          style={[
            styles.earthPixel,
            {
              left: pixel.x * PIXEL_SIZE,
              top: pixel.y * PIXEL_SIZE,
              width: PIXEL_SIZE,
              height: PIXEL_SIZE,
              backgroundColor: pixel.color,
            },
          ]}
        />
      ))}
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
  earthContainer: {
    position: 'absolute',
    bottom: 0,
    left: -20,
    right: -20,
    height: 20 * PIXEL_SIZE,
  },
  earthPixel: {
    position: 'absolute',
  },
});
