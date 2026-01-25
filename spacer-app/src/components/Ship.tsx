import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { ShipState } from '../types';

interface ShipProps {
  state: ShipState;
  scale?: number;
}

// 16-bit color palette - limited like classic games
const PALETTE = {
  transparent: 'transparent',
  black: '#000000',
  darkGray: '#333333',
  gray: '#666666',
  lightGray: '#999999',
  white: '#ffffff',

  // Reds
  darkRed: '#8b0000',
  red: '#cc0000',
  brightRed: '#ff3333',

  // Blues/Cyans
  darkCyan: '#006666',
  cyan: '#00aaaa',
  brightCyan: '#00ffff',
  darkBlue: '#000066',
  blue: '#0066cc',

  // Greens
  darkGreen: '#006600',
  green: '#00aa00',
  brightGreen: '#00ff00',

  // Yellows/Oranges
  darkOrange: '#aa5500',
  orange: '#ff8800',
  yellow: '#ffff00',
  brightYellow: '#ffff88',
};

// 16x24 pixel ship sprite - classic 16-bit style
const SHIP_SPRITE: string[][] = [
  // Row 0-1: Antenna
  ['T','T','T','T','T','T','T','Y','Y','T','T','T','T','T','T','T'],
  ['T','T','T','T','T','T','T','Y','Y','T','T','T','T','T','T','T'],
  // Row 2-4: Red nose cone
  ['T','T','T','T','T','T','R','r','r','R','T','T','T','T','T','T'],
  ['T','T','T','T','T','R','r','W','W','r','R','T','T','T','T','T'],
  ['T','T','T','T','R','r','r','r','r','r','r','R','T','T','T','T'],
  // Row 5: Green ring
  ['T','T','T','T','G','g','g','g','g','g','g','G','T','T','T','T'],
  // Row 6-13: Cyan body with window
  ['T','T','T','C','c','c','c','c','c','c','c','c','C','T','T','T'],
  ['T','T','T','C','c','c','c','c','c','c','c','c','C','T','T','T'],
  ['T','T','T','C','c','c','D','B','B','D','c','c','C','T','T','T'],
  ['T','T','T','C','c','c','B','b','b','B','c','c','C','T','T','T'],
  ['T','T','T','C','c','c','B','b','b','B','c','c','C','T','T','T'],
  ['T','T','T','C','c','c','D','B','B','D','c','c','C','T','T','T'],
  ['T','T','T','C','c','c','c','c','c','c','c','c','C','T','T','T'],
  ['T','T','T','C','c','c','c','G','G','c','c','c','C','T','T','T'],
  // Row 14-17: Body narrowing + fins start
  ['T','T','R','C','c','c','c','c','c','c','c','c','C','R','T','T'],
  ['T','R','r','C','c','c','c','c','c','c','c','c','C','r','R','T'],
  ['R','r','r','T','C','c','c','c','c','c','c','C','T','r','r','R'],
  ['r','r','T','T','C','c','c','c','c','c','c','C','T','T','r','r'],
  // Row 18-20: Engine section
  ['T','T','T','T','T','D','D','D','D','D','D','T','T','T','T','T'],
  ['T','T','T','T','T','D','A','A','A','A','D','T','T','T','T','T'],
  ['T','T','T','T','T','T','O','O','O','O','T','T','T','T','T','T'],
  // Row 21-23: Flame (will be animated)
  ['T','T','T','T','T','T','O','Y','Y','O','T','T','T','T','T','T'],
  ['T','T','T','T','T','T','T','Y','Y','T','T','T','T','T','T','T'],
  ['T','T','T','T','T','T','T','y','y','T','T','T','T','T','T','T'],
];

