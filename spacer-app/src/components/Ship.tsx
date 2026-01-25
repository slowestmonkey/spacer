import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { ShipState } from '../types';

interface ShipProps {
  state: ShipState;
  scale?: number;
}

// 32-bit color palette - richer gradients and more detail
const PALETTE = {
  transparent: 'transparent',

  // Whites/Grays
  white: '#ffffff',
  offWhite: '#f0f0f0',
  lightGray: '#c0c0c0',
  gray: '#808080',
  darkGray: '#404040',
  charcoal: '#202020',
  black: '#000000',

  // Reds (nose cone, fins)
  redHighlight: '#ff6666',
  redBright: '#ff3333',
  red: '#dd2222',
  redMid: '#bb1111',
  redDark: '#881111',
  redDeep: '#550000',

  // Cyans/Teals (body)
  cyanHighlight: '#88ffff',
  cyanBright: '#44dddd',
  cyan: '#22bbbb',
  cyanMid: '#119999',
  cyanDark: '#007777',
  cyanDeep: '#004455',

  // Greens (accent ring)
  greenHighlight: '#88ff88',
  greenBright: '#44dd44',
  green: '#22bb22',
  greenDark: '#118811',
  greenDeep: '#005500',

  // Blues (window)
  blueHighlight: '#88aaff',
  blueBright: '#4488ff',
  blue: '#2266dd',
  blueMid: '#1144aa',
  blueDark: '#002277',
  blueDeep: '#001144',

  // Yellows/Oranges (flame, lights)
  yellow: '#ffff44',
  yellowBright: '#ffff88',
  gold: '#ffdd22',
  orange: '#ff9922',
  orangeBright: '#ffbb44',
  orangeDark: '#dd6600',
  orangeDeep: '#aa4400',

  // Purples (accents)
  purple: '#aa44ff',
  purpleDark: '#6622aa',

  // Metals
  metalLight: '#d0d8e0',
  metal: '#a0a8b0',
  metalDark: '#606870',
  metalDeep: '#303840',
};

// 24x32 rocket sprite - exciting design, PERFECTLY SYMMETRIC (mirror each row)
const SHIP_SPRITE: string[][] = [
  // Row 0-2: Blinking beacon antenna
  'TTTTTTTTTTTWWTTTTTTTTTTTT'.split(''),
  'TTTTTTTTTTTyyTTTTTTTTTTTT'.split(''),
  'TTTTTTTTTTTyyTTTTTTTTTTTT'.split(''),
  // Row 3-8: Sleek red nose cone with highlight
  'TTTTTTTTTTrWWrTTTTTTTTTTT'.split(''),
  'TTTTTTTTTRrWWrRTTTTTTTTTT'.split(''),
  'TTTTTTTT4RrWWrR4TTTTTTTTTT'.split(''),
  'TTTTTTT4RRrrrrrRR4TTTTTTTTT'.split(''),
  'TTTTTT4RRrrrrrrRR4TTTTTTTTTT'.split(''),
  'TTTTT4RRrrrrrrrrRR4TTTTTTT'.split(''),
  // Row 9-10: Yellow racing stripe band
  'TTTTYyYYYYYYYYYYYYyYTTTTT'.split(''),
  'TTTTyYyyyyyyyyyyyyyyYyTTTTT'.split(''),
  // Row 11-18: Cyan body with round porthole
  'TTTTCccccccccccccccCTTTTT'.split(''),
  'TTT5CccccccccccccccC5TTTT'.split(''),
  'TTT5Ccc5dBBBBBBd5ccC5TTTT'.split(''),
  'TTTCcc5dBbbbbbbbBd5ccCTTTT'.split(''),
  'TTTCcc5BbbWWWWbbB5ccCTTTT'.split(''),
  'TTTCcc5BbbWWWWbbB5ccCTTTT'.split(''),
  'TTTCcc5dBbbbbbbbBd5ccCTTTT'.split(''),
  'TTT5Ccc5dBBBBBBd5ccC5TTTT'.split(''),
  // Row 19-20: Green accent stripe
  'TTTTGggGGGGGGGGGGggGTTTTT'.split(''),
  'TTT3GggggggggggggggG3TTTT'.split(''),
  // Row 21-27: Lower body with dramatic fins
  'TTTTCccccccccccccccCTTTTT'.split(''),
  'TTT5CccccccccccccccC5TTTT'.split(''),
  'TR4TCccccccccccccccCT4RTT'.split(''),
  'R44TCcc5cccccccc5ccCT44RT'.split(''),
  '444TCccccccccccccccCT444T'.split(''),
  '44TTCccccccccccccccCTT44T'.split(''),
  '4TTT5CccccccccccccC5TTT4T'.split(''),
  // Row 28-31: Triple engine exhaust
  'TTTTTdMMMddddMMMdTTTTTTTT'.split(''),
  'TTTTTMmMmmmmmmmMmMTTTTTTTT'.split(''),
  'TTTTTToOOoTTToOOoTTTTTTTT'.split(''),
  'TTTTTTooTTTTTTooTTTTTTTTT'.split(''),
];

