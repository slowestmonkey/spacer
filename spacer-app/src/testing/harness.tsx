import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { SceneProvider, useScene, type SceneName } from '../game/SceneContext';

/** Surfaces the current scene so tests can assert on `change_scene_to_file()`. */
export function SceneProbe() {
  const { scene } = useScene();
  return <Text testID="current-scene">{scene}</Text>;
}

export function Harness({
  children,
  initialScene = 'world',
}: {
  children: ReactNode;
  initialScene?: SceneName;
}) {
  return (
    <SceneProvider initialScene={initialScene}>
      <SceneProbe />
      {children}
    </SceneProvider>
  );
}
