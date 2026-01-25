import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAZOBbHCb6uYMgiyHUxAGgNGvgQ9TJQae8",
  authDomain: "dream-to-do-70d09.firebaseapp.com",
  projectId: "dream-to-do-70d09",
  storageBucket: "dream-to-do-70d09.firebasestorage.app",
  messagingSenderId: "191645644567",
  appId: "1:191645644567:web:82c9c71ef30676e24be952",
  measurementId: "G-CXCNB8090L",
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export default app;
