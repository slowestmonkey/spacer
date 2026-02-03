import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { StarfieldBackground } from '../components/StarfieldBackground';
import { Ship } from '../components/Ship';
import { useGameStore } from '../stores/gameStore';
import { healthService } from '../services/healthService';
import { ShipState } from '../types';

// Soft, muted palette inspired by the reference illustration
const PALETTE = {
  black: '#0b0f16',
  darkBlue: '#0f151f',
  white: '#e9edf2',
  gray: '#a6aeb7',
  darkGray: '#2a3340',
  red: '#c78886',
  brightRed: '#d69a97',
  green: '#9dbb9b',
  brightGreen: '#b8d0b6',
  cyan: '#8ba8ad',
  brightCyan: '#b5c8ca',
  yellow: '#d8caa3',
  orange: '#caa67f',
  panel: 'rgba(13, 18, 26, 0.78)',
  panelBorder: 'rgba(228, 232, 237, 0.16)',
};

const UI_FONT = Platform.select({
  ios: 'AvenirNext-DemiBold',
  android: 'sans-serif-medium',
  default: 'System',
});

// Pixel-style text component
const PixelText: React.FC<{
  children: React.ReactNode;
  style?: object;
  size?: number;
  color?: string;
}> = ({ children, style, size = 8, color = PALETTE.white }) => (
  <Text
    style={[
      {
        fontFamily: UI_FONT,
        fontWeight: '600',
        fontSize: size,
        color,
        letterSpacing: 0.6,
      },
      style,
    ]}
  >
    {children}
  </Text>
);

// Pixel box border component
const PixelBox: React.FC<{
  children: React.ReactNode;
  borderColor?: string;
  style?: object;
}> = ({ children, borderColor = PALETTE.panelBorder, style }) => (
  <View style={[styles.pixelBox, { borderColor }, style]}>
    {children}
  </View>
);

// Pixel progress bar
const PixelBar: React.FC<{
  value: number;
  max: number;
  color?: string;
  width?: number;
}> = ({ value, max, color = PALETTE.cyan, width = 120 }) => {
  const percentage = max > 0 ? Math.min(value / max, 1) : 0;
  const segments = 10;
  const filledSegments = Math.floor(percentage * segments);

  return (
    <View style={[styles.barContainer, { width }]}>
      {[...Array(segments)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.barSegment,
            {
              backgroundColor: i < filledSegments ? color : PALETTE.darkGray,
              marginRight: i < segments - 1 ? 1.5 : 0,
            },
          ]}
        />
      ))}
    </View>
  );
};

