import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { ShipState } from '../types';

interface ShipProps {
  state: ShipState;
  scale?: number;
}

// Muted palette inspired by the reference illustration
const COLORS: Record<string, string> = {
  _: 'transparent',
  // Whites and grays
  W: '#f3efe7', // warm highlight
  w: '#dfe6ea', // cool light
  L: '#b7c2cc', // light blue-gray
  M: '#7f8c99', // mid slate
  m: '#4f5a66', // dark slate
  D: '#2f3740', // deepest charcoal
  // Warm creams for the dome
  R: '#e4d6b5',
  r: '#d4c3a1',
  Q: '#8f7f67',
  P: '#6f6251',
  // Body teal/sage
  T: '#8fb0b3',
  t: '#9fbfc1',
  S: '#6e8a90',
  s: '#4c6368',
  // Mustard stripe
  Y: '#d5c087',
  y: '#c9b177',
  K: '#b79f63',
  // Sage accents
  G: '#9db08f',
  g: '#8ea082',
  H: '#7e8f74',
  // Window blues
  B: '#8aa7c6',
  b: '#6f8cab',
  N: '#5c728a',
  // Flame - softened orange
  O: '#d59a6e',
  o: '#c9895f',
  F: '#e1c07d',
  f: '#c97e55',
  X: '#b56c4b',
};

const DAMAGED_COLORS: Record<string, string> = {
  ...COLORS,
  T: '#b7a583', // teal becomes tan/amber
  t: '#c2b191',
  S: '#9c896a',
  G: '#b9b28c', // sage becomes dusty olive
  g: '#a79d7a',
};

const CRITICAL_COLORS: Record<string, string> = {
  ...COLORS,
  T: '#b88c8d', // teal becomes muted rose
  t: '#c59c9c',
  S: '#8a6b6e',
  G: '#b88c8d',
  g: '#a57b7c',
  B: '#7a86a8', // blue becomes muted violet
  b: '#6c778f',
};

// Ship sprite - 16 pixels wide, matching reference style
const SHIP_ROWS = [
  // Antenna
  '______QrrQ______', // row 0
  '______rRRr______', // row 1
  // Red dome top
  '______RRRR______', // row 2
  '_____rRRRRr_____', // row 3
  '____RRRRRRRR____', // row 4
  '___rRRRRRRRRr___', // row 5
  '___RRRRRRRRRR___', // row 6
  // Green accent stripe
  '__gGGGGGGGGGGg__', // row 7
  '__GGGGGGGGGGGG__', // row 8
  // Teal body upper
  '__TTTTTTTTTTTT__', // row 9
  '_tTTTTTTTTTTTTt_', // row 10
  '_TTTTTTTTTTTTTT_', // row 11
  // Round window (porthole)
  '_TTT__bbbb__TTT_', // row 12
  '_TTT_bBBBBb_TTT_', // row 13
  '_TTTbBWwwWBbTTT_', // row 14
  '_TTTbBwWWwBbTTT_', // row 15
  '_TTTbBWwwWBbTTT_', // row 16
  '_TTT_bBBBBb_TTT_', // row 17
  '_TTT__bbbb__TTT_', // row 18
  // Body middle
  '_TTTTTTTTTTTTTT_', // row 19
  // Yellow accent stripe
  '_YyyYYYYYYYYyyY_', // row 20
  '_yYYYYYYYYYYYYy_', // row 21
  // Teal body lower
  '_TTTTTTTTTTTTTT_', // row 22
  '_tTTTTTTTTTTTTt_', // row 23
  // Red side fins and body
  'DmtTTTTTTTTTTtmD', // row 24
  'DDmTTTTTTTTTTmDD', // row 25
  'mDD_TTTTTTTT_DDm', // row 26
  '_DD_tTTTTTTt_DD_', // row 27
  '_DD__SSSSSS__DD_', // row 28
  '__D__SSSSSS__D__', // row 29
  // Engine nozzle
  '_____MMMMMM_____', // row 30
  '_____mMMMMm_____', // row 31
];

const FLAME_FRAMES = [
  [
    '_____oOOOOo_____',
    '______FFFF______',
    '_______ff_______',
  ],
  [
    '____oOOFFOOo____',
    '_____OFFFFF_____',
    '______fFFf______',
    '_______ff_______',
  ],
  [
    '____OOFFOO____',
    '___oOFFFFOo___',
    '____oFFFFo____',
    '_____fFFf_____',
    '______ff______',
  ],
  [
    '___oOOFFFFOOo___',
    '____OFFFFFFO____',
    '_____OFFFFO_____',
    '______fFFf______',
    '_______ff_______',
  ],
];

