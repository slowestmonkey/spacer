import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function GameOver() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GAME OVER</Text>
      <Text style={styles.subtitle}>Your ship was destroyed</Text>

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
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f44',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
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
