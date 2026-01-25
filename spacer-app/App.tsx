import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { GameScreen } from './src/screens/GameScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    'PressStart2P': require('./assets/fonts/PressStart2P.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <GameScreen />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050508',
  },
});
