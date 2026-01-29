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
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { ensureGoogleSignInInitialized, isGoogleSignInAvailable } from '../config/googleSignIn';
import { registerUserToDatabase, fetchUserData, UserData, updateRecents, updateUpNext as updateUpNextAPI, updateStreak as updateStreakAPI, getStreak } from '../config/api';
import { findNextIncompleteMilestone } from '../utils/upNextHelper';
import { StreakData } from '../types/index';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
  loadUserData: (userId: string) => Promise<void>;
  updateMilestoneStatusLocal: (threadId: string, milestoneId: string, status: string) => void;
  addToRecents: (threadId: string) => void;
  updateUpNext: () => void;
  updateStreakData: (streakData: StreakData) => void;
  updateCouragePoints: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  initializeAuth: () => {
    // Listen to Firebase auth state changes
    onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Store user token securely
          const token = await user.getIdToken();
          await SecureStore.setItemAsync('userToken', token);
          set({ user, isAuthenticated: true, loading: false });

          // Load user data from MongoDB
          console.log('Auth state changed - loading user data');
          const userData = await fetchUserData(user.uid);
          if (userData) {
            set({ userData });
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

        // Load user data immediately after registration
        const userData = await fetchUserData(userCredential.user.uid);
        set({ user: userCredential.user, userData, isAuthenticated: true, loading: false });
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

      // Load user data from MongoDB
      const userData = await fetchUserData(userCredential.user.uid);
      set({ user: userCredential.user, userData, isAuthenticated: true, loading: false });
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
        set({ user: userCredential.user, isAuthenticated: true, loading: false });
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

  clearError: () => set({ error: null }),

  loadUserData: async (userId: string) => {
    try {
      // console.log('[loadUserData] Loading user data for:', userId);
      const userData = await fetchUserData(userId);
      if (userData) {
        // console.log('[loadUserData] Fetched userData, up_next:', userData.up_next);
        set({ userData });
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

      return { userData: updatedUserData };
    });
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
