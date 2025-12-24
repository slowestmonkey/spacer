import { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useGameStore, stepsToFuel } from '../src/stores/gameStore';
import StarBackground from '../src/components/StarBackground';
import Ship from '../src/components/Ship';
import { getTodaySteps, getStepsForLastDays, requestPermissions } from '../src/services/healthKit';
import {
  calculateGoal,
  shouldUpdateGoal,
  validateGoalPeriod,
  GOAL_PERIOD_DAYS,
} from '../src/services/goal';

export default function World() {
  const {
    shipHull,
    todaySteps,
    goal,
    goalSetAt,
    setTodaySteps,
    setGoal,
    setShipHull,
  } = useGameStore();

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Redirect if no ship selected
    if (shipHull === null) {
      router.replace('/');
      return;
    }

    let interval: ReturnType<typeof setInterval>;

    const init = async () => {
      await requestPermissions();

      // Initial steps fetch
      const steps = await getTodaySteps();
      setTodaySteps(steps);

      // Refresh goal if needed
      if (shouldUpdateGoal(goal, goalSetAt)) {
        const stepsData = await getStepsForLastDays(GOAL_PERIOD_DAYS);
        const newGoal = calculateGoal(stepsData);
        const now = new Date().toISOString();
        setGoal(newGoal, now);
      }

      // Validate goal period (after small delay like Godot)
      setTimeout(async () => {
        const stepsData = await getStepsForLastDays(GOAL_PERIOD_DAYS);
        const failedDate = validateGoalPeriod(stepsData, goal, goalSetAt);

        if (failedDate) {
          // Ship destroyed - clear hull and go to game over
          setShipHull(null);
          router.replace('/game-over');
        }
      }, 1000);

      // Poll steps every 2 seconds
      interval = setInterval(async () => {
        const steps = await getTodaySteps();
        setTodaySteps(steps);
      }, 2000);
    };

    init();
    return () => clearInterval(interval);
  }, []);

  const fuel = stepsToFuel(todaySteps);
  const goalFuel = stepsToFuel(goal);

  return (
    <View style={styles.container}>
      <StarBackground />

      {/* Fuel display */}
      <View style={styles.fuelContainer}>
        <Text style={styles.label}>FUEL</Text>
        <Text style={styles.value}>{fuel}</Text>
      </View>

      {/* Ship */}
      {shipHull && <Ship hullId={shipHull} size={80} />}

      {/* Goal display */}
      <View style={styles.goalContainer}>
        <Text style={styles.label}>GOAL</Text>
        <Text style={styles.value}>{goalFuel}</Text>
      </View>

      {/* Debug button */}
      <Pressable
        style={styles.debugButton}
        onPress={() => {
          setShipHull(null);
          router.replace('/game-over');
        }}
      >
        <Text style={styles.debugText}>[ debug: destroy ]</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fuelContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  goalContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 12,
    color: '#888',
    letterSpacing: 2,
  },
  value: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  debugButton: {
    position: 'absolute',
    bottom: 40,
  },
  debugText: {
    color: '#333',
    fontSize: 12,
  },
});
