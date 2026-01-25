import { create } from 'zustand';

interface AppState {
  currentScreen: string;
  completedSteps: number;
  setCurrentScreen: (screen: string) => void;
  setCompletedSteps: (steps: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentScreen: 'Home',
  completedSteps: 0,
  setCurrentScreen: (screen: string) => set({ currentScreen: screen }),
  setCompletedSteps: (steps: number) => set({ completedSteps: steps }),
}));
