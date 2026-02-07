import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DreamCategory } from '../../types/community';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../constants/communityColors';

interface CategoryBadgeProps {
  category: DreamCategory;
  size?: 'small' | 'medium' | 'large';
  color?: string; // Optional override color
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'medium',
  color: overrideColor,
}) => {
  const color = overrideColor || CATEGORY_COLORS[category];
  const label = CATEGORY_LABELS[category];

  const sizeStyles = {
    small: styles.sizeSmall,
    medium: styles.sizeMedium,
    large: styles.sizeLarge,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  return (
    <View
      style={[
        styles.badge,
        sizeStyles[size],
        { backgroundColor: color },
      ]}
    >
      <Text style={[styles.text, textSizeStyles[size]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sizeMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sizeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
});
