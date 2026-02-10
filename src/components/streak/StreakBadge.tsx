import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Color } from '../../constants/GlobalStyles';
import { useThemeStore } from '../../store/themeStore';

interface StreakBadgeProps {
  streakCount: number;
  size?: 'small' | 'medium' | 'large';
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streakCount,
  size = 'medium'
}) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const dimensions = {
    small: { width: 60, height: 28, fontSize: 14 },
    medium: { width: 90, height: 36, fontSize: 16 },
    large: { width: 120, height: 48, fontSize: 20 },
  };

  const { width, height, fontSize } = dimensions[size];

  return (
    <BlurView
      intensity={isDark ? 20 : 40}
      tint={isDark ? "dark" : "light"}
      style={[
        styles.badge,
        {
          width,
          height,
          backgroundColor: isDark ? 'rgba(43, 45, 86, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      ]}
    >
      <Text style={{ fontSize }}>{'\u{1F525}'}</Text>
      <Text style={[styles.text, { fontSize, color: isDark ? Color.colorWhite : '#1F2937' }]}>{streakCount}</Text>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  text: {
    fontWeight: '700',
  },
});
