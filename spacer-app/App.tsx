import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { KENNEY_MINI_SQUARE_FONT } from './src/game/assets';
import { BACKGROUND_COLOR, FONT_FAMILY } from './src/game/constants';
import { SceneProvider, useScene } from './src/game/SceneContext';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { HangarScreen } from './src/screens/HangarScreen';
import { StartMenuScreen } from './src/screens/StartMenuScreen';
import { WorldScreen } from './src/screens/WorldScreen';

void SplashScreen.preventAutoHideAsync();

/** `get_tree().change_scene_to_file()` resolved to a component. */
function CurrentScene() {
  const { scene } = useScene();

  switch (scene) {
    case 'start_menu':
      return <StartMenuScreen />;
    case 'hangar':
      return <HangarScreen />;
    case 'world':
      return <WorldScreen />;
    case 'game_over':
      return <GameOverScreen />;
  }
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    [FONT_FAMILY]: KENNEY_MINI_SQUARE_FONT,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <SceneProvider>
        <CurrentScene />
      </SceneProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
});
