import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";

interface DreamCompleteVideoOverlayProps {
  visible: boolean;
  onComplete: () => void;
  duration?: number; // Optional duration override (uses video length by default)
}

export const DreamCompleteVideoOverlay: React.FC<
  DreamCompleteVideoOverlayProps
> = ({ visible, onComplete, duration }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<Video>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const hasCalledComplete = useRef(false);

  useEffect(() => {
    if (visible && !hasPlayed) {
      // Reset completion flag when becoming visible
      hasCalledComplete.current = false;

      // Show overlay immediately (no fade in to avoid stutter)
      fadeAnim.setValue(1);

      // Load and play video from beginning
      const playVideo = async () => {
        try {
          await videoRef.current?.setPositionAsync(0);
          await videoRef.current?.playAsync();
          setHasPlayed(true);
        } catch (error) {
          console.error("Error playing video:", error);
        }
      };

      playVideo();
    }
  }, [visible, hasPlayed]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    // When video finishes playing, dismiss the overlay
    if (status.didJustFinish && !hasCalledComplete.current) {
      hasCalledComplete.current = true;

      // Small delay then call onComplete
      setTimeout(() => {
        setHasPlayed(false); // Reset for next time
        onComplete();
      }, 200);
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim }]}
      pointerEvents="none">
      <Video
        ref={videoRef}
        source={require("../../assets/animations/FinalCelebration.mp4")}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false} // Manual control via playAsync
        isLooping={false}
        isMuted={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
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
