import { create } from 'zustand';
import {
  CommunityStats,
  CommunityFilters,
  ImpactLevel,
  PermissionType,
  PermissionSlip,
} from '../types/community';
import {
  createVictory,
  giveCourageBoost,
  getUserCommunityStats,
  givePermissionSlip,
  getVictoryPermissions,
  toggleMeToo,
} from '../config/api';
import { useAuthStore } from './authStore';

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
  toggleMeToo: (victoryId: string) => Promise<{ newCount: number; added: boolean }>;
  givePermission: (victoryId: string, permissionType: PermissionType) => Promise<string>;
  loadPermissions: (victoryId: string) => Promise<PermissionSlip[]>;
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
      const userId = useAuthStore.getState().user?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      await giveCourageBoost(victoryId, userId);
      set({ error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to give boost';
      set({ error: errorMessage });
      throw error;
    }
  },

  toggleMeToo: async (victoryId: string) => {
    try {
      const userId = useAuthStore.getState().user?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const response = await toggleMeToo(victoryId, userId);
      set({ error: null });
      return { newCount: response.newMeTooCount, added: response.added };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle Me Too';
      set({ error: errorMessage });
      throw error;
    }
  },

  givePermission: async (victoryId: string, permissionType: PermissionType) => {
    try {
      const userId = useAuthStore.getState().user?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const response = await givePermissionSlip(victoryId, userId, { permissionType });
      set({ error: null });
      return response.permissionText;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to give permission';
      set({ error: errorMessage });
      throw error;
    }
  },

  loadPermissions: async (victoryId: string) => {
    try {
      const response = await getVictoryPermissions(victoryId);
      set({ error: null });
      return response.permissions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load permissions';
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
