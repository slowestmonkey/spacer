import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Stand-in for `get_tree().change_scene_to_file()`.
 *
 * The Godot build has no navigation stack — every transition swaps the whole
 * scene — so a single "current scene" value covers it.
 */
export type SceneName = 'start_menu' | 'hangar' | 'world' | 'game_over';

/** `project.godot -> run/main_scene` points at `world.tscn`. */
export const MAIN_SCENE: SceneName = 'world';

interface SceneContextValue {
  scene: SceneName;
  changeScene: (scene: SceneName) => void;
}

const SceneContext = createContext<SceneContextValue | null>(null);

export function SceneProvider({
  children,
  initialScene = MAIN_SCENE,
}: {
  children: ReactNode;
  initialScene?: SceneName;
}) {
  const [scene, setScene] = useState<SceneName>(initialScene);

  const changeScene = useCallback((next: SceneName) => {
    setScene(next);
  }, []);

  const value = useMemo(() => ({ scene, changeScene }), [scene, changeScene]);

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
}

export function useScene(): SceneContextValue {
  const value = useContext(SceneContext);
  if (!value) {
    throw new Error('useScene must be used inside a <SceneProvider>');
  }
  return value;
}
