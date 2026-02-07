import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Color } from '../../constants/GlobalStyles';

interface StreakBadgeProps {
  streakCount: number;
  size?: 'small' | 'medium' | 'large';
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streakCount,
  size = 'medium'
}) => {
  const dimensions = {
    small: { width: 60, height: 28, fontSize: 14 },
    medium: { width: 90, height: 36, fontSize: 16 },
    large: { width: 120, height: 48, fontSize: 20 },
  };

  const { width, height, fontSize } = dimensions[size];

  return (
    <BlurView
      intensity={20}
      tint="dark"
      style={[styles.badge, { width, height }]}
    >
      <Text style={{ fontSize }}>{'\u{1F525}'}</Text>
      <Text style={[styles.text, { fontSize }]}>{streakCount}</Text>
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
    backgroundColor: 'rgba(43, 45, 86, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  text: {
    color: Color.colorWhite,
    fontWeight: '700',
  },
});