// Flame animation frames - dual exhaust, symmetric
const FLAME_FRAMES: string[][][] = [
  // Frame 1 - small flames
  [
    'TTTTTooYYTTTTYYooTTTTTTTT'.split(''),
    'TTTTTToYoTTTToYoTTTTTTTTT'.split(''),
    'TTTTTTTyTTTTTTyTTTTTTTTTT'.split(''),
    'TTTTTTTTTTTTTTTTTTTTTTTTTT'.split(''),
  ],
  // Frame 2 - medium flames
  [
    'TTTToOYYYTTTYYYOoTTTTTTTT'.split(''),
    'TTTTToYWYTTTYWYoTTTTTTTTT'.split(''),
    'TTTTTToYoTTTToYoTTTTTTTTT'.split(''),
    'TTTTTTTyTTTTTTyTTTTTTTTTT'.split(''),
  ],
  // Frame 3 - large flames
  [
    'TTTToYYWYTTTYWYYoTTTTTTTT'.split(''),
    'TTTTTYYWYTTTYWYYTTTTTTTTT'.split(''),
    'TTTTTToYYTTTTYYoTTTTTTTTT'.split(''),
    'TTTTTTToTTTTTToTTTTTTTTTT'.split(''),
  ],
  // Frame 4 - max flames
  [
    'TTTTYYWWYTTTYWWYYTTTTTTTT'.split(''),
    'TTTTToYWYTTTYWYoTTTTTTTTT'.split(''),
    'TTTTTTTYYTTTTYYTTTTTTTTTT'.split(''),
    'TTTTTTToTTTTTToTTTTTTTTTT'.split(''),
  ],
];

// Color mapping
const COLOR_MAP: Record<string, string> = {
  'T': PALETTE.transparent,
  // Whites
  'W': PALETTE.white,
  'w': PALETTE.offWhite,
  // Grays
  'L': PALETTE.lightGray,
  'A': PALETTE.gray,
  'D': PALETTE.darkGray,
  'd': PALETTE.charcoal,
  // Reds
  'r': PALETTE.redBright,
  'R': PALETTE.redMid,
  '4': PALETTE.redDark,
  // Cyans
  'c': PALETTE.cyan,
  'C': PALETTE.cyanDark,
  '5': PALETTE.cyanDeep,
  // Greens
  'g': PALETTE.green,
  'G': PALETTE.greenDark,
  '3': PALETTE.greenDeep,
  // Blues
  'b': PALETTE.blueBright,
  'B': PALETTE.blue,
  // Yellows/Oranges
  'Y': PALETTE.yellow,
  'y': PALETTE.yellowBright,
  'O': PALETTE.orange,
  'o': PALETTE.orangeDark,
  't': PALETTE.orangeDeep,
  // Metals
  'M': PALETTE.metal,
  'm': PALETTE.metalDark,
};

