import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';

type ChatStatus = 'rendering' | 'waiting' | 'sending';

interface LunaChatHeaderProps {
  chatStatus: ChatStatus;
  borderColor?: string;
}

const videoSource = require('../assets/animations/chatbox/Chatbox.mp4');

export const LunaChatHeader: React.FC<LunaChatHeaderProps> = ({
  chatStatus,
  borderColor = 'rgba(255,255,255,0.1)',
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const isSeeking = useRef(false);
  const chatStatusRef = useRef(chatStatus);
  chatStatusRef.current = chatStatus;

  const player = useVideoPlayer(videoSource, (player) => {
    player.muted = true;
    player.loop = false;
    player.timeUpdateEventInterval = 0.1;
    player.play();
  });

  // Handle chat status changes and jump to appropriate video segment
  useEffect(() => {
    if (!isVideoLoaded || isSeeking.current) return;

    isSeeking.current = true;
    try {
      switch (chatStatus) {
        case 'rendering':
          player.currentTime = 0;
          break;
        case 'waiting':
          player.currentTime = 5;
          break;
        case 'sending':
          player.currentTime = 11;
          break;
      }
    } catch (error) {
      console.debug('[LunaChatHeader] seek interrupted (normal during state changes)');
    } finally {
      setTimeout(() => { isSeeking.current = false; }, 100);
    }
  }, [chatStatus, isVideoLoaded]);

  // Track when video is loaded
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay' && !isVideoLoaded) {
      setIsVideoLoaded(true);
    }
  });

  // Handle playback time updates for manual looping
  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    if (isSeeking.current) return;

    try {
      switch (chatStatusRef.current) {
        case 'rendering':
          if (currentTime >= 4.5) {
            isSeeking.current = true;
            player.currentTime = 0;
            setTimeout(() => { isSeeking.current = false; }, 100);
          }
          break;
        case 'waiting':
          if (currentTime >= 9.5) {
            isSeeking.current = true;
            player.currentTime = 5;
            setTimeout(() => { isSeeking.current = false; }, 100);
          }
          break;
        case 'sending':
          if (currentTime >= 14) {
            isSeeking.current = true;
            player.currentTime = 11;
            setTimeout(() => { isSeeking.current = false; }, 100);
          }
          break;
      }
    } catch (error) {
      isSeeking.current = false;
    }
  });

  return (
    <View style={[styles.headerContainer, { borderBottomColor: borderColor }]}>
      <View style={styles.portal}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
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
