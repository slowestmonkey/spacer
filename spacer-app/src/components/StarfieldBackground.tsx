import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

// 32-bit rich color palette
const PALETTE = {
  // Space background
  space: '#050510',

  // Star colors - variety
  starWhite: '#ffffff',
  starBright: '#f0f0ff',
  starDim: '#8888aa',
  starFaint: '#555577',
  starYellow: '#ffff66',
  starGold: '#ffdd44',
  starOrange: '#ffaa44',
  starCyan: '#66ffff',
  starTeal: '#44dddd',
  starPink: '#ff66ff',
  starMagenta: '#dd44dd',
  starBlue: '#6688ff',
  starRed: '#ff6666',

  // Subtle nebula (just 2)
  nebulaBlue: '#0a1133',
  nebulaPurple: '#150a22',
};

// Pixel size for crisp look
const PIXEL_SIZE = 3;

interface Star {
  id: number;
  x: number;
  y: number;
  color: string;
  twinkle: boolean;
  twinkleSpeed: number;
  layer: number; // 0=far, 1=mid, 2=close
  size: number;
}

interface Nebula {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

// Star color pools for variety
const FAR_COLORS = [PALETTE.starFaint, PALETTE.starDim, PALETTE.starDim];
const MID_COLORS = [PALETTE.starBright, PALETTE.starWhite, PALETTE.starYellow, PALETTE.starCyan, PALETTE.starBlue];
const CLOSE_COLORS = [PALETTE.starWhite, PALETTE.starYellow, PALETTE.starGold, PALETTE.starCyan, PALETTE.starTeal, PALETTE.starPink, PALETTE.starMagenta, PALETTE.starOrange, PALETTE.starRed];

// Generate stars with pixel-aligned positions - distributed across full scroll height
const generateStars = (): Star[] => {
  const stars: Star[] = [];
  const gridWidth = Math.ceil(width / PIXEL_SIZE);
  const scrollHeight = height; // Stars distributed across one screen height for seamless loop

  // Far stars - many, small, dim
  for (let i = 0; i < 60; i++) {
    stars.push({
      id: i,
      x: Math.floor(Math.random() * gridWidth) * PIXEL_SIZE,
      y: Math.floor(Math.random() * (scrollHeight / PIXEL_SIZE)) * PIXEL_SIZE,
      color: FAR_COLORS[Math.floor(Math.random() * FAR_COLORS.length)],
      twinkle: Math.random() > 0.7,
      twinkleSpeed: Math.floor(Math.random() * 3),
      layer: 0,
      size: PIXEL_SIZE,
    });
  }

  // Mid stars - medium, colorful
  for (let i = 60; i < 110; i++) {
    stars.push({
      id: i,
      x: Math.floor(Math.random() * gridWidth) * PIXEL_SIZE,
      y: Math.floor(Math.random() * (scrollHeight / PIXEL_SIZE)) * PIXEL_SIZE,
      color: MID_COLORS[Math.floor(Math.random() * MID_COLORS.length)],
      twinkle: Math.random() > 0.5,
      twinkleSpeed: Math.floor(Math.random() * 3),
      layer: 1,
      size: PIXEL_SIZE + (Math.random() > 0.7 ? PIXEL_SIZE : 0),
    });
  }

  // Close stars - few, bright, large, colorful
  for (let i = 110; i < 135; i++) {
    stars.push({
      id: i,
      x: Math.floor(Math.random() * gridWidth) * PIXEL_SIZE,
      y: Math.floor(Math.random() * (scrollHeight / PIXEL_SIZE)) * PIXEL_SIZE,
      color: CLOSE_COLORS[Math.floor(Math.random() * CLOSE_COLORS.length)],
      twinkle: Math.random() > 0.4,
      twinkleSpeed: Math.floor(Math.random() * 3),
      layer: 2,
      size: PIXEL_SIZE * 2,
    });
  }

  return stars;
};

// No nebulas - clean space
const generateNebulas = (): Nebula[] => {
  return [];
};

export const StarfieldBackground: React.FC = () => {
  const stars = useMemo(() => generateStars(), []);
  const nebulas = useMemo(() => generateNebulas(), []);
  const [twinkleState, setTwinkleState] = useState(0);

  // Separate animation refs for each layer - smooth seamless looping
  const farAnim = useRef(new Animated.Value(0)).current;
  const midAnim = useRef(new Animated.Value(0)).current;
  const closeAnim = useRef(new Animated.Value(0)).current;

  // Far layer - slowest (6 seconds per loop)
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(farAnim, {
        toValue: height,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [farAnim]);

  // Mid layer - medium speed (4 seconds per loop)
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(midAnim, {
        toValue: height,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [midAnim]);

  // Close layer - fastest (2.5 seconds per loop)
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(closeAnim, {
        toValue: height,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [closeAnim]);

  // Twinkle effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTwinkleState(s => (s + 1) % 6);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const getTranslate = (layer: number) => {
    if (layer === 0) return farAnim;
    if (layer === 1) return midAnim;
    return closeAnim;
  };

  return (
    <View style={styles.container}>
      {/* Static nebulas - just subtle background color variation */}
      {nebulas.map(nebula => (
        <View
          key={nebula.id}
          style={[
            styles.nebula,
            {
              left: nebula.x,
              top: nebula.y,
              width: nebula.width,
              height: nebula.height,
              backgroundColor: nebula.color,
              opacity: nebula.opacity,
            },
          ]}
        />
      ))}

      {/* Render stars by layer - each with its own smooth animation */}
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
              // Varied twinkle based on star's twinkle speed
              const visible = !star.twinkle || ((twinkleState + star.twinkleSpeed) % 3 !== 0);

              return (
                <React.Fragment key={star.id}>
                  {/* Main star position */}
                  <View
                    style={[
                      styles.star,
                      {
                        left: star.x,
                        top: star.y,
                        width: star.size,
                        height: star.size,
                        backgroundColor: visible ? star.color : 'transparent',
                      },
                    ]}
                  />
                  {/* Duplicate above for seamless scroll (appears when scrolling down) */}
                  <View
                    style={[
                      styles.star,
                      {
                        left: star.x,
                        top: star.y - height,
                        width: star.size,
                        height: star.size,
                        backgroundColor: visible ? star.color : 'transparent',
                      },
                    ]}
                  />
                </React.Fragment>
              );
            })}
        </Animated.View>
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
  nebula: {
    position: 'absolute',
    borderRadius: 999,
  },
});