// Explosion frames - symmetric
const EXPLOSION_FRAMES: string[][][] = [
  // Frame 1 - initial flash
  [
    'TTTTTTTTTTTTTTTTTTTTTTTT',
    'TTTTTTTTTTWWWWTTTTTTTTTT',
    'TTTTTTTTTWYYWYTTTTTTTTTT',
    'TTTTTTTTWYYYYYWTTTTTTTTT',
    'TTTTTTTTWYYYYYWTTTTTTTTT',
    'TTTTTTTTTWYYWYTTTTTTTTTT',
    'TTTTTTTTTTWWWWTTTTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTTTTTT',
  ].map(r => r.split('')),
  // Frame 2 - expanding
  [
    'TTTTTTTTTTWTTWTTTTTTTTTT',
    'TTTTTTTTWYYOOYYWTTTTTTTT',
    'TTTTTTTWYYOOOOYYWTTTTTTT',
    'TTTTTTWYOOOOOOOYWTTTTTTT',
    'TTTTTTWYOOOOOOOYWTTTTTTT',
    'TTTTTTTWYYOOOOYYWTTTTTTT',
    'TTTTTTTTWYYOOYYWTTTTTTTT',
    'TTTTTTTTTTWTTWTTTTTTTTTT',
  ].map(r => r.split('')),
  // Frame 3 - max size with colors
  [
    'TTTTTWTTTTTTTTTTTWTTTTT',
    'TTTTTTWYOTOTOYOWYYTTTTTT',
    'TTTTWYOrrrrrrrrrOYWTTTT',
    'TTTWYOrrr4444rrrOYWTTTT',
    'TTTWYOrrr4444rrrOYWTTTT',
    'TTTTWYOrrrrrrrrrOYWTTTT',
    'TTTTTTWYOTOTOYOWYYTTTTTT',
    'TTTTTWTTTTTTTTTTTWTTTTT',
  ].map(r => r.split('')),
  // Frame 4 - debris
  [
    'TTcTTTTTTTDDTTTTTTTcTTTT',
    'TTTTTWTTTTTTTTTTWTTTTTTr',
    'TTrTTTWOWTTTTWOWTTTrTTTT',
    'TTTTTTTWTTDDTTWTTTTTTTTc',
    'TcTTTTTTTTTTTTTTTTTTTTcT',
    'TTrTTTWTTTTTTTTWTTTrTTTT',
    'TTTTTTTTTDTTDTTTTTTTTTTr',
    'TTTTTTrTTTTTTTTrTTTTTTTT',
  ].map(r => r.split('')),
];

export const Ship: React.FC<ShipProps> = ({ state, scale = 4 }) => {
  const [flameFrame, setFlameFrame] = useState(0);
  const [explosionFrame, setExplosionFrame] = useState(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Flame animation - faster for more energy
  useEffect(() => {
    if (state === 'destroyed') return;
    const interval = setInterval(() => {
      setFlameFrame(f => (f + 1) % FLAME_FRAMES.length);
    }, 80);
    return () => clearInterval(interval);
  }, [state]);

  // Explosion animation
  useEffect(() => {
    if (state !== 'destroyed') {
      setExplosionFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setExplosionFrame(f => Math.min(f + 1, EXPLOSION_FRAMES.length - 1));
    }, 120);
    return () => clearInterval(interval);
  }, [state]);

  // Smooth bob animation
  useEffect(() => {
    if (state === 'destroyed') return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: -3 * scale,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [state, scale, bobAnim]);

  // Glow pulse for healthy state
  useEffect(() => {
    if (state !== 'healthy') return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [state, glowAnim]);

  // Shake for damaged states
  useEffect(() => {
    if (state !== 'damaged' && state !== 'critical') {
      shakeAnim.setValue(0);
      return;
    }
    const intensity = state === 'critical' ? 4 : 2;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: intensity * scale, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -intensity * scale, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [state, scale, shakeAnim]);

  const spriteWidth = 24;

  // Render explosion
  if (state === 'destroyed') {
    const frame = EXPLOSION_FRAMES[explosionFrame];
    return (
      <View style={[styles.container, { width: spriteWidth * scale, height: frame.length * scale }]}>
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

  // Build ship with flame
  const currentFlame = FLAME_FRAMES[flameFrame];
  const fullSprite = [...SHIP_SPRITE, ...currentFlame];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: spriteWidth * scale,
          height: fullSprite.length * scale,
          transform: [
            { translateX: shakeAnim },
            { translateY: bobAnim },
          ],
        },
      ]}
    >
      {fullSprite.map((row, y) => (
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
