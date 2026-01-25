import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { StarfieldBackground } from '../components/StarfieldBackground';
import { Ship } from '../components/Ship';
import { useGameStore } from '../stores/gameStore';
import { healthService } from '../services/healthService';
import { ShipState } from '../types';

// 16-bit color palette
const PALETTE = {
  black: '#000000',
  darkBlue: '#000022',
  white: '#ffffff',
  gray: '#888888',
  darkGray: '#444444',
  red: '#cc0000',
  brightRed: '#ff0000',
  green: '#00aa00',
  brightGreen: '#00ff00',
  cyan: '#00aaaa',
  brightCyan: '#00ffff',
  yellow: '#ffff00',
  orange: '#ff8800',
};

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
        fontFamily: 'Courier',
        fontWeight: 'bold',
        fontSize: size,
        color,
        letterSpacing: 1,
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
}> = ({ children, borderColor = PALETTE.cyan, style }) => (
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
              marginRight: i < segments - 1 ? 2 : 0,
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
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pixelBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    padding: 8,
  },
  fuelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  barContainer: {
    flexDirection: 'row',
    height: 8,
  },
  barSegment: {
    flex: 1,
    height: '100%',
  },
  calibrateBox: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  destinationContainer: {
    position: 'absolute',
    top: 120,
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
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
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
    gap: 8,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: 'center',
  },
});
