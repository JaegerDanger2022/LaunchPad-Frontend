import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { JourneyRecap } from '../types/community';
import { JourneyRecapCard } from '../components/community/JourneyRecapCard';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/authStore';
import { useCommunityStore } from '../store/communityStore';

interface ShareJourneyRecapScreenProps {
  onNavigate: (screen: string) => void;
  journeyRecap: JourneyRecap;
}

const ShareJourneyRecapScreen: React.FC<ShareJourneyRecapScreenProps> = ({
  onNavigate,
  journeyRecap,
}) => {
  console.log('[ShareJourneyRecapScreen] Received journeyRecap:', journeyRecap);

  const insets = useSafeAreaInsets();
  const [journeyStory, setJourneyStory] = useState('');
  const [keyMoment, setKeyMoment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { createJourneyRecapCard } = useCommunityStore();
  const { updateCouragePoints, userData } = useAuthStore();

  const handleShare = async () => {
    if (!journeyRecap) {
      console.error('[ShareJourneyRecapScreen] No journey recap data available');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Journey recap data not found',
      });
      return;
    }

    if (!journeyStory.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Story Required',
        text2: 'Please share your journey story',
      });
      return;
    }

    if (journeyStory.trim().length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Story Too Short',
        text2: 'Please write at least 10 characters',
      });
      return;
    }

    try {
      setIsSaving(true);
      console.log('[ShareJourneyRecapScreen] Creating journey recap with dreamId:', journeyRecap.dreamId);
      console.log('[ShareJourneyRecapScreen] journeyStory value:', journeyStory);
      console.log('[ShareJourneyRecapScreen] journeyStory.trim():', journeyStory.trim());
      console.log('[ShareJourneyRecapScreen] keyMoment value:', keyMoment);
      console.log('[ShareJourneyRecapScreen] isAnonymous:', isAnonymous);

      await createJourneyRecapCard(
        journeyRecap.dreamId,
        journeyStory.trim(),
        keyMoment.trim(),
        isAnonymous
      );

      // Award courage points locally (+10 for journey vs +5 for victory)
      updateCouragePoints(10);

      Toast.show({
        type: 'success',
        text1: 'Journey Shared! 🎉',
        text2: '+10 courage points earned',
        visibilityTime: 3000,
      });

      setIsSaving(false);
      onNavigate('Home');
    } catch (error: any) {
      console.error('Failed to share journey:', error);

      // Extract meaningful error message
      let errorMessage = 'Please try again';
      if (error?.message && typeof error.message === 'string' && error.message !== '[object Object]') {
        errorMessage = error.message;
      } else if (error?.detail) {
        errorMessage = error.detail;
      }

      Toast.show({
        type: 'error',
        text1: 'Failed to Share',
        text2: errorMessage,
      });
      setIsSaving(false);
    }
  };

  // Provide default values to prevent undefined errors
  const previewJourneyRecap: JourneyRecap = {
    id: journeyRecap?.id || '',
    userId: journeyRecap?.userId || '',
    userDisplayName: isAnonymous ? 'Anonymous' : (userData?.firstname || journeyRecap?.userDisplayName || 'User'),
    userLocation: isAnonymous ? undefined : (userData?.location || journeyRecap?.userLocation),
    userAge: isAnonymous ? undefined : (userData?.age || journeyRecap?.userAge),
    dreamId: journeyRecap?.dreamId || '',
    dreamTitle: journeyRecap?.dreamTitle || '',
    dreamCategory: journeyRecap?.dreamCategory || 'achievement_goals',
    journeyStory: journeyStory || 'Your journey story will appear here...',
    totalMilestones: journeyRecap?.totalMilestones || 0,
    durationDays: journeyRecap?.durationDays || 0,
    keyMoment: keyMoment || undefined,
    completedDate: journeyRecap?.completedDate || new Date().toISOString(),
    createdAt: journeyRecap?.createdAt || new Date().toISOString(),
    courageBoosts: journeyRecap?.courageBoosts || 0,
    hasUserBoosted: journeyRecap?.hasUserBoosted || false,
    permissionsCount: journeyRecap?.permissionsCount || 0,
    meTooCount: journeyRecap?.meTooCount || 0,
    hasUserMeTooed: journeyRecap?.hasUserMeTooed || false,
    isAnonymous,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => onNavigate('Home')} disabled={isSaving}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Your Journey</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={true} bounces={false}>
        {/* Celebration Message */}
        <View style={styles.celebrationSection}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>Dream Complete!</Text>
          <Text style={styles.celebrationText}>
            You completed "{journeyRecap.dreamTitle}" with {journeyRecap.totalMilestones} milestones
            {journeyRecap.durationDays === 0
              ? ' today'
              : journeyRecap.durationDays === 1
                ? ' in 1 day'
                : ` in ${journeyRecap.durationDays} days`}. Share your journey to inspire others!
          </Text>
        </View>

        {/* Preview */}
        {journeyStory.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <JourneyRecapCard journeyRecap={previewJourneyRecap} onBoost={() => {}} />
          </View>
        )}

        {/* Journey Story Input */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Your Journey Story *</Text>
            <Text style={[styles.charCounter, journeyStory.length < 10 && styles.charCounterWarning]}>
              {journeyStory.length}/500 (min 10)
            </Text>
          </View>
          <Text style={styles.helperText}>
            Reflect on your journey. What did you learn? How did it changed you?
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Example: This dream taught me that I'm capable of more than I thought. The hardest part was..."
            value={journeyStory}
            onChangeText={(text) => setJourneyStory(text.slice(0, 500))}
            multiline
            maxLength={500}
            editable={!isSaving}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Key Moment Input */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Most Memorable Moment (Optional)</Text>
            <Text style={styles.charCounter}>{keyMoment.length}/200</Text>
          </View>
          <Text style={styles.helperText}>
            What's one moment you'll never forget from this journey?
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Example: The day I realized I could actually do this..."
            value={keyMoment}
            onChangeText={(text) => setKeyMoment(text.slice(0, 200))}
            multiline
            maxLength={200}
            editable={!isSaving}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Anonymous Toggle */}
        <View style={styles.section}>
          <View style={styles.anonymousRow}>
            <Text style={styles.label}>Share Anonymously</Text>
            <Switch value={isAnonymous} onValueChange={setIsAnonymous} disabled={isSaving} />
          </View>
          <Text style={styles.helperText}>
            {isAnonymous
              ? 'Your journey will show as "Someone"'
              : 'Your name will be visible to the community'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => onNavigate('Home')}
            disabled={isSaving}
          >
            <Text style={styles.buttonSecondaryText}>Skip for Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonPrimary, isSaving && styles.buttonDisabled]}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  spacer: {
    width: 24,
  },
  celebrationSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    marginTop: 12,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#78350F',
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
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
    color: '#9CA3AF',
  },
  charCounterWarning: {
    color: '#EF4444',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
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
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  buttonPrimary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
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

export default ShareJourneyRecapScreen;
