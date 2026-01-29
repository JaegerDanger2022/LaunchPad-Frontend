import { create } from 'zustand';
import {
  CommunityStats,
  CommunityFilters,
  ImpactLevel,
} from '../types/community';
import {
  createVictory,
  giveCourageBoost,
  getUserCommunityStats,
} from '../config/api';

interface CommunityState {
  // ONLY store filter state and stats - NO victory card caching
  filters: CommunityFilters;
  userCommunityStats: CommunityStats | null;
  statsLoading: boolean;
  error: string | null;

  // Actions
  createVictoryCard: (
    milestoneId: string,
    evidenceSnippet: string,
    isAnonymous: boolean,
    impact?: ImpactLevel
  ) => Promise<string>;
  boostVictory: (victoryId: string) => Promise<void>;
  setFilters: (filters: CommunityFilters) => void;
  resetFilters: () => void;
  loadUserStats: (userId: string) => Promise<void>;
  clearError: () => void;
}

const initialFilters: CommunityFilters = {
  categories: [],
  timeframe: 'all',
};

export const useCommunityStore = create<CommunityState>((set) => ({
  filters: initialFilters,
  userCommunityStats: null,
  statsLoading: false,
  error: null,

  createVictoryCard: async (
    milestoneId: string,
    evidenceSnippet: string,
    isAnonymous: boolean,
    impact?: ImpactLevel
  ) => {
    try {
      const response = await createVictory({
        milestoneId,
        evidenceSnippet,
        isAnonymous,
        impact,
      });

      set({ error: null });
      return response.victoryId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create victory';
      set({ error: errorMessage });
      throw error;
    }
  },

  boostVictory: async (victoryId: string) => {
    try {
      await giveCourageBoost(victoryId);
      set({ error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to give boost';
      set({ error: errorMessage });
      throw error;
    }
  },

  setFilters: (filters: CommunityFilters) => {
    set({ filters });
  },

  resetFilters: () => {
    set({ filters: initialFilters });
  },

  loadUserStats: async (userId: string) => {
    try {
      set({ statsLoading: true, error: null });
      const stats = await getUserCommunityStats(userId);
      set({ userCommunityStats: stats, statsLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load stats',
        statsLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
