import React, { useRef, useEffect, useState } from "react";
import { StyleSheet, Animated } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEventListener } from "expo";

interface AnimatedSplashScreenProps {
  isAppReady: boolean;
  onAnimationComplete: () => void;
}

const MINIMUM_DISPLAY_MS = 3000;
const SAFETY_TIMEOUT_MS = 10000;

const videoSource = require("../../assets/animations/Splash.mp4");

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  isAppReady,
  onAnimationComplete,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [minimumTimePassed, setMinimumTimePassed] = useState(false);
  const hasStartedFadeOut = useRef(false);

  const player = useVideoPlayer(videoSource, (player) => {
    player.muted = true;
    player.audioMixingMode = 'mixWithOthers';
    player.loop = true;
    player.play();
  });

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
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
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