export const GameScreen: React.FC = () => {
  const {
    shipState,
    currentFuel,
    dailyGoal,
    stepsToday,
    isCalibrating,
    calibrationDaysRemaining,
    updateSteps,
    calculateGoal,
    damageShip,
    repairShip,
    resetShip,
    setDebugState,
  } = useGameStore();

  const [autoDemoMode, setAutoDemoMode] = useState(true);

  // Fetch steps
  const fetchSteps = useCallback(async () => {
    const healthData = await healthService.getHealthData();
    updateSteps(healthData.stepsToday);

    if (isCalibrating && healthData.stepsHistory.length > 0) {
      const steps = healthData.stepsHistory.map((h) => h.steps);
      calculateGoal(steps);
    }
  }, [updateSteps, calculateGoal, isCalibrating]);

  useEffect(() => {
    healthService.initialize().then(() => fetchSteps());
    const interval = setInterval(fetchSteps, 2000);
    return () => clearInterval(interval);
  }, [fetchSteps]);

  const cycleShipState = () => {
    const states: ShipState[] = ['healthy', 'warning', 'damaged', 'critical', 'destroyed'];
    const currentIndex = states.indexOf(shipState);
    const nextIndex = (currentIndex + 1) % states.length;
    setDebugState({ shipState: states[nextIndex], consecutiveFailures: nextIndex });
  };

  // Auto demo mode
  useEffect(() => {
    if (autoDemoMode) {
      const demoInterval = setInterval(cycleShipState, 2500);
      return () => clearInterval(demoInterval);
    }
  }, [autoDemoMode, shipState]);

  const handleReset = () => {
    Alert.alert('NEW MISSION', 'Start a new journey?', [
      { text: 'NO', style: 'cancel' },
      { text: 'YES', onPress: () => resetShip() },
    ]);
  };

  const getStateColor = (state: ShipState): string => {
    switch (state) {
      case 'healthy': return PALETTE.brightGreen;
      case 'warning': return PALETTE.yellow;
      case 'damaged': return PALETTE.orange;
      case 'critical': return PALETTE.brightRed;
      case 'destroyed': return PALETTE.gray;
      default: return PALETTE.white;
    }
  };

  const fuelColor =
    currentFuel >= dailyGoal ? PALETTE.brightGreen :
    currentFuel >= dailyGoal * 0.5 ? PALETTE.cyan :
    currentFuel >= dailyGoal * 0.25 ? PALETTE.yellow :
    PALETTE.red;

  return (
    <View style={styles.container}>
      <StarfieldBackground />

      {/* Header UI */}
      <View style={styles.header}>
        <PixelBox>
          <View style={styles.fuelRow}>
            <PixelText size={6} color={PALETTE.gray}>FUEL</PixelText>
            <PixelText size={12} color={fuelColor}>{currentFuel}</PixelText>
          </View>
          <PixelBar value={currentFuel} max={dailyGoal} color={fuelColor} />
        </PixelBox>

        {isCalibrating && (
          <PixelBox borderColor={PALETTE.yellow} style={styles.calibrateBox}>
            <PixelText size={5} color={PALETTE.yellow}>CALIBRATING</PixelText>
            <PixelText size={8} color={PALETTE.white}>{calibrationDaysRemaining}D</PixelText>
          </PixelBox>
        )}
      </View>

      {/* Destination */}
      <View style={styles.destinationContainer}>
        <PixelText size={6} color={PALETTE.cyan}>* DESTINATION *</PixelText>
        <PixelText size={14} color={PALETTE.white}>MARS</PixelText>
      </View>

      {/* Ship */}
      <View style={styles.shipContainer}>
        <Ship state={shipState} scale={5} />
      </View>

      {/* State badge */}
      <View style={styles.stateContainer}>
        <PixelBox borderColor={getStateColor(shipState)}>
          <PixelText size={10} color={getStateColor(shipState)}>
            {shipState.toUpperCase()}
          </PixelText>
        </PixelBox>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Stats */}
        <PixelBox style={styles.statsBox}>
          <View style={styles.statRow}>
            <PixelText size={6} color={PALETTE.gray}>STEPS</PixelText>
            <PixelText size={8} color={PALETTE.white}>{stepsToday.toLocaleString()}</PixelText>
          </View>
          {dailyGoal > 0 && (
            <View style={styles.statRow}>
              <PixelText size={6} color={PALETTE.gray}>GOAL</PixelText>
              <PixelText size={8} color={PALETTE.cyan}>{dailyGoal.toLocaleString()}</PixelText>
            </View>
          )}
        </PixelBox>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, { borderColor: PALETTE.cyan }]}
            onPress={cycleShipState}
          >
            <PixelText size={6} color={PALETTE.cyan}>CYCLE</PixelText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { borderColor: PALETTE.red }]}
            onPress={damageShip}
          >
            <PixelText size={6} color={PALETTE.red}>DMG</PixelText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { borderColor: PALETTE.green }]}
            onPress={repairShip}
          >
            <PixelText size={6} color={PALETTE.green}>FIX</PixelText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                borderColor: autoDemoMode ? PALETTE.yellow : PALETTE.gray,
                backgroundColor: autoDemoMode ? PALETTE.darkGray : 'transparent',
              },
            ]}
            onPress={() => setAutoDemoMode(!autoDemoMode)}
          >
            <PixelText size={6} color={autoDemoMode ? PALETTE.yellow : PALETTE.gray}>
              {autoDemoMode ? 'STOP' : 'DEMO'}
            </PixelText>
          </TouchableOpacity>

          {shipState === 'destroyed' && (
            <TouchableOpacity
              style={[styles.button, { borderColor: PALETTE.brightGreen }]}
              onPress={handleReset}
            >
              <PixelText size={6} color={PALETTE.brightGreen}>NEW</PixelText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.black,
  },
  header: {
    position: 'absolute',
    top: 46,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pixelBox: {
    backgroundColor: PALETTE.panel,
    borderWidth: 1,
    borderColor: PALETTE.panelBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  fuelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  barContainer: {
    flexDirection: 'row',
    height: 6,
  },
  barSegment: {
    flex: 1,
    height: '100%',
    borderRadius: 2,
  },
  calibrateBox: {
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  destinationContainer: {
    position: 'absolute',
    top: 118,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shipContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateContainer: {
    position: 'absolute',
    bottom: 196,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 16,
    right: 16,
  },
  statsBox: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    backgroundColor: 'rgba(15, 19, 26, 0.85)',
    borderWidth: 1,
    borderColor: PALETTE.panelBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 56,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
});
