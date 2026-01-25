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
import * as SecureStore from 'expo-secure-store';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  signUp: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
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
        } else {
          await SecureStore.deleteItemAsync('userToken').catch(() => {});
          set({ user: null, isAuthenticated: false, loading: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        set({ loading: false });
      }
    });
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user, isAuthenticated: true, loading: false });
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
      set({ user: userCredential.user, isAuthenticated: true, loading: false });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  googleSignIn: async () => {
    try {
      set({ loading: true, error: null });

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
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign-in cancelled';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign-in in progress';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services not available';
      } else if (error.message) {
        errorMessage = error.message;
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
      set({ user: null, isAuthenticated: false, loading: false });
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
}));

// Initialize Google Sign-In
export const initializeGoogleSignIn = async (webClientId: string) => {
  try {
    GoogleSignin.configure({
      webClientId,
      offlineAccess: false,
    });
  } catch (error) {
    console.error('Failed to initialize Google Sign-In:', error);
  }
};

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
