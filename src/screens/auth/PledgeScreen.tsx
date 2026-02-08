import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/authStore';

interface PledgeScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
      password: string;
      name: string;
      timezone: string;
      notificationTime?: string | null;
      isGoogleSignUp?: boolean;
    };
  };
}

const PledgeScreen = ({ navigation, route }: PledgeScreenProps) => {
  const { email, password, name, timezone, notificationTime, isGoogleSignUp } = route.params;
  const [accepted, setAccepted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signUp, completeGoogleOnboarding } = useAuthStore();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const animationFadeAnim = useRef(new Animated.Value(0)).current;

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
        duration: 600,
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

  const handleAccept = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAccepted(true);
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isGoogleSignUp) {
        // Google user already has a Firebase + MongoDB account — just save preferences
        await completeGoogleOnboarding(timezone, notificationTime);
      } else {
        // Normal email/password signup
        await signUp(email, password, name, undefined, timezone, notificationTime);
      }

      // On success, fade out pledge card and show animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowAnimation(true);

        // Fade in animation text
        Animated.timing(animationFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });

      // Auth store handles navigation automatically via onAuthStateChanged
      // Once user is created, isAuthenticated becomes true and App.tsx shows AppNavigator
    } catch (err: any) {
      console.error('Signup error:', err);
      setIsLoading(false);
      setAccepted(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // If email already in use, navigate back to signup email step
      if (err.code === 'auth/email-already-in-use') {
        navigation.navigate('Signup', {
          emailError: 'This email is already registered. Please use a different email.',
          name,
          email,
        });
        return;
      }

      setErrorMessage(err.message || 'Failed to create account. Please try again.');
    }
  };

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

      {/* Pledge Card */}
      {!showAnimation && (
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={styles.pledgeCard}>
            <Text style={styles.pledgeTitle}>One Promise</Text>

            <Text style={styles.pledgeText}>
              I recognize that every time I mark a task as 'Done' without completing it, I am training myself to ignore my own word.
            </Text>

            <Text style={[styles.pledgeText, { marginTop: 16 }]}>
              To build real confidence, I promise that I will only tap 'Done' after the work is finished.
            </Text>

            <Text style={[styles.pledgeText, { marginTop: 16, fontWeight: '700' }]}>
              I am here to build a version of myself that does what they say they're going to do.
            </Text>

            <TouchableOpacity
              onPress={handleAccept}
              disabled={isLoading}
              style={[
                styles.acceptButton,
                isLoading && styles.acceptButtonDisabled,
              ]}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.acceptButtonText}>I Accept</Text>
              )}
            </TouchableOpacity>

            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      {/* Animation Placeholder */}
      {showAnimation && (
        <Animated.View
          style={[
            styles.animationContainer,
            {
              opacity: animationFadeAnim,
            },
          ]}>
          <Text style={styles.animationText}>Do the work.</Text>
          <Text style={[styles.animationText, { marginTop: 8 }]}>Then mark it done.</Text>
          <Text style={[styles.animationText, { marginTop: 8 }]}>Never in reverse.</Text>
        </Animated.View>
      )}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pledgeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
  },
  pledgeTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'InstrumentSans-Bold',
  },
  pledgeText: {
    fontSize: 18,
    color: '#333333',
    lineHeight: 26,
    fontFamily: 'InstrumentSans-Regular',
    textAlign: 'left',
  },
  acceptButton: {
    backgroundColor: '#FF5A36',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    shadowColor: '#FF5A36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  acceptButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
  },
  acceptButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'InstrumentSans-Bold',
  },
  errorContainer: {
    marginTop: 16,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
    textAlign: 'center',
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  animationText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'InstrumentSans-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});

export default PledgeScreen;
