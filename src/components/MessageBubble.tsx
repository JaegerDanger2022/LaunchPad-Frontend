import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

export interface MessageBubbleProps {
  role: 'user' | 'mascot';
  text: string;
  theme?: 'light' | 'dark';
  mascotVideoSource?: any; // For the mascot avatar animation (Lottie JSON)
  videoStyle?: ViewStyle;
  onVideoLoad?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  text,
  theme = 'dark',
  mascotVideoSource,
  videoStyle,
  onVideoLoad,
}) => {
  const isDark = theme === 'dark';
  const isMascot = role === 'mascot';

  // Theme-aware colors
  const colors = {
    blurTint: isDark ? 'dark' : 'light',
    blurIntensity: isDark ? 40 : 80,
    textColor: isDark ? '#ffffff' : '#1F2937',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    userBubbleBg: isDark ? 'rgba(43, 45, 86, 0.85)' : 'rgba(255, 255, 255, 0.85)',
  };

  // Gradient colors for mascot messages
  const mascotGradientColors = isDark
    ? ['rgba(251, 99, 34, 0.9)', 'rgba(247, 153, 113, 0.9)'] // Soft orange to gold with transparency
    : ['#fb6322', '#f79971']; // Vibrant gradient for light mode

  // Asymmetric border radius
  const bubbleRadius = isMascot
    ? {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 4, // Sharp corner for mascot (right)
      }
    : {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 4, // Sharp corner for user (left)
        borderBottomRightRadius: 20,
      };

  // Container alignment
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignSelf: isMascot ? 'flex-start' : 'flex-end',
    maxWidth: '85%',
    marginBottom: 12,
    alignItems: 'flex-end',
  };

  // Render mascot avatar slot
  const renderMascotAvatar = () => {
    if (!isMascot) return null;

    return (
      <View style={styles.avatarSlot}>
        {mascotVideoSource ? (
          <LottieView
            source={mascotVideoSource}
            autoPlay
            loop
            resizeMode="cover"
            style={[styles.avatarVideo, videoStyle]}
            onAnimationLoaded={onVideoLoad}
          />
        ) : (
          // Fallback placeholder
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>🌙</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={containerStyle}>
      {/* Mascot avatar on the left */}
      {isMascot && renderMascotAvatar()}

      {/* Message bubble */}
      <View
        style={[
          styles.bubbleWrapper,
          bubbleRadius,
          {
            borderWidth: 1,
            borderColor: colors.borderColor,
            overflow: 'hidden',
          },
        ]}>
        {isMascot ? (
          // Mascot message: LinearGradient with glassmorphism overlay
          <>
            <LinearGradient
              colors={mascotGradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <BlurView
              intensity={colors.blurIntensity}
              tint={colors.blurTint}
              style={[styles.glassOverlay, styles.bubbleContent]}>
              <Text style={[styles.messageText, { color: colors.textColor }]}>
                {text}
              </Text>
            </BlurView>
          </>
        ) : (
          // User message: Glassmorphism only
          <BlurView
            intensity={colors.blurIntensity}
            tint={colors.blurTint}
            style={[styles.glassOverlay, styles.bubbleContent]}>
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.userBubbleBg },
              ]}
            />
            <Text style={[styles.messageText, { color: colors.textColor }]}>
              {text}
            </Text>
          </BlurView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleWrapper: {
    position: 'relative',
    minHeight: 44,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  glassOverlay: {
    overflow: 'hidden',
  },
  bubbleContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'InstrumentSans-Regular',
    lineHeight: 22,
  },
  avatarSlot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    // Subtle glow around avatar
    shadowColor: '#fb6322',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarVideo: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 99, 34, 0.2)',
  },
  avatarPlaceholderText: {
    fontSize: 20,
  },
});
