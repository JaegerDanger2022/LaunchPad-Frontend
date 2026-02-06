import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={['#A855F7', '#6366F1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.badge, { width, height }]}
    >
      <Image source={require('../../assets/animations/fire.gif')} style={{ width: fontSize, height: fontSize }} />
      <Text style={[styles.text, { fontSize }]}>{streakCount}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    gap: 4,
  },
  text: {
    color: Color.colorWhite,
    fontWeight: '700',
  },
});
