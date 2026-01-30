import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark';

interface ThemeState {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',

  toggleTheme: async () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('theme', newTheme).catch(console.error);
      return { theme: newTheme };
    });
  },

  setTheme: async (theme: ThemeType) => {
    set({ theme });
    await AsyncStorage.setItem('theme', theme);
  },

  initializeTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({ theme: savedTheme });
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  },
}));
