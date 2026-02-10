import React, { useRef, useEffect, useState } from "react";
import { StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";

interface AnimatedSplashScreenProps {
  isAppReady: boolean;
  onAnimationComplete: () => void;
}

const MINIMUM_DISPLAY_MS = 3000;
const SAFETY_TIMEOUT_MS = 10000;

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  isAppReady,
  onAnimationComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [minimumTimePassed, setMinimumTimePassed] = useState(false);
  const hasStartedFadeOut = useRef(false);

  const fadeOut = () => {
    if (hasStartedFadeOut.current) return;
    hasStartedFadeOut.current = true;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      onAnimationComplete();
    });
  };

  // Minimum display timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumTimePassed(true);
    }, MINIMUM_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Safety timeout — never show splash for more than 10 seconds
  useEffect(() => {
    const safetyTimer = setTimeout(fadeOut, SAFETY_TIMEOUT_MS);
    return () => clearTimeout(safetyTimer);
  }, []);

  // Fade out when both app is ready and minimum time has passed
  useEffect(() => {
    if (isAppReady && minimumTimePassed) {
      fadeOut();
    }
  }, [isAppReady, minimumTimePassed]);

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
      pointerEvents="none"
    >
      <LottieView
        source={require("../../assets/animations/Splash.json")}
        autoPlay
        loop
        resizeMode="cover"
        style={styles.video}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#050938",
    zIndex: 9999,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
