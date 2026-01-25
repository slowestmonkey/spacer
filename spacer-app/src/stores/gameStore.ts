import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, ShipState } from '../types';

const CALIBRATION_DAYS = 7;
const GOAL_MULTIPLIER = 0.8; // 80% of average

interface GameActions {
  // Fuel & Steps
  updateSteps: (steps: number) => void;
  calculateGoal: (historicalSteps: number[]) => void;

  // Ship state
  setShipState: (state: ShipState) => void;
  damageShip: () => void;
  repairShip: () => void;
  destroyShip: () => void;
  resetShip: () => void;

  // Calibration
  addCalibrationDay: (steps: number) => void;
  completeCalibration: () => void;

  // Journey
  startJourney: () => void;
  checkDaily: () => void;

  // Debug
  setDebugState: (state: Partial<GameState>) => void;
  resetAll: () => void;
}

const initialState: GameState = {
  shipState: 'healthy',
  consecutiveFailures: 0,
  currentFuel: 0,
  dailyGoal: 0,
  stepsToday: 0,
  isCalibrating: true,
  calibrationDaysRemaining: CALIBRATION_DAYS,
  historicalSteps: [],
  journeyStartDate: null,
  lastCheckedDate: null,
  hasCompletedOnboarding: false,
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateSteps: (steps: number) => {
        const fuel = Math.floor(steps / 10);
        set({ stepsToday: steps, currentFuel: fuel });
      },

      calculateGoal: (historicalSteps: number[]) => {
        if (historicalSteps.length === 0) return;
        const average = historicalSteps.reduce((a, b) => a + b, 0) / historicalSteps.length;
        const goal = Math.round(average * GOAL_MULTIPLIER);
        set({ dailyGoal: goal });
      },

      setShipState: (state: ShipState) => set({ shipState: state }),

      damageShip: () => {
        const { consecutiveFailures, shipState } = get();
        const newFailures = consecutiveFailures + 1;

        // Progress through damage states
        let newState: ShipState;
        if (newFailures === 1) {
          newState = 'warning';
        } else if (newFailures === 2) {
          newState = 'damaged';
        } else if (newFailures === 3) {
          newState = 'critical';
        } else {
          newState = 'destroyed';
        }

        set({ consecutiveFailures: newFailures, shipState: newState });
      },

      repairShip: () => {
        const { consecutiveFailures } = get();
        if (consecutiveFailures > 0) {
          const newFailures = Math.max(0, consecutiveFailures - 1);
          let newState: ShipState;
          if (newFailures === 0) {
            newState = 'healthy';
          } else if (newFailures === 1) {
            newState = 'warning';
          } else if (newFailures === 2) {
            newState = 'damaged';
          } else {
            newState = 'critical';
          }
          set({ consecutiveFailures: newFailures, shipState: newState });
        }
      },

      destroyShip: () => {
        set({ shipState: 'destroyed', consecutiveFailures: 4 });
      },

      resetShip: () => {
        set({
          shipState: 'healthy',
          consecutiveFailures: 0,
          journeyStartDate: new Date().toISOString(),
        });
      },

      addCalibrationDay: (steps: number) => {
        const { historicalSteps, calibrationDaysRemaining } = get();
        const newHistory = [...historicalSteps, steps];
        const newDaysRemaining = calibrationDaysRemaining - 1;

        set({
          historicalSteps: newHistory,
          calibrationDaysRemaining: newDaysRemaining,
        });

        if (newDaysRemaining <= 0) {
          get().completeCalibration();
        }
      },

      completeCalibration: () => {
        const { historicalSteps } = get();
        get().calculateGoal(historicalSteps);
        set({
          isCalibrating: false,
          journeyStartDate: new Date().toISOString(),
        });
      },

      startJourney: () => {
        set({
          hasCompletedOnboarding: true,
          journeyStartDate: new Date().toISOString(),
        });
      },

      checkDaily: () => {
        const { stepsToday, dailyGoal, lastCheckedDate, isCalibrating } = get();
        const today = new Date().toISOString().split('T')[0];

        if (lastCheckedDate === today || isCalibrating) return;

        if (stepsToday >= dailyGoal) {
          // Met goal - repair ship if damaged
          get().repairShip();
        } else {
          // Failed goal - damage ship
          get().damageShip();
        }

        set({ lastCheckedDate: today });
      },

      setDebugState: (state: Partial<GameState>) => set(state),

      resetAll: () => set(initialState),
    }),
    {
      name: 'spacer-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
