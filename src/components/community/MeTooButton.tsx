import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface MeTooButtonProps {
  meTooCount: number;
  hasUserMeTooed?: boolean;
  onPress: () => void;
  size?: 'small' | 'medium';
}

export const MeTooButton: React.FC<MeTooButtonProps> = ({
  meTooCount,
  hasUserMeTooed = false,
  onPress,
  size = 'medium',
}) => {
  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        hasUserMeTooed && styles.buttonActive,
        isSmall && styles.buttonSmall,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.icon, isSmall && styles.iconSmall]}>👥</Text>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.count,
              hasUserMeTooed && styles.countActive,
              isSmall && styles.countSmall,
            ]}
          >
            {meTooCount}
          </Text>
          <Text
            style={[
              styles.label,
              hasUserMeTooed && styles.labelActive,
              isSmall && styles.labelSmall,
            ]}
          >
            Me Too
          </Text>
          {hasUserMeTooed && (
            <Text style={[styles.checkmark, isSmall && styles.checkmarkSmall]}>
              ✓
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonActive: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  buttonSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  countActive: {
    color: '#10B981',
  },
  countSmall: {
    fontSize: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  labelActive: {
    color: '#10B981',
  },
  labelSmall: {
    fontSize: 12,
  },
  checkmark: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 2,
  },
  checkmarkSmall: {
    fontSize: 11,
  },
});
