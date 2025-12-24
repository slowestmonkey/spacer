import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GameState {
  // Ship
  shipHull: number | null;
  setShipHull: (hull: number | null) => void;

  // Steps & Goal
  todaySteps: number;
  goal: number;
  goalSetAt: string | null;
  setTodaySteps: (steps: number) => void;
  setGoal: (goal: number, setAt: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      // Ship
      shipHull: null,
      setShipHull: (hull) => set({ shipHull: hull }),

      // Steps & Goal
      todaySteps: 0,
      goal: 0,
      goalSetAt: null,
      setTodaySteps: (steps) => set({ todaySteps: steps }),
      setGoal: (goal, setAt) => set({ goal, goalSetAt: setAt }),
    }),
    {
      name: 'spacer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        shipHull: state.shipHull,
        goal: state.goal,
        goalSetAt: state.goalSetAt,
      }),
    }
  )
);

// Helper: convert steps to fuel (steps / 10)
export const stepsToFuel = (steps: number): number => Math.floor(steps / 10);
