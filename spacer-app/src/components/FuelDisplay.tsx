import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

// Vibrant color palette
const COLORS = {
  // Primary
  teal: '#4a90a4',
  tealLight: '#5dade2',
  green: '#2ecc71',
  greenLight: '#6bcb77',
  orange: '#f39c12',
  yellow: '#ffd93d',
  red: '#e74c3c',
  redLight: '#ff6b6b',
  cyan: '#66d9ff',

  // UI
  bgDark: '#0a0a1a',
  bgMid: '#1a1a2e',
  bgLight: '#2d2d44',
  textPrimary: '#ffffff',
  textSecondary: '#aaccff',
  textMuted: '#7f8c8d',
};

interface FuelDisplayProps {
  fuel: number;
  goal: number;
  isCalibrating?: boolean;
}

export const FuelDisplay: React.FC<FuelDisplayProps> = ({
  fuel,
  goal,
  isCalibrating = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const prevFuel = useRef(fuel);

  // Pulse animation when fuel changes
  useEffect(() => {
    if (fuel !== prevFuel.current) {
      const isIncrease = fuel > prevFuel.current;

      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: isIncrease ? 1.3 : 0.9,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(pulseAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow effect on increase
      if (isIncrease) {
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }

      prevFuel.current = fuel;
    }
  }, [fuel, pulseAnim, glowAnim]);

  const progress = goal > 0 ? Math.min(fuel / (goal / 10), 1) : 0;
  const progressPercent = progress * 100;

  // Dynamic colors based on progress
  const fuelColor =
    progress >= 1 ? COLORS.green :
    progress >= 0.75 ? COLORS.tealLight :
    progress >= 0.5 ? COLORS.teal :
    progress >= 0.25 ? COLORS.orange :
    COLORS.red;

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <View style={styles.container}>
      {/* Fuel value with pulse animation */}
      <View style={styles.fuelRow}>
        <Text style={styles.label}>FUEL</Text>
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Text style={[styles.value, { color: fuelColor }]}>{fuel}</Text>
        </Animated.View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          {/* Animated fill */}
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: fuelColor,
                shadowColor: fuelColor,
              },
            ]}
          />
          {/* Glow overlay on change */}
          <Animated.View
            style={[
              styles.progressBarGlow,
              {
                width: `${progressPercent}%`,
                backgroundColor: COLORS.textPrimary,
                opacity: glowOpacity,
              },
            ]}
          />
          {/* Segment lines for pixel look */}
          <View style={styles.segmentContainer}>
            {[...Array(10)].map((_, i) => (
              <View key={i} style={styles.segment} />
            ))}
          </View>
        </View>
        {/* Progress markers */}
        <View style={styles.markerContainer}>
          <View style={[styles.marker, { left: '25%' }]} />
          <View style={[styles.marker, { left: '50%' }]} />
          <View style={[styles.marker, { left: '75%' }]} />
        </View>
      </View>

      {/* Goal display */}
      <View style={styles.goalRow}>
        <Text style={styles.label}>
          {isCalibrating ? 'CALIBRATING' : 'DAILY GOAL'}
        </Text>
        <Text
          style={[
            styles.goalValue,
            isCalibrating && styles.calibratingText,
          ]}
        >
          {isCalibrating ? '• • •' : Math.floor(goal / 10).toLocaleString()}
        </Text>
      </View>

      {/* Progress percentage */}
      {!isCalibrating && (
        <View style={styles.percentageRow}>
          <Text style={[styles.percentage, { color: fuelColor }]}>
            {Math.floor(progressPercent)}%
          </Text>
          <Text style={styles.percentageLabel}>COMPLETE</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.bgMid,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.bgLight,
    margin: 10,
  },
  fuelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  value: {
    fontFamily: 'PressStart2P',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  progressBarContainer: {
    marginVertical: 8,
    position: 'relative',
  },
  progressBarBg: {
    height: 16,
    backgroundColor: COLORS.bgDark,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: COLORS.bgLight,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  progressBarGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 2,
  },
  segmentContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  segment: {
    width: 2,
    height: '100%',
    backgroundColor: COLORS.bgDark,
    opacity: 0.4,
  },
  markerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -4,
    height: 4,
  },
  marker: {
    position: 'absolute',
    width: 2,
    height: 4,
    backgroundColor: COLORS.bgLight,
    transform: [{ translateX: -1 }],
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  goalValue: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  calibratingText: {
    color: COLORS.orange,
    letterSpacing: 4,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 6,
  },
  percentage: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    fontWeight: 'bold',
  },
  percentageLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: COLORS.textMuted,
  },
});
