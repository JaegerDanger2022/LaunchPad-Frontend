import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeBlurView } from '../SafeBlurView';
import { getThemeColors } from '../../constants/GlobalStyles';

interface NotificationTimePickerModalProps {
  visible: boolean;
  currentTime: string | null;
  currentEnabled: boolean;
  onSelect: (time: string | null, enabled: boolean) => void;
  onClose: () => void;
  theme: 'light' | 'dark';
}

// Time options for daily notifications (24-hour format)
const NOTIFICATION_TIMES = [
  { label: '6:00 AM', value: '06:00', period: 'Morning' },
  { label: '7:00 AM', value: '07:00', period: 'Morning' },
  { label: '8:00 AM', value: '08:00', period: 'Morning' },
  { label: '9:00 AM', value: '09:00', period: 'Morning' },
  { label: '10:00 AM', value: '10:00', period: 'Morning' },
  { label: '12:00 PM', value: '12:00', period: 'Afternoon' },
  { label: '1:00 PM', value: '13:00', period: 'Afternoon' },
  { label: '2:00 PM', value: '14:00', period: 'Afternoon' },
  { label: '3:00 PM', value: '15:00', period: 'Afternoon' },
  { label: '4:00 PM', value: '16:00', period: 'Afternoon' },
  { label: '5:00 PM', value: '17:00', period: 'Afternoon' },
  { label: '6:00 PM', value: '18:00', period: 'Evening' },
  { label: '7:00 PM', value: '19:00', period: 'Evening' },
  { label: '8:00 PM', value: '20:00', period: 'Evening' },
  { label: '9:00 PM', value: '21:00', period: 'Evening' },
];

export const NotificationTimePickerModal: React.FC<NotificationTimePickerModalProps> = ({
  visible,
  currentTime,
  currentEnabled,
  onSelect,
  onClose,
  theme,
}) => {
  const themeColors = getThemeColors(theme);
  const [enabled, setEnabled] = useState(currentEnabled);
  const [selectedTime, setSelectedTime] = useState(currentTime || '09:00');

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    onSelect(newEnabled ? selectedTime : null, newEnabled);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (enabled) {
      onSelect(time, true);
    }
  };

  const morningTimes = NOTIFICATION_TIMES.filter((t) => t.period === 'Morning');
  const afternoonTimes = NOTIFICATION_TIMES.filter((t) => t.period === 'Afternoon');
  const eveningTimes = NOTIFICATION_TIMES.filter((t) => t.period === 'Evening');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: themeColors.bg_secondary },
          ]}>
          <Text style={[styles.title, { color: themeColors.text_primary }]}>
            Daily Notifications
          </Text>

          {/* Enable/Disable Toggle */}
          <TouchableOpacity
            onPress={handleToggle}
            style={styles.toggleRow}
            activeOpacity={0.7}>
            <Text style={[styles.toggleLabel, { color: themeColors.text_primary }]}>
              Enable daily reminders
            </Text>
            <View
              style={[
                styles.toggleSwitch,
                enabled && styles.toggleSwitchActive,
              ]}>
              <View
                style={[
                  styles.toggleKnob,
                  enabled && styles.toggleKnobActive,
                ]}
              />
            </View>
          </TouchableOpacity>

          {enabled && (
            <>
              <Text style={[styles.subtitle, { color: themeColors.text_secondary }]}>
                When should we remind you?
              </Text>

              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                {/* Morning */}
                <Text style={[styles.periodHeader, { color: themeColors.text_tertiary }]}>
                  Morning
                </Text>
                <View style={styles.timeGrid}>
                  {morningTimes.map((time) => (
                    <TouchableOpacity
                      key={time.value}
                      onPress={() => handleTimeSelect(time.value)}
                      style={[
                        styles.timeButton,
                        { borderColor: themeColors.border },
                        selectedTime === time.value && styles.timeButtonSelected,
                      ]}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.timeLabel,
                          { color: themeColors.text_primary },
                          selectedTime === time.value && styles.timeLabelSelected,
                        ]}>
                        {time.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Afternoon */}
                <Text style={[styles.periodHeader, { color: themeColors.text_tertiary }]}>
                  Afternoon
                </Text>
                <View style={styles.timeGrid}>
                  {afternoonTimes.map((time) => (
                    <TouchableOpacity
                      key={time.value}
                      onPress={() => handleTimeSelect(time.value)}
                      style={[
                        styles.timeButton,
                        { borderColor: themeColors.border },
                        selectedTime === time.value && styles.timeButtonSelected,
                      ]}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.timeLabel,
                          { color: themeColors.text_primary },
                          selectedTime === time.value && styles.timeLabelSelected,
                        ]}>
                        {time.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Evening */}
                <Text style={[styles.periodHeader, { color: themeColors.text_tertiary }]}>
                  Evening
                </Text>
                <View style={styles.timeGrid}>
                  {eveningTimes.map((time) => (
                    <TouchableOpacity
                      key={time.value}
                      onPress={() => handleTimeSelect(time.value)}
                      style={[
                        styles.timeButton,
                        { borderColor: themeColors.border },
                        selectedTime === time.value && styles.timeButtonSelected,
                      ]}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.timeLabel,
                          { color: themeColors.text_primary },
                          selectedTime === time.value && styles.timeLabelSelected,
                        ]}>
                        {time.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.8}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '75%',
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'InstrumentSans-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'InstrumentSans-Regular',
    marginBottom: 16,
    marginTop: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'InstrumentSans-Bold',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CCCCCC',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#4CAF50',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  scrollView: {
    maxHeight: 300,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  periodHeader: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'InstrumentSans-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    minWidth: '30%',
    alignItems: 'center',
  },
  timeButtonSelected: {
    backgroundColor: 'rgba(255, 90, 54, 0.15)',
    borderColor: '#FF5A36',
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'InstrumentSans-Bold',
  },
  timeLabelSelected: {
    color: '#FF5A36',
  },
  closeButton: {
    backgroundColor: '#FF5A36',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'InstrumentSans-Bold',
  },
});
