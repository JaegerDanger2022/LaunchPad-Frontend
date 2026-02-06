import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SectionList,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TimezonePickerModalProps {
  visible: boolean;
  currentTimezone: string | null;
  onSelect: (timezone: string) => void;
  onClose: () => void;
  theme: 'light' | 'dark';
}

// Global timezones with their IANA timezone identifiers
const TIMEZONES = [
  // North America
  { label: 'Eastern Time (ET)', value: 'America/New_York', region: 'North America' },
  { label: 'Central Time (CT)', value: 'America/Chicago', region: 'North America' },
  { label: 'Mountain Time (MT)', value: 'America/Denver', region: 'North America' },
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles', region: 'North America' },
  { label: 'Alaska Time (AKT)', value: 'America/Anchorage', region: 'North America' },
  { label: 'Hawaii Time (HT)', value: 'Pacific/Honolulu', region: 'North America' },

  // Europe
  { label: 'London (GMT/BST)', value: 'Europe/London', region: 'Europe' },
  { label: 'Paris (CET/CEST)', value: 'Europe/Paris', region: 'Europe' },
  { label: 'Berlin (CET/CEST)', value: 'Europe/Berlin', region: 'Europe' },
  { label: 'Athens (EET/EEST)', value: 'Europe/Athens', region: 'Europe' },
  { label: 'Moscow (MSK)', value: 'Europe/Moscow', region: 'Europe' },

  // Asia
  { label: 'Dubai (GST)', value: 'Asia/Dubai', region: 'Asia' },
  { label: 'Mumbai (IST)', value: 'Asia/Kolkata', region: 'Asia' },
  { label: 'Bangkok (ICT)', value: 'Asia/Bangkok', region: 'Asia' },
  { label: 'Singapore (SGT)', value: 'Asia/Singapore', region: 'Asia' },
  { label: 'Hong Kong (HKT)', value: 'Asia/Hong_Kong', region: 'Asia' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo', region: 'Asia' },
  { label: 'Seoul (KST)', value: 'Asia/Seoul', region: 'Asia' },

  // Australia & Pacific
  { label: 'Sydney (AEDT/AEST)', value: 'Australia/Sydney', region: 'Australia' },
  { label: 'Melbourne (AEDT/AEST)', value: 'Australia/Melbourne', region: 'Australia' },
  { label: 'Brisbane (AEST)', value: 'Australia/Brisbane', region: 'Australia' },
  { label: 'Auckland (NZDT/NZST)', value: 'Pacific/Auckland', region: 'Pacific' },

  // South America
  { label: 'São Paulo (BRT)', value: 'America/Sao_Paulo', region: 'South America' },
  { label: 'Buenos Aires (ART)', value: 'America/Argentina/Buenos_Aires', region: 'South America' },
  { label: 'Santiago (CLT)', value: 'America/Santiago', region: 'South America' },

  // Africa
  { label: 'Cairo (EET)', value: 'Africa/Cairo', region: 'Africa' },
  { label: 'Johannesburg (SAST)', value: 'Africa/Johannesburg', region: 'Africa' },
  { label: 'Lagos (WAT)', value: 'Africa/Lagos', region: 'Africa' },
];

export const TimezonePickerModal: React.FC<TimezonePickerModalProps> = ({
  visible,
  currentTimezone,
  onSelect,
  onClose,
  theme,
}) => {
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(currentTimezone);

  const handleSelect = async (timezone: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTimezone(timezone);
  };

  const handleConfirm = async () => {
    if (selectedTimezone) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelect(selectedTimezone);
      onClose();
    }
  };

  const isDark = theme === 'dark';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
            },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
              Select Timezone
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Timezone List */}
          <SectionList
            sections={[
              { title: 'North America', data: TIMEZONES.filter(tz => tz.region === 'North America') },
              { title: 'Europe', data: TIMEZONES.filter(tz => tz.region === 'Europe') },
              { title: 'Asia', data: TIMEZONES.filter(tz => tz.region === 'Asia') },
              { title: 'Australia', data: TIMEZONES.filter(tz => tz.region === 'Australia') },
              { title: 'Pacific', data: TIMEZONES.filter(tz => tz.region === 'Pacific') },
              { title: 'South America', data: TIMEZONES.filter(tz => tz.region === 'South America') },
              { title: 'Africa', data: TIMEZONES.filter(tz => tz.region === 'Africa') },
            ]}
            keyExtractor={(item) => item.value}
            renderSectionHeader={({ section: { title } }) => (
              <View style={[styles.sectionHeader, { backgroundColor: isDark ? '#2A2A3E' : '#F0F0F0' }]}>
                <Text style={[styles.sectionHeaderText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                  {title}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item.value)}
                style={[
                  styles.timezoneOption,
                  {
                    backgroundColor: isDark ? '#16162A' : '#F9F9F9',
                    borderColor:
                      selectedTimezone === item.value
                        ? '#FF5A36'
                        : 'transparent',
                  },
                ]}
                activeOpacity={0.7}>
                <View
                  style={[
                    styles.radioButton,
                    {
                      borderColor:
                        selectedTimezone === item.value
                          ? '#FF5A36'
                          : isDark
                          ? '#555555'
                          : '#CCCCCC',
                    },
                  ]}>
                  {selectedTimezone === item.value && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.timezoneLabel,
                    {
                      color:
                        selectedTimezone === item.value
                          ? '#FF5A36'
                          : isDark
                          ? '#FFFFFF'
                          : '#333333',
                    },
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={true}
          />

          {/* Confirm Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!selectedTimezone}
              style={[
                styles.confirmButton,
                !selectedTimezone && styles.confirmButtonDisabled,
              ]}
              activeOpacity={0.8}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: SCREEN_HEIGHT * 0.8,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'InstrumentSans-Bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666666',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'InstrumentSans-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timezoneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5A36',
  },
  timezoneLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'InstrumentSans-Bold',
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  confirmButton: {
    backgroundColor: '#FF5A36',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'InstrumentSans-Bold',
  },
});
