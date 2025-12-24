import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useGameStore, stepsToFuel } from '../src/stores/gameStore';

export default function GameOver() {
  const { goal } = useGameStore();

  return (
    <View style={styles.container}>
      <Text style={styles.explosion}>💥</Text>

      <Text style={styles.title}>DESTROYED</Text>
      <Text style={styles.subtitle}>Your ship ran out of fuel</Text>

      <View style={styles.stats}>
        <Text style={styles.statLabel}>Daily goal was</Text>
        <Text style={styles.statValue}>{stepsToFuel(goal)} fuel</Text>
        <Text style={styles.statHint}>({goal.toLocaleString()} steps)</Text>
      </View>

      <Pressable style={styles.button} onPress={() => router.replace('/hangar')}>
        <Text style={styles.buttonText}>TRY AGAIN</Text>
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
  explosion: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f44',
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    marginBottom: 40,
  },
  stats: {
    alignItems: 'center',
    marginBottom: 60,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 2,
  },
  statValue: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 8,
  },
  statHint: {
    fontSize: 12,
    color: '#444',
    marginTop: 4,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    letterSpacing: 4,
  },
});
