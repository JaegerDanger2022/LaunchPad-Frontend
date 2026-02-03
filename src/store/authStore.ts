import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithCredential,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { ensureGoogleSignInInitialized, isGoogleSignInAvailable } from '../config/googleSignIn';
import { registerUserToDatabase, fetchUserData, UserData, updateRecents, updateUpNext as updateUpNextAPI, updateStreak as updateStreakAPI, getStreak, FetchUserDataOptions, fetchDreamDetails } from '../config/api';
import { findNextIncompleteMilestone } from '../utils/upNextHelper';
import { StreakData } from '../types/index';
import * as SecureStore from 'expo-secure-store';
import { identifyRevenueCatUser, logoutRevenueCatUser, checkEntitlement } from '../config/revenuecat';

const ENTITLEMENT_ID = 'entl8ae0503ddb';

/**
 * Maps dreams_summary to dreams format for backward compatibility.
 * After migration, backend returns dreams_summary (lightweight) instead of full dreams array.
 * This helper ensures existing components continue to work without changes.
 */
const mapDreamsSummaryToDreams = (userData: UserData): UserData => {
  // If we have dreams_summary but no dreams array, map it
  if (userData.dreams_summary && !userData.dreams) {
    userData.dreams = userData.dreams_summary.map((summary: any) => ({
      thread_id: summary.thread_id,
      dream: summary.dream,
      status: summary.status,
      dream_image_bytes: summary.dream_image_bytes, // Already base64 from backend
      dream_card_bg: summary.dream_card_bg, // Card background color
      category: summary.category,
      created_at: summary.created_at,
      updated_at: summary.updated_at,
      isComplete: summary.isComplete,
      // Add placeholder roadmap structure with milestone counts
      roadmap: {
        status: summary.status,
        milestones: [] // Empty array - full data loaded separately when needed
      },
      // Add milestone count metadata for UI display
      _metadata: {
        milestones_count: summary.milestones_count,
        completed_milestones_count: summary.completed_milestones_count,
      }
    }));
  }
  return userData;
};

interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isPremium: boolean;

  // Actions
  refreshPremiumStatus: () => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
  loadUserData: (userId: string, options?: FetchUserDataOptions) => Promise<void>;
  updateMilestoneStatusLocal: (threadId: string, milestoneId: string, status: string) => void;
  addToRecents: (threadId: string) => void;
  updateUpNext: () => void;
  updateStreakData: (streakData: StreakData) => void;
  updateCouragePoints: (amount: number) => void;
  loadFullDreams: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  isPremium: false,

  refreshPremiumStatus: async () => {
    const active = await checkEntitlement(ENTITLEMENT_ID);
    set({ isPremium: active });
  },

  initializeAuth: () => {
    // Listen to Firebase auth state changes
    onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Store user token securely
          const token = await user.getIdToken();
          await SecureStore.setItemAsync('userToken', token);
          set({ user, isAuthenticated: true });

          // Identify user in RevenueCat and check entitlement
          try {
            await identifyRevenueCatUser(user.uid);
            await useAuthStore.getState().refreshPremiumStatus();
          } catch (error) {
            console.error('[Auth] RevenueCat identification error:', error);
            // Don't block auth flow on RevenueCat error
          }

          // Load user data from MongoDB - use 'essential' fields for faster initial load
          console.log('Auth state changed - loading user data (essential fields only)');
          const userData = await fetchUserData(user.uid, { fields: 'essential' });
          if (userData) {
            const mappedData = mapDreamsSummaryToDreams(userData);
            set({ userData: mappedData, loading: false });
            // Fire-and-forget: fetch full milestones for each dream into Zustand
            useAuthStore.getState().loadFullDreams(user.uid);
          } else {
            set({ loading: false });
          }
        } else {
          await SecureStore.deleteItemAsync('userToken').catch(() => {});
          set({ user: null, userData: null, isAuthenticated: false, loading: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        set({ loading: false });
      }
    });
  },

  signUp: async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Register user to MongoDB
      if (userCredential.user) {
        await registerUserToDatabase({
          user_id: userCredential.user.uid,
          firstname: firstName,
          lastname: lastName,
          email,
        });

        // Identify user in RevenueCat
        try {
          await identifyRevenueCatUser(userCredential.user.uid);
        } catch (error) {
          console.error('[SignUp] RevenueCat identification error:', error);
          // Don't block signup flow on RevenueCat error
        }

        // Load user data immediately after registration - use 'essential' fields
        const userData = await fetchUserData(userCredential.user.uid, { fields: 'essential' });
        const mappedData = mapDreamsSummaryToDreams(userData);
        set({ user: userCredential.user, userData: mappedData, isAuthenticated: true, loading: false });
      } else {
        set({ user: userCredential.user, isAuthenticated: true, loading: false });
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Identify user in RevenueCat
      try {
        await identifyRevenueCatUser(userCredential.user.uid);
      } catch (error) {
        console.error('[Login] RevenueCat identification error:', error);
        // Don't block login flow on RevenueCat error
      }

      // Load user data from MongoDB - use 'essential' fields for faster login
      const userData = await fetchUserData(userCredential.user.uid, { fields: 'essential' });
      const mappedData = mapDreamsSummaryToDreams(userData);
      set({ user: userCredential.user, userData: mappedData, isAuthenticated: true, loading: false });
      useAuthStore.getState().loadFullDreams(userCredential.user.uid);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  googleSignIn: async () => {
    try {
      set({ loading: true, error: null });

      // Check if Google Sign-In module is available
      const isAvailable = await ensureGoogleSignInInitialized();

      if (!isAvailable) {
        throw new Error('Google Sign-In is not available in this environment. Please build the app with: expo prebuild && npm run build:ios/android');
      }

      // Dynamically import Google Sign-In to handle Expo Go environments
      const { GoogleSignin, statusCodes } = await import('@react-native-google-signin/google-signin');

      // Ensure Google Sign-In is configured
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data?.idToken) {
        const credential = GoogleAuthProvider.credential(userInfo.data.idToken);
        const userCredential = await signInWithCredential(auth, credential);

        // Identify user in RevenueCat
        try {
          await identifyRevenueCatUser(userCredential.user.uid);
        } catch (error) {
          console.error('[GoogleSignIn] RevenueCat identification error:', error);
          // Don't block login flow on RevenueCat error
        }

        // Load user data from MongoDB - use 'essential' fields for faster login
        const userData = await fetchUserData(userCredential.user.uid, { fields: 'essential' });
        const mappedData = mapDreamsSummaryToDreams(userData);
        set({ user: userCredential.user, userData: mappedData, isAuthenticated: true, loading: false });
        useAuthStore.getState().loadFullDreams(userCredential.user.uid);
      } else {
        throw new Error('No ID token from Google Sign-In');
      }
    } catch (error: any) {
      let errorMessage = 'Google Sign-In failed';

      // Import statusCodes for error checking
      try {
        const { statusCodes } = await import('@react-native-google-signin/google-signin');
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          errorMessage = 'Sign-in cancelled';
        } else if (error.code === statusCodes.IN_PROGRESS) {
          errorMessage = 'Sign-in in progress';
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          errorMessage = 'Google Play Services not available';
        } else if (error.message?.includes('not available')) {
          errorMessage = error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch {
        if (error.message?.includes('not available')) {
          errorMessage = error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ loading: true });

      // Logout from RevenueCat
      try {
        await logoutRevenueCatUser();
      } catch (error) {
        console.error('[Logout] RevenueCat logout error:', error);
        // Don't block logout flow on RevenueCat error
      }

      await signOut(auth);
      await SecureStore.deleteItemAsync('userToken').catch(() => {});
      set({ user: null, userData: null, isAuthenticated: false, loading: false });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });
      await sendPasswordResetEmail(auth, email);
      set({ loading: false });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      set({ loading: true, error: null });

      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No user is currently signed in');
      }

      // Re-authenticate user with current password before changing password
      // This is a security requirement from Firebase
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update to new password
      await updatePassword(user, newPassword);

      set({ loading: false });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  loadUserData: async (userId: string, options?: FetchUserDataOptions) => {
    try {
      // Default to 'essential' for performance, but allow override
      const fetchOptions = options || { fields: 'essential' };
      // console.log('[loadUserData] Loading user data for:', userId);
      const userData = await fetchUserData(userId, fetchOptions);
      if (userData) {
        // console.log('[loadUserData] Fetched userData, up_next:', userData.up_next);
        const mappedData = mapDreamsSummaryToDreams(userData);
        set({ userData: mappedData });
        // console.log('[loadUserData] User data loaded successfully, state updated');

        // Auto-recalculate streak to catch any missed days
        console.log('[loadUserData] Auto-recalculating streak for:', userId);
        const streakResponse = await getStreak(userId);
        if (streakResponse.success && streakResponse.streak_data) {
          console.log('[loadUserData] Streak recalculated:', streakResponse);
          if (streakResponse.recalculated) {
            console.log('[loadUserData] Streak was recalculated due to time passage');
          }
          if (streakResponse.streak_broken) {
            console.log('[loadUserData] Streak was broken due to missed days');
          }
          // Update the streak data in state
          set((state) => {
            if (!state.userData) return state;
            const updatedUserData = JSON.parse(JSON.stringify(state.userData));
            updatedUserData.streak = streakResponse.streak_data;
            return { userData: updatedUserData };
          });
        }

        // Re-fetch full milestones — loadUserData replaces userData with summary,
        // so milestones need to be patched back in.
        useAuthStore.getState().loadFullDreams(userId);
      } else {
        // console.warn('[loadUserData] No user data found for:', userId);
      }
    } catch (error) {
      // console.error('[loadUserData] Error loading user data:', error);
      // Don't set error state - this is not critical for app functionality
    }
  },

  updateMilestoneStatusLocal: (threadId: string, milestoneId: string, status: string) => {
    set((state) => {
      if (!state.userData?.dreams) return state;

      // Create a deep copy of userData to avoid mutations
      const updatedUserData = JSON.parse(JSON.stringify(state.userData));

      // Find and update the milestone with matching threadId and milestoneId
      for (const dream of updatedUserData.dreams) {
        if (dream.thread_id === threadId && dream.roadmap?.milestones) {
          const milestone = dream.roadmap.milestones.find(
            (m: any) => m.id === milestoneId
          );
          if (milestone) {
            milestone.status = status;
            console.log(`Updated milestone ${milestoneId} status to ${status}`);
            break;
          }
        }
      }

      return { userData: updatedUserData };
    });

    // If milestone was completed, recalculate up_next
    if (status === 'completed') {
      setTimeout(() => {
        useAuthStore.getState().updateUpNext();
      }, 0);
    }
  },

  addToRecents: (threadId: string) => {
    set((state) => {
      if (!state.userData?.dreams || !state.user?.uid) return state;

      // Find the dream with the matching threadId
      const dreamToAdd = state.userData.dreams.find(
        (dream: any) => dream.thread_id === threadId
      );

      if (!dreamToAdd || dreamToAdd.status !== 'active') {
        return state;
      }

      // Create a deep copy of userData
      const updatedUserData = JSON.parse(JSON.stringify(state.userData));

      // Initialize recents array if it doesn't exist
      if (!updatedUserData.recents) {
        updatedUserData.recents = [];
      }

      // Remove threadId if it already exists (to avoid duplicates)
      updatedUserData.recents = updatedUserData.recents.filter(
        (id: string) => id !== threadId
      );

      // Add threadId to the beginning of recents
      updatedUserData.recents.unshift(threadId);

      // Keep only the last 3 items
      updatedUserData.recents = updatedUserData.recents.slice(0, 3);

      // Call API to persist to database (fire and forget - don't block UI)
      updateRecents(state.user.uid, threadId).catch((error) => {
        console.error('Failed to sync recents to database:', error);
      });

      return { userData: updatedUserData };
    });

    // Recalculate up_next since recents priority changed
    setTimeout(() => {
      useAuthStore.getState().updateUpNext();
    }, 0);
  },

  updateUpNext: () => {
    set((state) => {
      if (!state.userData || !state.user?.uid) return state;

      // Calculate next incomplete milestone
      const upNext = findNextIncompleteMilestone(state.userData);
      // console.log('[updateUpNext] Calculated upNext:', upNext);

      // Create a deep copy of userData
      const updatedUserData = JSON.parse(JSON.stringify(state.userData));

      // Update up_next field
      updatedUserData.up_next = upNext;
      // console.log('[updateUpNext] Updated userData.up_next to:', updatedUserData.up_next);

      // Call API to persist to database (fire and forget - don't block UI)
      updateUpNextAPI(state.user.uid, upNext).catch((error) => {
        // console.error('[updateUpNext] Failed to sync up_next to database:', error);
      });

      return { userData: updatedUserData };
    });
  },

  updateStreakData: (streakData: StreakData) => {
    set((state) => {
      if (!state.userData) return state;

      // Deep copy to avoid mutations
      const updatedUserData = JSON.parse(JSON.stringify(state.userData));
      updatedUserData.streak = streakData;
      updatedUserData.last_activity = new Date().toISOString();

      return { userData: updatedUserData };
    });

    // Update notification store with last activity
    // Import is done dynamically to avoid circular dependencies
    setTimeout(() => {
      try {
        const { useNotificationStore } = require('./notificationStore');
        useNotificationStore.getState().updateLastActivity();
      } catch (error) {
        console.error('[AuthStore] Failed to update notification store:', error);
      }
    }, 0);
  },

  updateCouragePoints: (amount: number) => {
    set((state) => {
      if (!state.userData) return state;

      // Deep copy to avoid mutations
      const updatedUserData = JSON.parse(JSON.stringify(state.userData));
      updatedUserData.couragePoints = (updatedUserData.couragePoints || 0) + amount;

      return { userData: updatedUserData };
    });
  },

  // Fetch full roadmap+milestones for every dream and merge into userData.dreams in Zustand.
  // Called fire-and-forget after initial load so the app renders instantly from summary,
  // then milestones appear as each fetch resolves.
  loadFullDreams: async (userId: string) => {
    // Collect thread_ids to fetch from a fresh snapshot
    const threadIds = useAuthStore.getState().userData?.dreams
      ?.map((d: any) => d.thread_id)
      .filter(Boolean) ?? [];

    if (threadIds.length === 0) return;

    for (const threadId of threadIds) {
      // Re-read current state each iteration — a previous set() or loadUserData
      // may have replaced userData; skip if milestones are already populated
      const currentDream = useAuthStore.getState().userData?.dreams
        ?.find((d: any) => d.thread_id === threadId);
      if (!currentDream) continue;
      if (currentDream.roadmap?.milestones && currentDream.roadmap.milestones.length > 0) continue;

      try {
        const fullDream = await fetchDreamDetails(userId, threadId);
        if (fullDream?.roadmap?.milestones) {
          set((prev) => {
            if (!prev.userData?.dreams) return prev;
            const updated = JSON.parse(JSON.stringify(prev.userData));
            const target = updated.dreams.find((d: any) => d.thread_id === threadId);
            if (target) {
              target.roadmap = fullDream.roadmap;
              target.metadata = fullDream.metadata;
            }
            return { userData: updated };
          });
        }
      } catch (e) {
        console.error('[loadFullDreams] Failed to fetch dream', threadId, e);
      }
    }
  },
}));

// Export availability checker for UI
export const checkGoogleSignInAvailable = isGoogleSignInAvailable;

// Helper function to convert Firebase error codes to user-friendly messages
export const getErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many login attempts. Please try again later';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled';
    default:
      return 'An error occurred. Please try again';
  }
};
