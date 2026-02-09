import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { JourneyRecap } from '../../types/community';
import { JourneyRecapCard } from './JourneyRecapCard';
import Toast from 'react-native-toast-message';
import { useThemeStore } from '../../store/themeStore';
import { getThemeColors } from '../../constants/GlobalStyles';

interface ShareJourneyRecapModalProps {
  visible: boolean;
  journeyRecap: JourneyRecap | null;
  onClose: () => void;
  onShare: (journeyStory: string, keyMoment: string, isAnonymous: boolean) => Promise<void>;
  loading?: boolean;
}

export const ShareJourneyRecapModal: React.FC<ShareJourneyRecapModalProps> = ({
  visible,
  journeyRecap,
  onClose,
  onShare,
  loading = false,
}) => {
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);
  const isDark = theme === 'dark';

  const [journeyStory, setJourneyStory] = useState('');
  const [keyMoment, setKeyMoment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (journeyRecap && visible) {
      setJourneyStory('');
      setKeyMoment('');
      setIsAnonymous(false);
    }
  }, [journeyRecap, visible]);

  const handleShare = async () => {
    if (!journeyStory.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Story Required',
        text2: 'Please share your journey story',
      });
      return;
    }

    try {
      setIsSaving(true);
      await onShare(journeyStory.trim(), keyMoment.trim(), isAnonymous);
      setIsSaving(false);
      onClose();
    } catch (error) {
      setIsSaving(false);
      // Error toast is handled by parent
    }
  };

  if (!journeyRecap) return null;

  const previewJourneyRecap: JourneyRecap = {
    ...journeyRecap,
    journeyStory,
    keyMoment: keyMoment || undefined,
    isAnonymous,
    userDisplayName: isAnonymous ? 'Anonymous' : journeyRecap.userDisplayName,
    userLocation: isAnonymous ? undefined : journeyRecap.userLocation,
    userAge: isAnonymous ? undefined : journeyRecap.userAge,
    prefTimezone: isAnonymous ? journeyRecap.prefTimezone : undefined,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => {}}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg_primary }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={true}
          bounces={false}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.bg_secondary, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} disabled={isSaving}>
              <Text style={[styles.closeButton, { color: colors.text_secondary }]}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text_primary }]}>Share Your Journey</Text>
            <View style={styles.spacer} />
          </View>

          {/* Celebration Message */}
          <View style={[styles.celebrationSection, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#FEF3C7' }]}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={[styles.celebrationTitle, { color: isDark ? '#FCD34D' : '#78350F' }]}>Dream Complete!</Text>
            <Text style={[styles.celebrationText, { color: isDark ? '#FDE68A' : '#92400E' }]}>
              You completed "{journeyRecap.dreamTitle}" with {journeyRecap.totalMilestones} milestones
              in {journeyRecap.durationDays} days. Share your journey to inspire others!
            </Text>
          </View>

          {/* Preview */}
          {journeyStory.trim() && (
            <View style={[styles.section, { backgroundColor: colors.bg_secondary }]}>
              <Text style={[styles.sectionTitle, { color: colors.text_primary }]}>Preview</Text>
              <JourneyRecapCard journeyRecap={previewJourneyRecap} onBoost={() => {}} />
            </View>
          )}

          {/* Journey Story Input */}
          <View style={[styles.section, { backgroundColor: colors.bg_secondary }]}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text_primary }]}>Your Journey Story *</Text>
              <Text style={[styles.charCounter, { color: colors.text_secondary }]}>{journeyStory.length}/500</Text>
            </View>
            <Text style={[styles.helperText, { color: colors.text_secondary }]}>
              Reflect on your journey. What did you learn? How did it change you?
            </Text>
            <TextInput
              style={[styles.textArea, { borderColor: colors.border, color: colors.text_primary, backgroundColor: isDark ? colors.bg_primary : '#FFFFFF' }]}
              placeholder="Example: This dream taught me that I'm capable of more than I thought. The hardest part was..."
              value={journeyStory}
              onChangeText={(text) => setJourneyStory(text.slice(0, 500))}
              multiline
              maxLength={500}
              editable={!isSaving}
              placeholderTextColor={colors.text_secondary}
            />
          </View>

          {/* Key Moment Input */}
          <View style={[styles.section, { backgroundColor: colors.bg_secondary }]}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text_primary }]}>Most Memorable Moment (Optional)</Text>
              <Text style={[styles.charCounter, { color: colors.text_secondary }]}>{keyMoment.length}/200</Text>
            </View>
            <Text style={[styles.helperText, { color: colors.text_secondary }]}>
              What's one moment you'll never forget from this journey?
            </Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text_primary, backgroundColor: isDark ? colors.bg_primary : '#FFFFFF' }]}
              placeholder="Example: The day I realized I could actually do this..."
              value={keyMoment}
              onChangeText={(text) => setKeyMoment(text.slice(0, 200))}
              multiline
              maxLength={200}
              editable={!isSaving}
              placeholderTextColor={colors.text_secondary}
            />
          </View>

          {/* Anonymous Toggle */}
          <View style={[styles.section, { backgroundColor: colors.bg_secondary }]}>
            <View style={styles.anonymousRow}>
              <Text style={[styles.label, { color: colors.text_primary }]}>Share Anonymously</Text>
              <Switch value={isAnonymous} onValueChange={setIsAnonymous} disabled={isSaving} />
            </View>
            <Text style={[styles.helperText, { color: colors.text_secondary }]}>
              {isAnonymous
                ? 'Your journey will show as "Someone in {your timezone}"'
                : 'Your name will be visible to the community'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.buttonSecondary, { borderColor: colors.border, backgroundColor: isDark ? colors.bg_primary : '#FFFFFF' }]}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={[styles.buttonSecondaryText, { color: colors.text_primary }]}>Skip for Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonPrimary, { backgroundColor: isDark ? '#10B981' : '#FF8C00' }, isSaving && styles.buttonDisabled]}
              onPress={handleShare}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonPrimaryText}>Share Journey</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  spacer: {
    width: 24,
  },
  celebrationSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  charCounter: {
    fontSize: 11,
  },
  helperText: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  anonymousRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  buttonSecondary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonPrimary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
