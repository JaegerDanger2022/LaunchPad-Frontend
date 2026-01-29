import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { getThemeColors } from '../../constants/GlobalStyles';

interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  icon?: string;
  showArrow?: boolean;
  renderRight?: React.ReactNode;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

export const SettingRow: React.FC<SettingRowProps> = ({
  label,
  value,
  onPress,
  icon,
  showArrow = false,
  renderRight,
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  const content = (
    <View style={[styles.row, { borderBottomColor: themeColors.border }]}>
      <View style={styles.leftSection}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: themeColors.text_primary }]}>
            {label}
          </Text>
          {value && (
            <Text style={[styles.value, { color: themeColors.text_secondary }]}>
              {value}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {isSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#767577', true: '#fb6322' }}
            thumbColor={switchValue ? '#f4f3f4' : '#f4f3f4'}
          />
        )}
        {renderRight}
        {showArrow && (
          <Text style={[styles.arrow, { color: themeColors.text_secondary }]}>
            →
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: 'InstrumentSans-Medium',
    fontWeight: '600',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrow: {
    fontSize: 18,
    fontFamily: 'InstrumentSans-Regular',
  },
});
