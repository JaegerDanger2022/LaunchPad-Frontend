import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';

type ChatStatus = 'rendering' | 'waiting' | 'sending';

interface LunaChatHeaderProps {
  chatStatus: ChatStatus;
  borderColor?: string;
}

export const LunaChatHeader: React.FC<LunaChatHeaderProps> = ({
  chatStatus,
  borderColor = 'rgba(255,255,255,0.1)',
}) => {
  const videoRef = useRef<Video>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // Handle chat status changes and jump to appropriate video segment
  useEffect(() => {
    const jumpToSegment = async () => {
      if (!videoRef.current || !isVideoLoaded || isSeeking) return;

      setIsSeeking(true);
      try {
        switch (chatStatus) {
          case 'rendering':
            // AI is generating response with typewriter: loop 0s - 4.5s
            await videoRef.current.setPositionAsync(0);
            break;
          case 'waiting':
            // Waiting for user input: loop 5s - 9.5s
            await videoRef.current.setPositionAsync(5000);
            break;
          case 'sending':
            // User sent message / AI thinking: loop 11s - 14s
            await videoRef.current.setPositionAsync(11000);
            break;
        }
      } catch (error) {
        // Silently handle seeking errors - they're usually harmless
        console.debug('[LunaChatHeader] seek interrupted (normal during state changes)');
      } finally {
        // Small delay before allowing next seek
        setTimeout(() => setIsSeeking(false), 100);
      }
    };

    jumpToSegment();
  }, [chatStatus, isVideoLoaded]);

  // Handle playback status updates for manual looping
  const handlePlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded || !videoRef.current) return;

    // Track when video is loaded
    if (!isVideoLoaded) {
      setIsVideoLoaded(true);
    }

    // Don't try to loop if we're already seeking
    if (isSeeking) return;

    const positionMillis = status.positionMillis;

    try {
      switch (chatStatus) {
        case 'rendering':
          // During rendering with typewriter, loop 0s - 4.5s
          if (positionMillis >= 4500) {
            setIsSeeking(true);
            await videoRef.current.setPositionAsync(0);
            setTimeout(() => setIsSeeking(false), 100);
          }
          break;
        case 'waiting':
          // Loop 5s - 9.5s while waiting for user
          if (positionMillis >= 9500) {
            setIsSeeking(true);
            await videoRef.current.setPositionAsync(5000);
            setTimeout(() => setIsSeeking(false), 100);
          }
          break;
        case 'sending':
          // Loop 11s - 14s while user message is being processed
          if (positionMillis >= 14000) {
            setIsSeeking(true);
            await videoRef.current.setPositionAsync(11000);
            setTimeout(() => setIsSeeking(false), 100);
          }
          break;
      }
    } catch (error) {
      // Silently handle seeking errors - they're usually harmless race conditions
      setIsSeeking(false);
    }
  };

  return (
    <View style={[styles.headerContainer, { borderBottomColor: borderColor }]}>
      <View style={styles.portal}>
        <Video
          ref={videoRef}
          source={require('../assets/animations/chatbox/Chatbox.mp4')}
          style={styles.video}
          resizeMode="cover"
          isLooping={false} // Manual looping for precise control
          shouldPlay={true}
          isMuted={true}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  portal: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)', // Subtle fallback bg
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