// Ship debris pieces for explosion
interface Debris {
  id: number;
  pixels: { x: number; y: number; color: string }[];
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
}

// Define ship pieces that will break apart (updated for new 16px wide ship)
// Initial vx spreads pieces horizontally, vy is small initial burst
// Then "camera keeps moving up" effect is achieved by adding constant downward drift
const SHIP_PIECES = [
  // Antenna + dome top (rows 0-6) - bursts up
  { rows: [0, 1, 2, 3, 4, 5, 6], vx: 0, vy: -2.5 },
  // Green stripe (rows 7-8) - drifts left
  { rows: [7, 8], vx: -2, vy: -1 },
  // Upper body left with part of window (rows 9-18 left half)
  { rows: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18], cols: [0, 1, 2, 3, 4, 5, 6, 7], vx: -3, vy: 0 },
  // Upper body right with part of window (rows 9-18 right half)
  { rows: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18], cols: [8, 9, 10, 11, 12, 13, 14, 15], vx: 3, vy: 0 },
  // Mid body (row 19)
  { rows: [19], vx: 0.5, vy: 0.5 },
  // Yellow stripe (rows 20-21)
  { rows: [20, 21], vx: -1, vy: 1 },
  // Lower body (rows 22-23)
  { rows: [22, 23], vx: 1, vy: 1.5 },
  // Left fin (rows 24-29 left side)
  { rows: [24, 25, 26, 27, 28, 29], cols: [0, 1, 2, 3], vx: -4, vy: 1 },
  // Right fin (rows 24-29 right side)
  { rows: [24, 25, 26, 27, 28, 29], cols: [12, 13, 14, 15], vx: 4, vy: 1 },
  // Engine (rows 30-31)
  { rows: [30, 31], vx: 0, vy: 2.5 },
];

// Generate debris from ship pieces
const generateDebris = (scale: number): Debris[] => {
  const debris: Debris[] = [];

  SHIP_PIECES.forEach((piece, pieceIndex) => {
    const pixels: { x: number; y: number; color: string }[] = [];

    piece.rows.forEach(rowIndex => {
      if (rowIndex >= SHIP_ROWS.length) return;
      const row = SHIP_ROWS[rowIndex];
      const cols = piece.cols || Array.from({ length: 14 }, (_, i) => i);

      cols.forEach(colIndex => {
        if (colIndex >= row.length) return;
        const char = row[colIndex];
        if (char !== '_') {
          pixels.push({
            x: colIndex * scale,
            y: rowIndex * scale,
            color: COLORS[char] || 'transparent',
          });
        }
      });
    });

    if (pixels.length > 0) {
      debris.push({
        id: pieceIndex,
        pixels,
        vx: piece.vx * scale * 0.8,
        vy: piece.vy * scale * 0.8,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 8,
      });
    }
  });

  return debris;
};

// Flash/spark particles
interface Spark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

const generateSparks = (scale: number, count: number): Spark[] => {
  const sparks: Spark[] = [];
  const colors = ['#ffffff', '#ffff44', '#ff8822', '#ff4444'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (2 + Math.random() * 4) * scale * 0.3;
    sparks.push({
      id: i,
      x: 0, // Start at center (offset added in render)
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    });
  }
  return sparks;
};

