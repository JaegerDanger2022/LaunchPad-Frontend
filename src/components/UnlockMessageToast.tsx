import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeBlurView } from './SafeBlurView';
import { Color } from '../constants/GlobalStyles';

interface UnlockMessageToastProps {
  visible: boolean;
  message: string;
  onComplete: () => void;
  duration?: number;
}

export const UnlockMessageToast: React.FC<UnlockMessageToastProps> = ({
  visible,
  message,
  onComplete,
  duration = 4000,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-300)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dismissToast = () => {
    // Clear the auto-dismiss timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Animate out
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };


  useEffect(() => {
    if (visible) {
      console.log('[UnlockMessageToast] Showing toast with message:', message);
      // Slide down from top and fade in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss
      timerRef.current = setTimeout(() => {
        dismissToast();
      }, duration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [visible, duration, translateY, opacity, onComplete]);

  if (!visible) return null;

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: 20 + insets.top, transform: [{ translateY }], opacity },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={dismissToast}
        style={{ width: '100%', alignItems: 'center' }}
      >
        <SafeBlurView
          intensity={80}
          tint="dark"
          style={styles.toast}
        >
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.text} numberOfLines={3}>
            {message}
          </Text>
        </SafeBlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    backgroundColor: 'rgba(210, 120, 20, 0.95)',
    shadowColor: Color.colorBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
    maxWidth: '90%',
  },
  emoji: {
    fontSize: 24,
    marginRight: 4,
  },
  text: {
    color: Color.colorWhite,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    flexWrap: 'wrap',
  },
});
