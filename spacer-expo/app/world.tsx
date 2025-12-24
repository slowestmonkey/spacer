import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useGameStore, stepsToFuel } from '../src/stores/gameStore';
import { getTodaySteps, requestPermissions } from '../src/services/healthKit';

export default function World() {
  const { todaySteps, goal, setTodaySteps, setHealthKitPermission } = useGameStore();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const init = async () => {
      const granted = await requestPermissions();
      setHealthKitPermission(granted);

      // Fetch immediately
      const steps = await getTodaySteps();
      setTodaySteps(steps);

      // Then every 2 seconds (like Godot version)
      interval = setInterval(async () => {
        const steps = await getTodaySteps();
        setTodaySteps(steps);
      }, 2000);
    };

    init();
    return () => clearInterval(interval);
  }, []);

  const fuel = stepsToFuel(todaySteps);

  return (
    <View style={styles.container}>
      {/* Fuel display */}
      <View style={styles.fuelContainer}>
        <Text style={styles.fuelLabel}>FUEL</Text>
        <Text style={styles.fuelValue}>{fuel}</Text>
      </View>

      {/* Ship placeholder */}
      <Text style={styles.ship}>🚀</Text>

      {/* Goal display */}
      <View style={styles.goalContainer}>
        <Text style={styles.goalLabel}>GOAL</Text>
        <Text style={styles.goalValue}>{stepsToFuel(goal)}</Text>
      </View>

      {/* Debug: tap to simulate game over */}
      <Pressable
        style={styles.debugButton}
        onPress={() => router.replace('/game-over')}
      >
        <Text style={styles.debugText}>[ debug: end game ]</Text>
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
  fuelLabel: {
    fontSize: 12,
    color: '#888',
    letterSpacing: 2,
  },
  fuelValue: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  ship: {
    fontSize: 64,
  },
  goalContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'flex-end',
  },
  goalLabel: {
    fontSize: 12,
    color: '#888',
    letterSpacing: 2,
  },
  goalValue: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  debugButton: {
    position: 'absolute',
    bottom: 40,
  },
  debugText: {
    color: '#444',
    fontSize: 12,
  },
});