export const Ship: React.FC<ShipProps> = ({ state, scale = 4 }) => {
  const [flameFrame, setFlameFrame] = useState(0);
  const [flickerOn, setFlickerOn] = useState(true);
  const [explosionTime, setExplosionTime] = useState(0);
  const [debris, setDebris] = useState<Debris[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [showFlash, setShowFlash] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;

  // Flame animation
  useEffect(() => {
    if (state === 'destroyed') return;
    const speed = state === 'critical' ? 60 : state === 'damaged' ? 80 : 100;
    const interval = setInterval(() => {
      setFlameFrame(f => (f + 1) % FLAME_FRAMES.length);
    }, speed);
    return () => clearInterval(interval);
  }, [state]);

  // Flicker for damaged/critical
  useEffect(() => {
    if (state !== 'damaged' && state !== 'critical') {
      setFlickerOn(true);
      return;
    }
    const speed = state === 'critical' ? 80 : 150;
    const interval = setInterval(() => {
      setFlickerOn(f => !f);
    }, speed);
    return () => clearInterval(interval);
  }, [state]);

  // Explosion physics
  useEffect(() => {
    if (state !== 'destroyed') {
      setExplosionTime(0);
      setDebris([]);
      setSparks([]);
      setShowFlash(false);
      return;
    }

    // Initial flash
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 100);

    // Generate debris and sparks
    setDebris(generateDebris(scale));
    setSparks(generateSparks(scale, 30));

    // Physics loop - camera keeps moving up, debris gets left behind
    let time = 0;
    const cameraSpeed = scale * 0.4; // How fast camera moves up (debris appears to move down)
    const interval = setInterval(() => {
      time += 1;
      setExplosionTime(time);

      // Update debris - horizontal spread slows down, constant downward drift (camera moving up)
      setDebris(prev => prev.map(d => ({
        ...d,
        vx: d.vx * 0.96, // horizontal spread decelerates
        vy: d.vy + cameraSpeed * 0.05, // constant "gravity" from camera moving up
        rotation: d.rotation + d.rotationSpeed,
        rotationSpeed: d.rotationSpeed * 0.97,
      })));

      // Update sparks - they also get left behind
      setSparks(prev => prev
        .map(s => ({
          ...s,
          x: s.x + s.vx,
          y: s.y + s.vy + cameraSpeed * 0.3, // sparks drift down faster
          vx: s.vx * 0.95,
          vy: s.vy * 0.95,
          life: s.life - 0.02,
        }))
        .filter(s => s.life > 0)
      );

      // Stop after debris is well off screen
      if (time > 200) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [state, scale]);

  // Bob animation (healthy only)
  useEffect(() => {
    if (state !== 'healthy') {
      bobAnim.setValue(0);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1800,
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
    const intensity = state === 'critical' ? 5 : 2;
    const speed = state === 'critical' ? 40 : 80;
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

  const getColors = () => {
    if (state === 'critical') return flickerOn ? CRITICAL_COLORS : COLORS;
    if (state === 'damaged') return flickerOn ? DAMAGED_COLORS : COLORS;
    return COLORS;
  };

  // Render explosion with debris physics - pieces get left behind as camera moves up
  if (state === 'destroyed') {
    const shipCenterX = (spriteWidth * scale) / 2;
    const shipCenterY = (SHIP_ROWS.length * scale) / 2;

    return (
      <View style={[styles.explosionContainer, {
        width: spriteWidth * scale,
        height: SHIP_ROWS.length * scale,
        overflow: 'visible', // Allow debris to render outside container
      }]}>
        {/* Initial flash - centered on ship */}
        {showFlash && (
          <View style={[styles.flash, {
            width: spriteWidth * scale * 0.8,
            height: spriteWidth * scale * 0.8,
            left: shipCenterX - (spriteWidth * scale * 0.4),
            top: shipCenterY - (spriteWidth * scale * 0.4),
            borderRadius: spriteWidth * scale * 0.4,
          }]} />
        )}

        {/* Sparks - start from center */}
        {sparks.map(spark => (
          <View
            key={`spark-${spark.id}`}
            style={{
              position: 'absolute',
              left: shipCenterX + spark.x,
              top: shipCenterY + spark.y,
              width: scale,
              height: scale,
              backgroundColor: spark.color,
              opacity: spark.life,
            }}
          />
        ))}

        {/* Debris pieces - start at original position, then drift */}
        {debris.map(piece => {
          const offsetX = piece.vx * explosionTime;
          const offsetY = piece.vy * explosionTime;

          return (
            <View
              key={`debris-${piece.id}`}
              style={{
                position: 'absolute',
                left: offsetX,
                top: offsetY,
                transform: [{ rotate: `${piece.rotation}deg` }],
              }}
            >
              {piece.pixels.map((pixel, idx) => (
                <View
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: pixel.x,
                    top: pixel.y,
                    width: scale,
                    height: scale,
                    backgroundColor: pixel.color,
                  }}
                />
              ))}
            </View>
          );
        })}
      </View>
    );
  }

  // Normal ship render
  const currentFlame = FLAME_FRAMES[flameFrame];
  const fullRows = [...SHIP_ROWS, ...currentFlame];
  const colors = getColors();

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
          {row.split('').map((char, x) => (
            <View
              key={x}
              style={{
                width: scale,
                height: scale,
                backgroundColor: colors[char] || 'transparent',
              }}
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
  explosionContainer: {
    position: 'relative',
  },
  flash: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    opacity: 0.9,
  },
});
