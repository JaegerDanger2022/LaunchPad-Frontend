import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

type ChatStatus = 'rendering' | 'waiting' | 'sending';

// Chatbox animation segments at 30fps
const ANIMATION_SEGMENTS = {
  rendering: { start: 0, end: 135 },      // 0s - 4.5s (AI typing)
  waiting: { start: 150, end: 285 },      // 5s - 9.5s (user input)
  sending: { start: 330, end: 420 },      // 11s - 14s (processing)
};

interface LunaChatHeaderProps {
  chatStatus?: ChatStatus;
  borderColor?: string;
}

export const LunaChatHeader: React.FC<LunaChatHeaderProps> = ({
  chatStatus = 'waiting',
  borderColor = 'rgba(255,255,255,0.1)',
}) => {
  const lottieRef = useRef<LottieView>(null);

  // Control Lottie animation segments based on chat status
  useEffect(() => {
    if (!lottieRef.current) return;

    const segment = ANIMATION_SEGMENTS[chatStatus];
    lottieRef.current.play(segment.start, segment.end);
  }, [chatStatus]);

  return (
    <View style={[styles.headerContainer, { borderBottomColor: borderColor }]}>
      <View style={styles.portal}>
        <LottieView
          ref={lottieRef}
          source={require('../assets/animations/chatbox/Chatbox.json')}
          loop
          resizeMode="cover"
          style={styles.video}
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
