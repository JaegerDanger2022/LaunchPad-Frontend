import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";
import { useThemeStore } from "../../store/themeStore";
import { getThemeColors } from "../../constants/GlobalStyles";

interface SuccessAnimationOverlayProps {
  visible: boolean;
  onComplete: () => void;
  duration?: number; // Default 2000ms (2 seconds)
}

export const SuccessAnimationOverlay: React.FC<
  SuccessAnimationOverlayProps
> = ({ visible, onComplete, duration = 3000 }) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);
  const animationTriggeredRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (visible) {
      console.log("[SuccessAnimationOverlay] Animation triggered, visible:", visible);
      // Reset fade animation
      fadeAnim.setValue(0);

      // Only trigger if not already animating
      if (animationTriggeredRef.current) {
        console.log("[SuccessAnimationOverlay] Already animating, skipping");
        return;
      }

      animationTriggeredRef.current = true;
      console.log("[SuccessAnimationOverlay] Starting animation with duration:", duration);

      // Fade in overlay
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Play animation
      lottieRef.current?.play();

      // Auto-dismiss after duration
      timerRef.current = setTimeout(() => {
        console.log("[SuccessAnimationOverlay] Starting fade out");
        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          console.log("[SuccessAnimationOverlay] Fade out complete, calling onComplete");
          animationTriggeredRef.current = false;
          onCompleteRef.current();
        });
      }, duration);
    } else {
      // Reset when visible becomes false
      animationTriggeredRef.current = false;
    }

    return () => {
      // Only clear timeout if component unmounts, not on re-renders
      if (timerRef.current && !visible) {
        console.log("[SuccessAnimationOverlay] Cleaning up timer");
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, duration, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim, backgroundColor: themeColors.bg_primary }]}
      pointerEvents="none">
      <LottieView
        ref={lottieRef}
        source={require("../../assets/animations/Success.json")}
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
    backgroundColor: "transparent",
  },
  animation: {
    width: 300,
    height: 300,
  },
});