// Flame animation frames
const FLAME_FRAMES: string[][][] = [
  // Frame 1 - short flame
  [
    ['T','T','T','T','T','T','O','Y','Y','O','T','T','T','T','T','T'],
    ['T','T','T','T','T','T','T','Y','Y','T','T','T','T','T','T','T'],
    ['T','T','T','T','T','T','T','y','y','T','T','T','T','T','T','T'],
  ],
  // Frame 2 - medium flame
  [
    ['T','T','T','T','T','O','Y','W','W','Y','O','T','T','T','T','T'],
    ['T','T','T','T','T','T','O','Y','Y','O','T','T','T','T','T','T'],
    ['T','T','T','T','T','T','T','O','O','T','T','T','T','T','T','T'],
  ],
  // Frame 3 - tall flame
  [
    ['T','T','T','T','T','O','Y','W','W','Y','O','T','T','T','T','T'],
    ['T','T','T','T','T','T','Y','Y','Y','Y','T','T','T','T','T','T'],
    ['T','T','T','T','T','T','O','Y','Y','O','T','T','T','T','T','T'],
  ],
  // Frame 4 - flickering
  [
    ['T','T','T','T','T','Y','W','W','W','W','Y','T','T','T','T','T'],
    ['T','T','T','T','T','O','Y','Y','Y','Y','O','T','T','T','T','T'],
    ['T','T','T','T','T','T','T','O','O','T','T','T','T','T','T','T'],
  ],
];

// Damaged overlay sprites
const DAMAGE_PIXELS: {x: number, y: number, color: string}[] = [
  {x: 5, y: 7, color: 'darkGray'},
  {x: 10, y: 8, color: 'darkGray'},
  {x: 6, y: 12, color: 'gray'},
];

const CRITICAL_PIXELS: {x: number, y: number, color: string}[] = [
  ...DAMAGE_PIXELS,
  {x: 4, y: 6, color: 'orange'},
  {x: 11, y: 7, color: 'orange'},
  {x: 5, y: 10, color: 'yellow'},
  {x: 10, y: 11, color: 'orange'},
  {x: 3, y: 5, color: 'darkGray'},
  {x: 12, y: 6, color: 'darkGray'},
];

// Color map for sprite characters
const COLOR_MAP: Record<string, string> = {
  'T': PALETTE.transparent,
  'W': PALETTE.white,
  'Y': PALETTE.yellow,
  'y': PALETTE.brightYellow,
  'O': PALETTE.orange,
  'o': PALETTE.darkOrange,
  'R': PALETTE.darkRed,
  'r': PALETTE.red,
  'x': PALETTE.brightRed,
  'G': PALETTE.darkGreen,
  'g': PALETTE.green,
  'C': PALETTE.darkCyan,
  'c': PALETTE.cyan,
  'B': PALETTE.darkBlue,
  'b': PALETTE.blue,
  'D': PALETTE.darkGray,
  'A': PALETTE.gray,
  'L': PALETTE.lightGray,
};

// Explosion sprite frames
const EXPLOSION_FRAMES: string[][][] = [
  // Frame 1
  [
    ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
    ['T','T','T','T','T','T','T','W','W','T','T','T','T','T','T','T'],
    ['T','T','T','T','T','T','W','Y','Y','W','T','T','T','T','T','T'],
    ['T','T','T','T','T','W','Y','Y','Y','Y','W','T','T','T','T','T'],
    ['T','T','T','T','T','W','Y','Y','Y','Y','W','T','T','T','T','T'],
    ['T','T','T','T','T','T','W','Y','Y','W','T','T','T','T','T','T'],
    ['T','T','T','T','T','T','T','W','W','T','T','T','T','T','T','T'],
    ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
  ],
  // Frame 2
  [
    ['T','T','T','T','T','T','W','T','T','W','T','T','T','T','T','T'],
    ['T','T','T','T','T','W','Y','W','W','Y','W','T','T','T','T','T'],
    ['T','T','T','T','W','Y','O','Y','Y','O','Y','W','T','T','T','T'],
    ['T','T','T','W','Y','O','O','O','O','O','O','Y','W','T','T','T'],
    ['T','T','T','W','Y','O','O','O','O','O','O','Y','W','T','T','T'],
    ['T','T','T','T','W','Y','O','Y','Y','O','Y','W','T','T','T','T'],
    ['T','T','T','T','T','W','Y','W','W','Y','W','T','T','T','T','T'],
    ['T','T','T','T','T','T','W','T','T','W','T','T','T','T','T','T'],
  ],
  // Frame 3
  [
    ['T','T','T','W','T','T','T','W','W','T','T','T','W','T','T','T'],
    ['T','T','W','Y','W','T','W','O','O','W','T','W','Y','W','T','T'],
    ['T','W','Y','O','Y','W','O','r','r','O','W','Y','O','Y','W','T'],
    ['W','Y','O','r','O','O','r','R','R','r','O','O','r','O','Y','W'],
    ['W','Y','O','r','O','O','r','R','R','r','O','O','r','O','Y','W'],
    ['T','W','Y','O','Y','W','O','r','r','O','W','Y','O','Y','W','T'],
    ['T','T','W','Y','W','T','W','O','O','W','T','W','Y','W','T','T'],
    ['T','T','T','W','T','T','T','W','W','T','T','T','W','T','T','T'],
  ],
  // Frame 4 - debris
  [
    ['T','T','c','T','T','T','T','D','D','T','T','T','T','r','T','T'],
    ['T','T','T','T','W','T','T','T','T','T','T','W','T','T','T','T'],
    ['T','r','T','W','O','W','T','T','T','T','W','O','W','T','c','T'],
    ['T','T','T','T','W','T','T','D','D','T','T','W','T','T','T','T'],
    ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
    ['T','c','T','T','W','T','T','T','T','T','T','W','T','T','r','T'],
    ['T','T','T','T','T','T','D','T','T','D','T','T','T','T','T','T'],
    ['T','T','T','T','T','T','T','T','T','T','T','T','T','T','T','T'],
  ],
];

