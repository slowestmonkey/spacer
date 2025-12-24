import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function StartMenu() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SPACER</Text>
      <Text style={styles.subtitle}>Walk to survive</Text>

      <Pressable style={styles.button} onPress={() => router.push('/hangar')}>
        <Text style={styles.buttonText}>START</Text>
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
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
    marginBottom: 60,
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
