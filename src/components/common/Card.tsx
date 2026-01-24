import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';

interface CardProps {
  children: React.ReactNode;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  shadow?: boolean;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  backgroundColor = Colors.white,
  borderRadius = 16,
  padding = 16,
  shadow = true,
  style,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderRadius,
          padding,
        },
        shadow && styles.shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shadow: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
