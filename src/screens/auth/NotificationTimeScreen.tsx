import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as Haptics from 'expo-haptics';

interface NotificationTimeScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
      password: string;
      name: string;
      timezone: string;
      isGoogleSignUp?: boolean;
    };
  };
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

const NotificationTimeScreen = ({ navigation, route }: NotificationTimeScreenProps) => {
  const { email, password, name, timezone, isGoogleSignUp } = route.params;

  // Default to 9:00 AM (most popular time for productivity nudges)
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [enableNotifications, setEnableNotifications] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Setup video player for Luna background
  const videoSource = require('../../assets/animations/ondoarding/Luna floating.mp4');
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
    player.audioMixingMode = 'mixWithOthers';
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

  const handleTimeSelect = async (time: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTime(time);
  };

  const handleToggleNotifications = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEnableNotifications(!enableNotifications);
  };

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Pledge', {
      email,
      password,
      name,
      timezone,
      notificationTime: enableNotifications ? selectedTime : null,
      isGoogleSignUp: !!isGoogleSignUp,
    });
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  // Group times by period
  const morningTimes = NOTIFICATION_TIMES.filter((t) => t.period === 'Morning');
  const afternoonTimes = NOTIFICATION_TIMES.filter((t) => t.period === 'Afternoon');
  const eveningTimes = NOTIFICATION_TIMES.filter((t) => t.period === 'Evening');

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
          When would you like me to send you a daily nudge?
        </Text>
        <Text style={styles.lunaSubtext}>
          I'll remind you to make progress on your dreams!
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
          {/* Enable/Disable Toggle */}
          <TouchableOpacity
            onPress={handleToggleNotifications}
            style={styles.toggleRow}
            activeOpacity={0.7}>
            <Text style={styles.toggleLabel}>Enable daily reminders</Text>
            <View
              style={[
                styles.toggleSwitch,
                enableNotifications && styles.toggleSwitchActive,
              ]}>
              <View
                style={[
                  styles.toggleKnob,
                  enableNotifications && styles.toggleKnobActive,
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Time Options */}
          {enableNotifications && (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              {/* Morning */}
              <Text style={styles.periodHeader}>Morning</Text>
              <View style={styles.timeGrid}>
                {morningTimes.map((time) => (
                  <TouchableOpacity
                    key={time.value}
                    onPress={() => handleTimeSelect(time.value)}
                    style={[
                      styles.timeButton,
                      selectedTime === time.value && styles.timeButtonSelected,
                    ]}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.timeLabel,
                        selectedTime === time.value && styles.timeLabelSelected,
                      ]}>
                      {time.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Afternoon */}
              <Text style={styles.periodHeader}>Afternoon</Text>
              <View style={styles.timeGrid}>
                {afternoonTimes.map((time) => (
                  <TouchableOpacity
                    key={time.value}
                    onPress={() => handleTimeSelect(time.value)}
                    style={[
                      styles.timeButton,
                      selectedTime === time.value && styles.timeButtonSelected,
                    ]}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.timeLabel,
                        selectedTime === time.value && styles.timeLabelSelected,
                      ]}>
                      {time.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Evening */}
              <Text style={styles.periodHeader}>Evening</Text>
              <View style={styles.timeGrid}>
                {eveningTimes.map((time) => (
                  <TouchableOpacity
                    key={time.value}
                    onPress={() => handleTimeSelect(time.value)}
                    style={[
                      styles.timeButton,
                      selectedTime === time.value && styles.timeButtonSelected,
                    ]}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.timeLabel,
                        selectedTime === time.value && styles.timeLabelSelected,
                      ]}>
                      {time.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

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
              style={styles.nextButton}
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
    marginBottom: 8,
  },
  lunaSubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'InstrumentSans-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    maxHeight: '65%',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
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
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  periodHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
    fontFamily: 'InstrumentSans-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: '30%',
    alignItems: 'center',
  },
  timeButtonSelected: {
    backgroundColor: '#FFF5F3',
    borderColor: '#FF5A36',
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'InstrumentSans-Bold',
  },
  timeLabelSelected: {
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
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'InstrumentSans-Bold',
  },
});

export default NotificationTimeScreen;
