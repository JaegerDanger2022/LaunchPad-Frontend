import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface BadgeProps {
  text: string;
  backgroundColor: string;
  textColor: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  backgroundColor,
  textColor,
  style,
}) => {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: textColor,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
