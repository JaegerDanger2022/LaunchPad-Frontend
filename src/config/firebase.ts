import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAT4KlTIC0Kv8620yYm4ReW-FaFLX5-XoI",
  authDomain: "ghanai-462210.firebaseapp.com",
  projectId: "ghanai-462210",
  storageBucket: "ghanai-462210.firebasestorage.app",
  messagingSenderId: "74552017471",
  appId: "1:74552017471:web:13b8367e5343f262332e8a",
  measurementId: "G-7QZEP20RW0",
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export default app;
