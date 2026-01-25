import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { ShipState } from '../types';

interface ShipProps {
  state: ShipState;
  scale?: number;
}

// Color palette
const COLORS = {
  _: 'transparent',
  W: '#ffffff',
  w: '#dddddd',
  // Reds
  r: '#ff4444',
  R: '#cc2222',
  D: '#881111',
  // Cyans
  c: '#44dddd',
  C: '#22aaaa',
  S: '#116666',
  // Greens
  g: '#44dd44',
  G: '#22aa22',
  // Blues
  b: '#4488ff',
  B: '#2255cc',
  // Yellows/Orange
  Y: '#ffff44',
  y: '#ffcc22',
  O: '#ff8822',
  o: '#cc5500',
  // Grays/Metal
  M: '#aaaaaa',
  m: '#666666',
  d: '#333333',
};

// Ship sprite - 16 pixels wide, perfectly symmetric
// Each row is exactly 16 characters
const SHIP_ROWS = [
  '______WW______', // 0 - beacon
  '______yy______', // 1 - antenna
  '______yy______', // 2
  '_____rWWr_____', // 3 - nose tip
  '____RrWWrR____', // 4
  '___DRrrrrRD___', // 5
  '__DRrrrrrrRD__', // 6
  '_DRrrrrrrrrRD_', // 7 - nose base
  '_YyyyyyyyyyyY_', // 8 - yellow stripe
  '_yYYYYYYYYYYy_', // 9
  '_ScccccccccccS_', // 10 - body start
  '_CccccccccccC_', // 11
  '_Ccc_BBBB_ccC_', // 12 - window frame
  '_CccBbbbbBccC_', // 13
  '_CccBbWWbBccC_', // 14 - window
  '_CccBbWWbBccC_', // 15
  '_CccBbbbbBccC_', // 16
  '_Ccc_BBBB_ccC_', // 17
  '_CccccccccccC_', // 18
  '_GggggggggggG_', // 19 - green stripe
  '_gGGGGGGGGGGg_', // 20
  '_CccccccccccC_', // 21 - lower body
  '_CccccccccccC_', // 22
  'D_CccccccccC_D', // 23 - fins start
  'DD_CccccccC_DD', // 24
  'DDD_CccccC_DDD', // 25
  'DDD__CCCC__DDD', // 26 - fin tips
  '____dMMMMd____', // 27 - engine
  '____MmmmmM____', // 28
  '_____oOOo_____', // 29 - exhaust
];

// Flame frames - 4 animation frames
const FLAME_ROWS = [
  // Frame 0 - small
  ['_____oYYo_____', '______yy______', '______Oo______', '______________'],
  // Frame 1 - medium
  ['____oYYYYo____', '_____YWWY_____', '______YY______', '______oo______'],
  // Frame 2 - large
  ['___oYYWWYYo___', '____YYWWYY____', '_____oYYo_____', '______yy______'],
  // Frame 3 - max
  ['__oYYWWWWYYo__', '___oYYWWYYo___', '____oYYYYo____', '_____oYYo_____'],
];

// Damaged overlay - red tint positions
const DAMAGE_POSITIONS = [
  [3, 5], [3, 9], [6, 2], [6, 12], [10, 4], [10, 10],
  [15, 3], [15, 11], [20, 5], [20, 9], [24, 7],
];

// Critical damage - more red, smoke particles
const CRITICAL_POSITIONS = [
  ...DAMAGE_POSITIONS,
  [5, 4], [5, 10], [8, 6], [8, 8], [12, 3], [12, 11],
  [18, 5], [18, 9], [22, 4], [22, 10], [25, 6], [25, 8],
];

// Explosion frames
const EXPLOSION_FRAMES = [
  // Frame 0 - flash
  ['______WW______', '_____WYYYW____', '____WYYYYW____', '___WYYYYYYYW__', '___WYYYYYYYW__', '____WYYYYW____', '_____WYYYW____', '______WW______'],
  // Frame 1 - expand
  ['_____W__W_____', '___OYYYYYO____', '__OYYYYYYYO___', '_OYYYYYYYYYO__', '_OYYYYYYYYYO__', '__OYYYYYYYO___', '___OYYYYYO____', '_____W__W_____'],
  // Frame 2 - debris
  ['__r_____O_____', '____W_____r___', '_O____W_____O_', '___r_____W____', '____O_r_____r_', '__W_____O_____', '______r___W___', '____O_____r___'],
  // Frame 3 - fade
  ['__o___________', '________o_____', '____o_________', '__________o___', '______o_______', '____o_________', '__________o___', '______o_______'],
];

