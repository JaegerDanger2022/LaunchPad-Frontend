import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
} from 'react-native';

interface CourageBoostButtonProps {
  boostCount: number;
  hasUserBoosted?: boolean;
  onPress: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

export const CourageBoostButton: React.FC<CourageBoostButtonProps> = ({
  boostCount,
  hasUserBoosted = false,
  onPress,
  disabled = false,
  size = 'medium',
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePress = () => {
    if (disabled || hasUserBoosted) return;

    // Animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const sizeStyles = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          sizeStyles[size],
          hasUserBoosted && styles.buttonBoosted,
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled || hasUserBoosted}
        activeOpacity={0.7}
      >
        <Text style={[styles.icon, textSizeStyles[size]]}>⚡</Text>
        <Text
          style={[
            styles.text,
            textSizeStyles[size],
            hasUserBoosted && styles.textBoosted,
          ]}
        >
          {boostCount}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sizeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sizeMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonBoosted: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  textBoosted: {
    color: '#F59E0B',
  },
});
