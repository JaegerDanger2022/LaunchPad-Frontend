import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Pencil } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import { getThemeColors } from '../constants/GlobalStyles';
import { useThemeStore } from '../store/themeStore';

interface DreamChoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLuna: () => void;
  onSelectDIY: () => void;
}

export const DreamChoiceModal: React.FC<DreamChoiceModalProps> = ({
  visible,
  onClose,
  onSelectLuna,
  onSelectDIY,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';

  // Lottie animation ref
  const lottieRef = useRef<LottieView>(null);
  const isFirstPlay = useRef(true);

  // Handle animation loop - loop between frames 32-96 (2s-6s at 16fps)
  const handleAnimationFinish = () => {
    if (isFirstPlay.current) {
      isFirstPlay.current = false;
      lottieRef.current?.play(32, 96);
    } else {
      lottieRef.current?.play(32, 96);
    }
  };

  // Play/pause based on modal visibility
  useEffect(() => {
    if (visible && lottieRef.current) {
      if (isFirstPlay.current) {
        lottieRef.current.play();
      } else {
        lottieRef.current.play(32, 96);
      }
    } else if (!visible && lottieRef.current) {
      lottieRef.current.pause();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: themeColors.bg_primary,
                  marginTop: Platform.OS === 'android' ? insets.top : 0,
                  marginBottom: Platform.OS === 'android' ? insets.bottom : 0,
                },
              ]}>
              {/* Header */}
              <View style={styles.header}>
                <Text
                  style={[
                    styles.title,
                    { color: themeColors.text_primary },
                  ]}>
                  Create a Dream
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    { color: themeColors.text_secondary },
                  ]}>
                  Choose how you'd like to create your dream
                </Text>
              </View>

              {/* Choice Cards */}
              <View style={styles.choicesContainer}>
                {/* Create with Luna */}
                <TouchableOpacity
                  onPress={onSelectLuna}
                  activeOpacity={0.7}
                  style={[
                    styles.choiceCardWrapper,
                    {
                      borderColor: isDark
                        ? 'rgba(251, 99, 34, 0.3)'
                        : 'rgba(251, 99, 34, 0.2)',
                    },
                  ]}>
                  <BlurView
                    intensity={isDark ? 20 : 60}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                      styles.choiceCard,
                      {
                        backgroundColor: isDark
                          ? 'rgba(251, 99, 34, 0.15)'
                          : 'rgba(251, 99, 34, 0.1)',
                      },
                    ]}>
                    <View style={styles.iconCircle}>
                      <LottieView
                        ref={lottieRef}
                        source={require('../assets/animations/ondoarding/Luna floating.json')}
                        autoPlay
                        loop={false}
                        resizeMode="cover"
                        style={styles.lunaVideo}
                        onAnimationFinish={handleAnimationFinish}
                      />
                    </View>
                    <Text
                      style={[
                        styles.choiceTitle,
                        { color: themeColors.text_primary },
                      ]}>
                      Create with Luna
                    </Text>
                    <Text
                      style={[
                        styles.choiceDescription,
                        { color: themeColors.text_secondary },
                      ]}>
                      Have a conversation with Luna. She'll help you brainstorm and break
                      down your dream into actionable milestones.
                    </Text>
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Recommended</Text>
                    </View>
                  </BlurView>
                </TouchableOpacity>

                {/* DIY */}
                <TouchableOpacity
                  onPress={onSelectDIY}
                  activeOpacity={0.7}
                  style={[
                    styles.choiceCardWrapper,
                    {
                      borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)',
                    },
                  ]}>
                  <BlurView
                    intensity={isDark ? 20 : 60}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                      styles.choiceCard,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.03)',
                      },
                    ]}>
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: isDark
                            ? 'rgba(168, 85, 247, 0.2)'
                            : 'rgba(168, 85, 247, 0.15)',
                        },
                      ]}>
                      <Pencil size={32} color="#A855F7" strokeWidth={2} />
                    </View>
                    <Text
                      style={[
                        styles.choiceTitle,
                        { color: themeColors.text_primary },
                      ]}>
                      DIY
                    </Text>
                    <Text
                      style={[
                        styles.choiceDescription,
                        { color: themeColors.text_secondary },
                      ]}>
                      Create your dream manually by adding a title and custom
                      milestones yourself.
                    </Text>
                  </BlurView>
                </TouchableOpacity>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.cancelButton}>
                <Text
                  style={[
                    styles.cancelText,
                    { color: themeColors.text_secondary },
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 24,
  },
  header: {
    marginBottom: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'InstrumentSans-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  choicesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  choiceCardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  choiceCard: {
    padding: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  lunaVideo: {
    width: '100%',
    height: '100%',
  },
  choiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'InstrumentSans-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  choiceDescription: {
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  recommendedBadge: {
    backgroundColor: '#fb6322',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'InstrumentSans-SemiBold',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'InstrumentSans-SemiBold',
  },
});
