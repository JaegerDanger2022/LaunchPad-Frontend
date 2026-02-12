import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { getThemeColors } from '../../constants/GlobalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CalendarButtonProps {
  onPress: () => void;
  hasScheduledSteps?: boolean;
}

export const CalendarButton: React.FC<CalendarButtonProps> = ({
  onPress,
  hasScheduledSteps = false
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, {
        top: insets.top + 8 + 4 // insets.top + paddingTop of container + padding of settings button
      }]}
      activeOpacity={0.7}
    >
      <Calendar size={30} color={themeColors.text_secondary} strokeWidth={2} />
      {hasScheduledSteps && (
        <View style={[styles.badge, { backgroundColor: '#10B981' }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 130, // Offset from StreakBadge (which is at right: 20)
    zIndex: 100,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
  }
});
