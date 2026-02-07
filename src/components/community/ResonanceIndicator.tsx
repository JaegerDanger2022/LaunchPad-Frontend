import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

interface ResonanceIndicatorProps {
  meTooCount: number;
  hasUserMeTooed?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

export const ResonanceIndicator: React.FC<ResonanceIndicatorProps> = ({
  meTooCount,
  hasUserMeTooed = false,
  onPress,
  size = 'medium',
  disabled = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const isSmall = size === 'small';

  // Determine resonance level based on count
  const getResonanceLevel = () => {
    if (meTooCount === 0) return 'none';
    if (meTooCount < 3) return 'low';
    if (meTooCount < 10) return 'medium';
    if (meTooCount < 25) return 'high';
    return 'intense';
  };

  const resonanceLevel = getResonanceLevel();

  // Get opacity based on resonance level
  const getGlowOpacity = () => {
    switch (resonanceLevel) {
      case 'none': return 0;
      case 'low': return 0.15;
      case 'medium': return 0.3;
      case 'high': return 0.45;
      case 'intense': return 0.6;
      default: return 0;
    }
  };

  // Get text label based on resonance
  const getResonanceText = () => {
    if (disabled) {
      // For user's own posts, show view-only resonance text
      switch (resonanceLevel) {
        case 'none': return 'No resonance yet';
        case 'low': return meTooCount === 1 ? 'Resonates' : `${meTooCount} resonate`;
        case 'medium': return 'Others relate';
        case 'high': return 'Shared victory';
        case 'intense': return 'Strong resonance';
        default: return 'No resonance yet';
      }
    }

    // For other users' posts, show interactive text
    switch (resonanceLevel) {
      case 'none': return 'Resonate';
      case 'low': return meTooCount === 1 ? 'Resonates' : 'You resonate';
      case 'medium': return 'Others relate';
      case 'high': return 'Shared victory';
      case 'intense': return 'Strong resonance';
      default: return 'Resonate';
    }
  };

  const hasResonance = resonanceLevel !== 'none';

  // Pulse animation for when there's resonance
  useEffect(() => {
    if (hasResonance) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      // Glow fade-in
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      return () => pulse.stop();
    } else {
      // Reset animations
      pulseAnim.setValue(1);
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [hasResonance]);

  const glowOpacity = getGlowOpacity();

  // Hide completely if there's no resonance
  if (meTooCount === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSmall && styles.containerSmall,
      ]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      {/* Outer glow layers (only visible with resonance) */}
      {hasResonance && (
        <>
          <Animated.View
            style={[
              styles.glowOuter,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, glowOpacity * 0.4],
                }),
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glowMiddle,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, glowOpacity * 0.6],
                }),
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        </>
      )}

      {/* Button content */}
      <View
        style={[
          styles.button,
          hasUserMeTooed && styles.buttonActive,
          hasResonance && styles.buttonResonance,
          isSmall && styles.buttonSmall,
          disabled && styles.buttonDisabled,
        ]}
      >
        <View style={styles.content}>
          <Text style={[styles.icon, isSmall && styles.iconSmall]}>
            {hasResonance ? '✨' : '👥'}
          </Text>
          <Text
            style={[
              styles.label,
              hasUserMeTooed && styles.labelActive,
              hasResonance && styles.labelResonance,
              isSmall && styles.labelSmall,
              disabled && styles.labelDisabled,
            ]}
          >
            {hasUserMeTooed && !disabled ? '✓ ' : ''}{getResonanceText()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  containerSmall: {
    // Same relative positioning for small size
  },
  // Glow layers
  glowOuter: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 22,
    backgroundColor: 'rgba(251, 191, 36, 0.3)', // Warm gold glow
    shadowColor: 'rgba(251, 191, 36, 0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  glowMiddle: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 18,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    shadowColor: 'rgba(251, 191, 36, 0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  // Button
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    zIndex: 1,
  },
  buttonActive: {
    borderColor: 'rgba(251, 191, 36, 0.4)',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
  },
  buttonResonance: {
    borderColor: 'rgba(251, 191, 36, 0.3)',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
  },
  buttonSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  buttonDisabled: {
    opacity: 0.85,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  iconSmall: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  labelActive: {
    color: 'rgba(251, 191, 36, 0.95)',
  },
  labelResonance: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  labelSmall: {
    fontSize: 12,
  },
  labelDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
