import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type Step = {
  id: 'name' | 'email' | 'password';
  lunaDialogue: string;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'words';
  validation?: (value: string) => boolean;
  errorMessage?: string;
};

const steps: Step[] = [
  {
    id: 'name',
    lunaDialogue: "Hi! I'm Luna. What should I call you?",
    placeholder: 'Your first name',
    autoCapitalize: 'words',
    validation: (val) => val.trim().length >= 2,
    errorMessage: 'Please enter at least 2 characters',
  },
  {
    id: 'email',
    lunaDialogue: 'Nice to e-meet you {name}! Where can I send your progress reports?',
    placeholder: 'you@example.com',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    validation: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    errorMessage: 'Please enter a valid email address',
  },
  {
    id: 'password',
    lunaDialogue: "Let's keep your data safe. Pick a strong password!",
    placeholder: 'At least 6 characters',
    secureTextEntry: true,
    autoCapitalize: 'none',
    validation: (val) => val.length >= 6,
    errorMessage: 'Password must be at least 6 characters',
  },
];

const SignupScreen = ({ navigation }: any) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Setup video player for Luna background
  const videoSource = require('../../assets/animations/ondoarding/Luna floating.mp4');
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
  });

  // Animation values for fade in/out transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const currentStep = steps[currentStepIndex];
  const currentValue = formData[currentStep.id];

  // Replace {name} in Luna's dialogue
  const getLunaDialogue = () => {
    return currentStep.lunaDialogue.replace('{name}', formData.name);
  };

  // Typewriter effect for Luna's dialogue
  useEffect(() => {
    const fullText = getLunaDialogue();
    setDisplayedText('');
    let currentIndex = 0;

    // Delay before starting typewriter (only on initial mount)
    const initialDelay = currentStepIndex === 0 ? 800 : 0;

    const typewriterTimer = setTimeout(() => {
      const typingInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 30); // 30ms per character for smooth typewriter effect

      return () => clearInterval(typingInterval);
    }, initialDelay);

    return () => clearTimeout(typewriterTimer);
  }, [currentStepIndex, formData.name]);

  // Animate in when component mounts or step changes
  useEffect(() => {
    // Reset animation values
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    // Delay animation to let user see the video first (only on initial mount)
    const delay = currentStepIndex === 0 ? 800 : 0;

    const timer = setTimeout(() => {
      // Animate in
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
    }, delay);

    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  const handleNext = async () => {
    // Clear any previous errors
    setFieldError('');

    // Validate current field
    if (currentStep.validation && !currentStep.validation(currentValue)) {
      setFieldError(currentStep.errorMessage || 'Invalid input');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // If this is the last step, navigate to timezone screen
    if (currentStepIndex === steps.length - 1) {
      navigation.navigate('Timezone', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
    } else {
      // Move to next step
      setCurrentStepIndex(currentStepIndex + 1);
      // Auto-focus the next input after a short delay
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  const handleBack = async () => {
    if (currentStepIndex > 0) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStepIndex(currentStepIndex - 1);
      setFieldError('');
    }
  };

  const handleChangeText = (text: string) => {
    setFormData({ ...formData, [currentStep.id]: text });
    if (fieldError) setFieldError('');
  };

  const isNextDisabled = !currentValue.trim();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
          <Text style={styles.lunaDialogue}>{displayedText}</Text>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidView}>
          <View style={styles.content}>
            {/* Input Card */}
            <Animated.View
              style={[
                styles.inputCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}>
            {/* Step Progress Indicator */}
            <View style={styles.progressContainer}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentStepIndex && styles.progressDotActive,
                    index < currentStepIndex && styles.progressDotComplete,
                  ]}
                />
              ))}
            </View>

            {/* Input Field */}
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder={currentStep.placeholder}
                placeholderTextColor="#A0A0A0"
                value={currentValue}
                onChangeText={handleChangeText}
                keyboardType={currentStep.keyboardType || 'default'}
                autoCapitalize={currentStep.autoCapitalize || 'none'}
                secureTextEntry={currentStep.secureTextEntry && !showPassword}
                selectionColor="#FF5A36"
                returnKeyType={currentStepIndex === steps.length - 1 ? 'done' : 'next'}
                onSubmitEditing={handleNext}
              />
              {currentStep.secureTextEntry && (
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}>
                  {showPassword ? (
                    <EyeOffIcon size={22} color="#A0A0A0" />
                  ) : (
                    <EyeIcon size={22} color="#A0A0A0" />
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Error Message */}
            {fieldError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{fieldError}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {currentStepIndex > 0 && (
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                  activeOpacity={0.7}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleNext}
                disabled={isNextDisabled}
                style={[
                  styles.nextButton,
                  currentStepIndex === 0 && styles.nextButtonFullWidth,
                  isNextDisabled && styles.nextButtonDisabled,
                ]}
                activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>
                  {currentStepIndex === steps.length - 1 ? 'Continue' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLinkButton}>Log In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
    </TouchableWithoutFeedback>
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
  keyboardAvoidView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
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
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#FF5A36',
    width: 24,
  },
  progressDotComplete: {
    backgroundColor: '#4CAF50',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'InstrumentSans-Bold',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -11 }],
  },
  errorContainer: {
    marginBottom: 16,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  nextButtonFullWidth: {
    flex: 1,
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
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'InstrumentSans-Regular',
  },
  loginLinkButton: {
    fontSize: 14,
    color: '#FF5A36',
    fontWeight: '700',
    fontFamily: 'InstrumentSans-Bold',
  },
});

export default SignupScreen;
