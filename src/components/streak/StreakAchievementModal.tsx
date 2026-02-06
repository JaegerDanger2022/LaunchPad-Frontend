import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Color } from '../../constants/GlobalStyles';

interface StreakAchievementModalProps {
  visible: boolean;
  achievementType: '3_day' | '7_day' | '30_day' | null;
  streakCount: number;
  onClose: () => void;
}

const ACHIEVEMENT_CONFIG = {
  '3_day': {
    emoji: '🔥',
    title: 'On Fire!',
    message: '3 days in a row! You\'re building momentum.',
    gradient: ['#A855F7', '#6366F1'],
  },
  '7_day': {
    emoji: '🔥🏆',
    title: 'Week Warrior!',
    message: '7 days strong! You\'re unstoppable.',
    gradient: ['#A855F7', '#6366F1'],
  },
  '30_day': {
    emoji: '👑🔥',
    title: 'Monthly Champion!',
    message: '30 days! You\'re a legend.',
    gradient: ['#A855F7', '#6366F1'],
  },
};

export const StreakAchievementModal: React.FC<StreakAchievementModalProps> = ({
  visible,
  achievementType,
  streakCount,
  onClose,
}) => {
  if (!achievementType || !visible) return null;

  const config = ACHIEVEMENT_CONFIG[achievementType];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.content}>
          <LinearGradient
            colors={config.gradient}
            style={styles.gradient}
          >
            {/* Achievement Icon */}
            <Text style={styles.emoji}>{config.emoji}</Text>

            {/* Achievement Title */}
            <Text style={styles.title}>{config.title}</Text>

            {/* Streak Count */}
            <Text style={styles.streak}>{streakCount} Day Streak</Text>

            {/* Message */}
            <Text style={styles.message}>{config.message}</Text>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Keep Going!</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Color.colorWhite,
    marginBottom: 8,
  },
  streak: {
    fontSize: 24,
    fontWeight: '600',
    color: Color.colorWhite,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: Color.colorWhite,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: Color.colorWhite,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A855F7',
  },
});
