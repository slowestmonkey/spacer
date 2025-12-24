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
import { colors, text, screenContainer } from '../src/styles/theme';

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
  const progress = goal > 0 ? Math.min(todaySteps / goal, 1) : 0;
  const progressPercent = Math.floor(progress * 100);

  return (
    <View style={styles.container}>
      <StarBackground />

      {/* Fuel HUD */}
      <View style={[styles.hudBox, styles.fuelContainer]}>
        <Text style={styles.hudLabel}>FUEL</Text>
        <Text style={styles.hudValue}>{fuel}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.hudPercent}>{progressPercent}%</Text>
      </View>

      {/* Goal HUD */}
      <View style={[styles.hudBox, styles.goalContainer]}>
        <Text style={styles.hudLabel}>GOAL</Text>
        <Text style={styles.hudValue}>{goalFuel}</Text>
        <Text style={styles.hudHint}>DAILY TARGET</Text>
      </View>

      {/* Ship or Explosion */}
      {isExploding ? (
        <Explosion size={100} onComplete={handleExplosionComplete} />
      ) : (
        shipHull && <Ship hullId={shipHull} size={80} />
      )}

      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, progress >= 1 && styles.statusDotComplete]} />
        <Text style={styles.statusText}>
          {progress >= 1 ? 'GOAL REACHED' : 'IN FLIGHT'}
        </Text>
      </View>

      {/* Debug button */}
      <Pressable style={styles.debugButton} onPress={destroyShip}>
        <Text style={styles.debugText}>[ DBG ]</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...screenContainer,
  },
  hudBox: {
    position: 'absolute',
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fuelContainer: {
    top: 60,
    left: 16,
    minWidth: 100,
  },
  goalContainer: {
    top: 60,
    right: 16,
    alignItems: 'flex-end',
    minWidth: 100,
  },
  hudLabel: {
    ...text.label,
    fontSize: 8,
    marginBottom: 4,
  },
  hudValue: {
    ...text.valueLarge,
    color: colors.primary,
  },
  hudHint: {
    ...text.label,
    fontSize: 6,
    marginTop: 6,
    color: colors.textMuted,
  },
  hudPercent: {
    ...text.label,
    fontSize: 8,
    marginTop: 4,
    color: colors.textDim,
  },
  progressBarBg: {
    width: 80,
    height: 4,
    backgroundColor: colors.border,
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.primary,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.secondary,
  },
  statusDotComplete: {
    backgroundColor: colors.primary,
  },
  statusText: {
    ...text.label,
    fontSize: 8,
    color: colors.textDim,
  },
  debugButton: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.3,
  },
  debugText: {
    ...text.label,
    fontSize: 8,
    color: colors.textMuted,
  },
});
