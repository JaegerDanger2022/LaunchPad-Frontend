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
import { registerUserToDatabase, fetchUserData, UserData } from '../config/api';
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
      console.log('Loading user data for:', userId);
      const userData = await fetchUserData(userId);
      if (userData) {
        set({ userData });
        console.log('User data loaded successfully');
      } else {
        console.warn('No user data found for:', userId);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Don't set error state - this is not critical for app functionality
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
