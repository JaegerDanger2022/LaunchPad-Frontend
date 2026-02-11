import { create } from 'zustand';

interface AppState {
  currentScreen: string;
  completedSteps: number;
  milestoneCompletions: Record<string, number>; // Track completions per milestone ID
  dismissedShareButtons: Record<string, boolean>; // Track which milestones had their share button dismissed
  serverErrorVisible: boolean;
  setCurrentScreen: (screen: string) => void;
  setCompletedSteps: (steps: number) => void;
  setMilestoneCompletions: (milestoneId: string, steps: number) => void;
  getMilestoneCompletions: (milestoneId: string) => number;
  dismissShareButton: (milestoneId: string) => void;
  isShareButtonDismissed: (milestoneId: string) => boolean;
  showServerError: () => void;
  hideServerError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: 'Home',
  completedSteps: 0,
  milestoneCompletions: {},
  dismissedShareButtons: {},
  serverErrorVisible: false,
  setCurrentScreen: (screen: string) => set({ currentScreen: screen }),
  setCompletedSteps: (steps: number) => set({ completedSteps: steps }),
  setMilestoneCompletions: (milestoneId: string, steps: number) =>
    set((state) => ({
      milestoneCompletions: {
        ...state.milestoneCompletions,
        [milestoneId]: steps,
      },
    })),
  getMilestoneCompletions: (milestoneId: string) => {
    const state = get();
    return state.milestoneCompletions[milestoneId] || 0;
  },
  dismissShareButton: (milestoneId: string) =>
    set((state) => ({
      dismissedShareButtons: {
        ...state.dismissedShareButtons,
        [milestoneId]: true,
      },
    })),
  isShareButtonDismissed: (milestoneId: string) => {
    const state = get();
    return state.dismissedShareButtons[milestoneId] || false;
  },
  showServerError: () => set({ serverErrorVisible: true }),
  hideServerError: () => set({ serverErrorVisible: false }),
}));