export const Ship: React.FC<ShipProps> = ({ state, scale = 6 }) => {
  const [flameFrame, setFlameFrame] = useState(0);
  const [explosionFrame, setExplosionFrame] = useState(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;

  // Flame animation
  useEffect(() => {
    if (state === 'destroyed') return;

    const interval = setInterval(() => {
      setFlameFrame(f => (f + 1) % FLAME_FRAMES.length);
    }, 100);
    return () => clearInterval(interval);
  }, [state]);

  // Explosion animation
  useEffect(() => {
    if (state !== 'destroyed') return;

    const interval = setInterval(() => {
      setExplosionFrame(f => Math.min(f + 1, EXPLOSION_FRAMES.length - 1));
    }, 150);
    return () => clearInterval(interval);
  }, [state]);

  // Bob animation
  useEffect(() => {
    if (state === 'destroyed') return;

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: -2 * scale,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [state, scale, bobAnim]);

  // Shake for damaged states
  useEffect(() => {
    if (state !== 'damaged' && state !== 'critical') {
      shakeAnim.setValue(0);
      return;
    }

    const intensity = state === 'critical' ? 3 : 1;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: intensity * scale,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -intensity * scale,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [state, scale, shakeAnim]);

  // Render explosion
  if (state === 'destroyed') {
    const frame = EXPLOSION_FRAMES[explosionFrame];
    return (
      <View style={[styles.container, { width: 16 * scale, height: frame.length * scale }]}>
        {frame.map((row, y) => (
          <View key={y} style={styles.row}>
            {row.map((pixel, x) => (
              <View
                key={`${x}-${y}`}
                style={[
                  styles.pixel,
                  {
                    width: scale,
                    height: scale,
                    backgroundColor: COLOR_MAP[pixel] || PALETTE.transparent,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    );
  }

  // Build ship sprite with current flame frame
  const currentFlame = FLAME_FRAMES[flameFrame];
  const shipWithFlame = [
    ...SHIP_SPRITE.slice(0, 21),
    ...currentFlame,
  ];

  // Get damage overlay
  const damageOverlay = state === 'critical' ? CRITICAL_PIXELS :
                        state === 'damaged' ? DAMAGE_PIXELS :
                        state === 'warning' ? DAMAGE_PIXELS.slice(0, 1) : [];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: 16 * scale,
          height: shipWithFlame.length * scale,
          transform: [
            { translateX: shakeAnim },
            { translateY: bobAnim },
          ],
        },
      ]}
    >
      {shipWithFlame.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((pixel, x) => {
            // Check for damage overlay
            const damage = damageOverlay.find(d => d.x === x && d.y === y);
            const color = damage
              ? PALETTE[damage.color as keyof typeof PALETTE]
              : COLOR_MAP[pixel] || PALETTE.transparent;

            return (
              <View
                key={`${x}-${y}`}
                style={[
                  styles.pixel,
                  {
                    width: scale,
                    height: scale,
                    backgroundColor: color,
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  pixel: {},
});
