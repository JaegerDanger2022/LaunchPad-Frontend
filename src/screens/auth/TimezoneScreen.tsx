import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ScrollView,
  SectionList,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/authStore';

interface TimezoneScreenProps {
  navigation: any;
  route: {
    params?: {
      email?: string;
      password?: string;
      name?: string;
      isGoogleSignUp?: boolean;
    };
  };
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

const TimezoneScreen = ({ navigation, route }: TimezoneScreenProps) => {
  const { needsOnboarding } = useAuthStore();
  const isGoogleSignUp = needsOnboarding || route.params?.isGoogleSignUp;
  const email = route.params?.email || '';
  const password = route.params?.password || '';
  const name = route.params?.name || '';

  // Auto-detect device timezone using the same method as LangGraph agent
  const getDefaultTimezone = () => {
    try {
      // Use Intl API (same as LangGraph agent expects)
      const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!deviceTimezone) return null;

      // Check if device timezone matches any of our options exactly
      const exactMatch = TIMEZONES.find(tz => tz.value === deviceTimezone);
      if (exactMatch) return deviceTimezone;

      // If no exact match, try to find a timezone in the same region
      // For example: "America/Indiana/Indianapolis" -> "America/New_York"
      const region = deviceTimezone.split('/')[0];
      const fallback = TIMEZONES.find(tz => tz.value.startsWith(region));

      return fallback ? fallback.value : null;
    } catch (error) {
      console.log('Could not detect timezone:', error);
      return null;
    }
  };

  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(getDefaultTimezone());

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Setup video player for Luna background
  const videoSource = require('../../assets/animations/ondoarding/Luna floating.mp4');
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
  });

  // Animate in when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTimezoneSelect = async (timezone: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTimezone(timezone);
  };

  const handleNext = async () => {
    if (!selectedTimezone) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('NotificationTime', {
      email,
      password,
      name,
      timezone: selectedTimezone,
      isGoogleSignUp: !!isGoogleSignUp,
    });
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const isNextDisabled = !selectedTimezone;

  return (
    <View style={styles.container}>
      {/* Video Background */}
      <VideoView
        player={player}
        style={styles.videoBackground}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
      />

      {/* Luna's Dialogue Header - Fixed at top */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        <Text style={styles.lunaDialogue}>
          What timezone are you in? I'll use this to send you timely reminders!
        </Text>
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          {/* Timezone Options */}
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
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleTimezoneSelect(item.value)}
                style={[
                  styles.timezoneOption,
                  selectedTimezone === item.value && styles.timezoneOptionSelected,
                ]}
                activeOpacity={0.7}>
                <View
                  style={[
                    styles.radioButton,
                    selectedTimezone === item.value && styles.radioButtonSelected,
                  ]}>
                  {selectedTimezone === item.value && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text
                  style={[
                    styles.timezoneLabel,
                    selectedTimezone === item.value && styles.timezoneLabelSelected,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              disabled={isNextDisabled}
              style={[
                styles.nextButton,
                isNextDisabled && styles.nextButtonDisabled,
              ]}
              activeOpacity={0.8}>
              <Text style={styles.nextButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  lunaDialogue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 34,
    fontFamily: 'InstrumentSans-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: '60%',
  },
  scrollView: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  sectionHeader: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
    fontFamily: 'InstrumentSans-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timezoneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  timezoneOptionSelected: {
    backgroundColor: '#FFF5F3',
    borderColor: '#FF5A36',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#FF5A36',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF5A36',
  },
  timezoneLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'InstrumentSans-Bold',
    flex: 1,
  },
  timezoneLabelSelected: {
    color: '#FF5A36',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    fontFamily: 'InstrumentSans-Bold',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#FF5A36',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5A36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'InstrumentSans-Bold',
  },
});

export default TimezoneScreen;
