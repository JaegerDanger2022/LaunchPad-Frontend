import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useThemeStore } from '../../store/themeStore';

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
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.2)',
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
        },
        hasUserMeTooed && {
          borderColor: 'rgba(16, 185, 129, 0.5)',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
        },
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
              {
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              },
              hasUserMeTooed && styles.countActive,
              isSmall && styles.countSmall,
            ]}
          >
            {meTooCount}
          </Text>
          <Text
            style={[
              styles.label,
              {
                color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
              },
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
    // borderColor and backgroundColor are now dynamic
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
    // color is now dynamic
  },
  countActive: {
    color: '#10B981',
    fontWeight: '700',
  },
  countSmall: {
    fontSize: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    // color is now dynamic
  },
  labelActive: {
    color: '#10B981',
    fontWeight: '700',
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
