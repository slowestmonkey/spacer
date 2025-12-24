import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GameState {
  // Ship
  shipHull: number;
  setShipHull: (hull: number) => void;

  // Steps & Goal
  todaySteps: number;
  goal: number;
  setTodaySteps: (steps: number) => void;
  setGoal: (goal: number) => void;

  // Permissions
  healthKitPermission: boolean;
  setHealthKitPermission: (granted: boolean) => void;

  // Goal period
  goalStartDate: string | null;
  setGoalStartDate: (date: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      // Ship
      shipHull: 0,
      setShipHull: (hull) => set({ shipHull: hull }),

      // Steps & Goal
      todaySteps: 0,
      goal: 0,
      setTodaySteps: (steps) => set({ todaySteps: steps }),
      setGoal: (goal) => set({ goal }),

      // Permissions
      healthKitPermission: false,
      setHealthKitPermission: (granted) => set({ healthKitPermission: granted }),

      // Goal period
      goalStartDate: null,
      setGoalStartDate: (date) => set({ goalStartDate: date }),
    }),
    {
      name: 'spacer-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        shipHull: state.shipHull,
        goal: state.goal,
        goalStartDate: state.goalStartDate,
      }),
    }
  )
);

// Helper: convert steps to fuel (same as Godot: steps / 10)
export const stepsToFuel = (steps: number): number => Math.floor(steps / 10);

// Helper: calculate goal from 30-day average (60% of average)
export const calculateGoal = (stepsData: Record<string, number>): number => {
  const values = Object.values(stepsData);
  if (values.length === 0) return 0;
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.floor(average * 0.6);
};
