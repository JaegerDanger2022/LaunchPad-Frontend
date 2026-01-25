import { Platform } from 'react-native';

// Google Sign-In Web Client ID (from Firebase project)
// Get this from: Firebase Console > Project Settings > Web API Key
export const GOOGLE_WEB_CLIENT_ID = "191645644567-1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j.apps.googleusercontent.com";

let GoogleSigninInitialized = false;
let GoogleSigninAvailable = false;

// Check if Google Sign-In native module is available
export const isGoogleSignInAvailable = (): boolean => {
  return GoogleSigninAvailable;
};

// Lazy initialize GoogleSignin only when needed
export const ensureGoogleSignInInitialized = async () => {
  if (GoogleSigninInitialized || Platform.OS === 'web') {
    return GoogleSigninAvailable;
  }

  try {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');

    if (!GoogleSignin) {
      console.warn('Google Sign-In module not available - app is running in Expo Go');
      GoogleSigninAvailable = false;
      GoogleSigninInitialized = true;
      return false;
    }

    // Safely configure with error handling
    if (GoogleSignin.configure) {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
      });
      GoogleSigninInitialized = true;
      GoogleSigninAvailable = true;
      console.log('Google Sign-In initialized successfully');
      return true;
    } else {
      console.warn('Google Sign-In.configure method not available');
      GoogleSigninAvailable = false;
      GoogleSigninInitialized = true;
      return false;
    }
  } catch (moduleError: any) {
    const isModuleNotAvailable =
      moduleError.message?.includes('RNGoogleSignin') ||
      moduleError.message?.includes('TurboModuleRegistry') ||
      moduleError.message?.includes('Cannot read property');

    if (isModuleNotAvailable) {
      console.warn('Google Sign-In native module not available - app is running in Expo Go. Use "expo prebuild" to build the native app.');
      GoogleSigninAvailable = false;
    } else {
      console.error('Failed to initialize Google Sign-In:', moduleError);
    }
    GoogleSigninInitialized = true;
    return false;
  }
};