export const Ship: React.FC<ShipProps> = ({ state, scale = 4 }) => {
  const [flameFrame, setFlameFrame] = useState(0);
  const [explosionFrame, setExplosionFrame] = useState(0);
  const [damageFlicker, setDamageFlicker] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;

  // Flame animation
  useEffect(() => {
    if (state === 'destroyed') return;
    const interval = setInterval(() => {
      setFlameFrame(f => (f + 1) % FLAME_ROWS.length);
    }, 100);
    return () => clearInterval(interval);
  }, [state]);

  // Damage flicker for damaged/critical states
  useEffect(() => {
    if (state !== 'damaged' && state !== 'critical') {
      setDamageFlicker(false);
      return;
    }
    const speed = state === 'critical' ? 100 : 200;
    const interval = setInterval(() => {
      setDamageFlicker(f => !f);
    }, speed);
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
    }, 150);
    return () => clearInterval(interval);
  }, [state]);

  // Bob animation (healthy only - smooth, no bob for damaged)
  useEffect(() => {
    if (state !== 'healthy') {
      bobAnim.setValue(0);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: -8,
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
  }, [state, bobAnim]);

  // Shake animation (damaged/critical)
  useEffect(() => {
    if (state !== 'damaged' && state !== 'critical') {
      shakeAnim.setValue(0);
      return;
    }
    const intensity = state === 'critical' ? 6 : 3;
    const speed = state === 'critical' ? 30 : 50;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: intensity, duration: speed, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -intensity, duration: speed, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [state, shakeAnim]);

  const spriteWidth = 14;

  // Render explosion
  if (state === 'destroyed') {
    const frame = EXPLOSION_FRAMES[explosionFrame];
    return (
      <View style={[styles.container, { width: spriteWidth * scale }]}>
        {frame.map((row, y) => (
          <View key={y} style={styles.row}>
            {row.split('').map((char, x) => (
              <View
                key={x}
                style={{
                  width: scale,
                  height: scale,
                  backgroundColor: COLORS[char as keyof typeof COLORS] || 'transparent',
                }}
              />
            ))}
          </View>
        ))}
      </View>
    );
  }

  // Build full sprite with flames
  const currentFlame = FLAME_ROWS[flameFrame];
  const fullRows = [...SHIP_ROWS, ...currentFlame];

  // Get damage overlay positions
  const damageOverlay = state === 'critical' ? CRITICAL_POSITIONS :
                        state === 'damaged' ? DAMAGE_POSITIONS : [];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: spriteWidth * scale,
          transform: [
            { translateX: shakeAnim },
            { translateY: bobAnim },
          ],
        },
      ]}
    >
      {fullRows.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.split('').map((char, x) => {
            let color = COLORS[char as keyof typeof COLORS] || 'transparent';

            // Apply damage overlay
            if (damageFlicker && damageOverlay.some(([dy, dx]) => dy === y && dx === x)) {
              color = state === 'critical' ? '#ff0000' : '#ff6666';
            }

            // Tint entire ship red for critical
            if (state === 'critical' && color !== 'transparent' && !damageFlicker) {
              // Shift colors toward red
              if (color.startsWith('#44dd') || color.startsWith('#22aa')) {
                color = '#884444'; // cyan -> dark red
              } else if (color.startsWith('#44dd44') || color.startsWith('#22aa22')) {
                color = '#886644'; // green -> brown
              }
            }

            return (
              <View
                key={x}
                style={{
                  width: scale,
                  height: scale,
                  backgroundColor: color,
                }}
              />
            );
          })}
        </View>
      ))}

      {/* State indicator glow */}
      {state === 'healthy' && (
        <View style={[styles.healthyGlow, {
          width: spriteWidth * scale,
          height: fullRows.length * scale,
          borderColor: '#44ff44',
          shadowColor: '#44ff44',
        }]} />
      )}
      {state === 'damaged' && (
        <View style={[styles.damagedGlow, {
          width: spriteWidth * scale,
          height: fullRows.length * scale,
          borderColor: '#ffaa00',
          shadowColor: '#ffaa00',
        }]} />
      )}
      {state === 'critical' && damageFlicker && (
        <View style={[styles.criticalGlow, {
          width: spriteWidth * scale,
          height: fullRows.length * scale,
          borderColor: '#ff0000',
          shadowColor: '#ff0000',
        }]} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
  },
  healthyGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 1,
    borderRadius: 4,
    opacity: 0.3,
  },
  damagedGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2,
    borderRadius: 4,
    opacity: 0.5,
  },
  criticalGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 3,
    borderRadius: 4,
    opacity: 0.8,
  },
});
