import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Hangar() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HANGAR</Text>
      <Text style={styles.subtitle}>Select your ship</Text>

      {/* Ship selector placeholder */}
      <View style={styles.shipPlaceholder}>
        <Text style={styles.shipText}>🚀</Text>
      </View>

      <Pressable style={styles.button} onPress={() => router.push('/world')}>
        <Text style={styles.buttonText}>LAUNCH</Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    marginBottom: 40,
  },
  shipPlaceholder: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  shipText: {
    fontSize: 48,
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
