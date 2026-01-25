import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { ShipState } from '../types';

interface ShipProps {
  state: ShipState;
  scale?: number;
}

// Color palette
const COLORS: Record<string, string> = {
  _: 'transparent',
  W: '#ffffff',
  w: '#dddddd',
  r: '#ff4444',
  R: '#cc2222',
  D: '#881111',
  c: '#44dddd',
  C: '#22aaaa',
  g: '#44dd44',
  G: '#22aa22',
  b: '#4488ff',
  B: '#2255cc',
  Y: '#ffff44',
  y: '#ffcc22',
  O: '#ff8822',
  o: '#cc5500',
  M: '#aaaaaa',
  m: '#666666',
  d: '#333333',
};

const DAMAGED_COLORS: Record<string, string> = {
  ...COLORS,
  c: '#dd9944',
  C: '#aa6633',
  g: '#aaaa22',
  G: '#888811',
};

const CRITICAL_COLORS: Record<string, string> = {
  ...COLORS,
  c: '#aa4444',
  C: '#882222',
  g: '#884422',
  G: '#662211',
  b: '#aa4488',
  B: '#882266',
  Y: '#ff8844',
  y: '#dd6633',
};

// Ship sprite - 14 pixels wide
const SHIP_ROWS = [
  '______WW______',
  '______yy______',
  '______yy______',
  '_____rWWr_____',
  '____RrWWrR____',
  '___DRrrrrRD___',
  '__DRrrrrrrRD__',
  '_DRrrrrrrrrRD_',
  '_YyyyyyyyyyyY_',
  '_yYYYYYYYYYYy_',
  '_CccccccccccC_',
  '_CccccccccccC_',
  '_Ccc_BBBB_ccC_',
  '_CccBbbbbBccC_',
  '_CccBbWWbBccC_',
  '_CccBbWWbBccC_',
  '_CccBbbbbBccC_',
  '_Ccc_BBBB_ccC_',
  '_CccccccccccC_',
  '_GggggggggggG_',
  '_gGGGGGGGGGGg_',
  '_CccccccccccC_',
  '_CccccccccccC_',
  'D_CccccccccC_D',
  'DD_CccccccC_DD',
  'DDD_CccccC_DDD',
  'DDD__CCCC__DDD',
  '____dMMMMd____',
  '____MmmmmM____',
  '_____oOOo_____',
];

const FLAME_FRAMES = [
  ['_____oYYo_____', '______yy______', '______________'],
  ['____oYYYYo____', '_____YWWY_____', '______YY______'],
  ['___oYYWWYYo___', '____YYWWYY____', '_____oYYo_____'],
  ['__oYYWWWWYYo__', '___YYWWWWYY___', '____oYYYYo____'],
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

// Define ship pieces that will break apart
// Initial vx spreads pieces horizontally, vy is small initial burst
// Then "camera keeps moving up" effect is achieved by adding constant downward drift
const SHIP_PIECES = [
  // Nose cone (top) - bursts up slightly then drifts down
  { rows: [0, 1, 2, 3, 4, 5, 6, 7], vx: 0, vy: -2 },
  // Yellow stripe - drifts left
  { rows: [8, 9], vx: -1.5, vy: -0.5 },
  // Upper body left - bursts left
  { rows: [10, 11, 12, 13], cols: [0, 1, 2, 3, 4, 5, 6], vx: -3, vy: 0 },
  // Upper body right - bursts right
  { rows: [10, 11, 12, 13], cols: [7, 8, 9, 10, 11, 12, 13], vx: 3, vy: 0 },
  // Window section - drifts right
  { rows: [14, 15, 16, 17], vx: 1, vy: 0.5 },
  // Green stripe - drifts left
  { rows: [18, 19, 20], vx: -1, vy: 0 },
  // Lower body - stays center
  { rows: [21, 22], vx: 0.5, vy: 1 },
  // Left fin - bursts hard left
  { rows: [23, 24, 25, 26], cols: [0, 1, 2, 3], vx: -4, vy: 1 },
  // Right fin - bursts hard right
  { rows: [23, 24, 25, 26], cols: [10, 11, 12, 13], vx: 4, vy: 1 },
  // Engine - drops straight down fast
  { rows: [27, 28, 29], vx: 0, vy: 2 },
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
    const intensity = state === 'critical' ? 8 : 3;
    const speed = state === 'critical' ? 25 : 60;
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
