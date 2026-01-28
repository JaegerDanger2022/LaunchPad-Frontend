import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";

interface FireworksAnimationOverlayProps {
  visible: boolean;
  onComplete: () => void;
  duration?: number; // Default 3000ms (3 seconds)
}

export const FireworksAnimationOverlay: React.FC<
  FireworksAnimationOverlayProps
> = ({ visible, onComplete, duration = 3000 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      // Fade in overlay
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Play animation
      lottieRef.current?.play();

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onComplete();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim }]}
      pointerEvents="none">
      <LottieView
        ref={lottieRef}
        source={require("../../assets/animations/fireworks.json")}
        style={styles.animation}
        loop={false}
        speed={1}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
});
