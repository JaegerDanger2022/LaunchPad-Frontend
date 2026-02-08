import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEventListener } from "expo";

interface DreamCompleteVideoOverlayProps {
  visible: boolean;
  onComplete: () => void;
  duration?: number; // Optional duration override (uses video length by default)
}

const videoSource = require("../../assets/animations/FinalCelebration.mp4");

export const DreamCompleteVideoOverlay: React.FC<
  DreamCompleteVideoOverlayProps
> = ({ visible, onComplete, duration }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [hasPlayed, setHasPlayed] = useState(false);
  const hasCalledComplete = useRef(false);

  const player = useVideoPlayer(videoSource, (player) => {
    player.muted = false;
    player.audioMixingMode = 'mixWithOthers';
    player.loop = false;
  });

  useEffect(() => {
    if (visible && !hasPlayed) {
      // Reset completion flag when becoming visible
      hasCalledComplete.current = false;

      // Show overlay immediately (no fade in to avoid stutter)
      fadeAnim.setValue(1);

      // Play video from beginning
      player.currentTime = 0;
      player.play();
      setHasPlayed(true);
    }
  }, [visible, hasPlayed]);

  // Detect when video finishes playing
  useEventListener(player, 'playToEnd', () => {
    if (!hasCalledComplete.current) {
      hasCalledComplete.current = true;

      // Small delay then call onComplete
      setTimeout(() => {
        setHasPlayed(false); // Reset for next time
        onComplete();
      }, 200);
    }
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim }]}
      pointerEvents="none">
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
