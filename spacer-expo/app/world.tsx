import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useGameStore, stepsToFuel } from '../src/stores/gameStore';
import StarBackground from '../src/components/StarBackground';
import Ship from '../src/components/Ship';
import Explosion from '../src/components/Explosion';
import { getTodaySteps, getStepsForLastDays, requestPermissions } from '../src/services/healthKit';
import {
  calculateGoal,
  shouldUpdateGoal,
  validateGoalPeriod,
  GOAL_PERIOD_DAYS,
} from '../src/services/goal';
import { hapticError } from '../src/utils/haptics';

export default function World() {
  const shipHull = useGameStore((s) => s.shipHull);
  const todaySteps = useGameStore((s) => s.todaySteps);
  const goal = useGameStore((s) => s.goal);
  const setTodaySteps = useGameStore((s) => s.setTodaySteps);
  const setGoal = useGameStore((s) => s.setGoal);
  const setShipHull = useGameStore((s) => s.setShipHull);

  const initialized = useRef(false);
  const [isExploding, setIsExploding] = useState(false);

  const destroyShip = () => {
    hapticError();
    setIsExploding(true);
  };

  const handleExplosionComplete = () => {
    setShipHull(null);
    router.replace('/game-over');
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Redirect if no ship selected
    if (shipHull === null) {
      router.replace('/');
      return;
    }

    let interval: ReturnType<typeof setInterval>;
    let mounted = true;

    const init = async () => {
      await requestPermissions();

      // Initial steps fetch
      const steps = await getTodaySteps();
      if (!mounted) return;
      setTodaySteps(steps);

      // Get fresh state from store
      const state = useGameStore.getState();
      let currentGoal = state.goal;
      let currentGoalSetAt = state.goalSetAt;

      // Refresh goal if needed
      if (shouldUpdateGoal(currentGoal, currentGoalSetAt)) {
        const stepsData = await getStepsForLastDays(GOAL_PERIOD_DAYS);
        if (!mounted) return;

        const newGoal = calculateGoal(stepsData);
        const now = new Date().toISOString();
        setGoal(newGoal, now);

        // Update local refs for validation
        currentGoal = newGoal;
        currentGoalSetAt = now;
      }

      // Validate goal period (after small delay)
      setTimeout(async () => {
        if (!mounted) return;

        const stepsData = await getStepsForLastDays(GOAL_PERIOD_DAYS);
        if (!mounted) return;

        const failedDate = validateGoalPeriod(stepsData, currentGoal, currentGoalSetAt);
        if (failedDate) {
          destroyShip();
        }
      }, 1000);

      // Poll steps every 2 seconds
      interval = setInterval(async () => {
        if (!mounted) return;
        const steps = await getTodaySteps();
        if (mounted) setTodaySteps(steps);
      }, 2000);
    };

    init();

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
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

      {/* Ship or Explosion */}
      {isExploding ? (
        <Explosion size={100} onComplete={handleExplosionComplete} />
      ) : (
        shipHull && <Ship hullId={shipHull} size={80} />
      )}

      {/* Goal display */}
      <View style={styles.goalContainer}>
        <Text style={styles.label}>GOAL</Text>
        <Text style={styles.value}>{goalFuel}</Text>
      </View>

      {/* Debug button */}
      <Pressable style={styles.debugButton} onPress={destroyShip}>
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
