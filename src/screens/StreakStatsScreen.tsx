import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Color, getThemeColors } from '../constants/GlobalStyles';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAG_THRESHOLD = 100; // Distance to drag before closing

export const StreakStatsScreen = ({ onNavigate }: { onNavigate?: (screen: string) => void }) => {
  const { userData } = useAuthStore();
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(1)).current;
  const lastGestureDy = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward drags
        return gestureState.dy > 5;
      },
      onPanResponderGrant: () => {
        lastGestureDy.current = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          lastGestureDy.current = gestureState.dy;
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAG_THRESHOLD || gestureState.vy > 0.5) {
          // Close the modal - fade out backdrop and slide down content
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: SCREEN_HEIGHT,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onNavigate?.('Home');
          });
        } else {
          // Snap back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const streakData = userData?.streak;

  if (!streakData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>
        <Text style={{ color: themeColors.text_primary, padding: 20 }}>No streak data available</Text>
      </SafeAreaView>
    );
  }

  function getMotivationalMessage(streak: number): string {
    if (streak === 0) return "Start your streak today! Complete a milestone to begin.";
    if (streak < 3) return `${3 - streak} more day${3 - streak > 1 ? 's' : ''} until your first milestone!`;
    if (streak < 7) return `${7 - streak} more day${7 - streak > 1 ? 's' : ''} until Week Warrior!`;
    if (streak < 30) return `${30 - streak} more day${30 - streak > 1 ? 's' : ''} until Monthly Champion!`;
    return "You're a legend! Keep the streak alive!";
  }

  return (
    <View style={styles.modalContainer}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: backdropOpacity,
          }
        ]}
      />
      <Animated.View
        style={[
          styles.animatedContent,
          {
            transform: [{ translateY }],
          }
        ]}
      >
        <SafeAreaView style={[styles.contentContainer, { backgroundColor: themeColors.bg_primary }]}>
          {/* Drag Handle */}
          <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header - Also draggable */}
          <View {...panResponder.panHandlers} style={styles.header}>
            <Text style={[styles.headerTitle, { color: themeColors.text_primary }]}>
              Your Streak Stats
            </Text>
          </View>

          <ScrollView style={styles.container}>
        {/* Current Streak Card */}
        <LinearGradient
          colors={['#FF6B35', '#FF9068']}
          style={styles.statCard}
        >
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statNumber}>{streakData.current_streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.grid}>
          {/* Longest Streak */}
          <LinearGradient
            colors={['#FFD93D', '#FFA502']}
            style={styles.gridCard}
          >
            <Text style={styles.gridEmoji}>🏆</Text>
            <Text style={styles.gridNumber}>{streakData.longest_streak}</Text>
            <Text style={styles.gridLabel}>Best Streak</Text>
          </LinearGradient>

          {/* Total Completions */}
          <LinearGradient
            colors={['#14B8A6', '#06B6D4']}
            style={styles.gridCard}
          >
            <Text style={styles.gridEmoji}>✅</Text>
            <Text style={styles.gridNumber}>{streakData.total_completions}</Text>
            <Text style={styles.gridLabel}>Completed</Text>
          </LinearGradient>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Milestone Achievements
          </Text>

          <View style={[styles.achievementRow, { borderBottomColor: themeColors.bg_secondary, borderBottomWidth: 1 }]}>
            <Text style={styles.achievementEmoji}>🔥</Text>
            <Text style={[styles.achievementText, { color: themeColors.text_primary }]}>
              3-Day Streaks
            </Text>
            <Text style={[styles.achievementCount, { color: themeColors.text_secondary }]}>
              {streakData.milestone_achievements.three_day_count}x
            </Text>
          </View>

          <View style={[styles.achievementRow, { borderBottomColor: themeColors.bg_secondary, borderBottomWidth: 1 }]}>
            <Text style={styles.achievementEmoji}>🔥🏆</Text>
            <Text style={[styles.achievementText, { color: themeColors.text_primary }]}>
              7-Day Streaks
            </Text>
            <Text style={[styles.achievementCount, { color: themeColors.text_secondary }]}>
              {streakData.milestone_achievements.seven_day_count}x
            </Text>
          </View>

          <View style={styles.achievementRow}>
            <Text style={styles.achievementEmoji}>👑🔥</Text>
            <Text style={[styles.achievementText, { color: themeColors.text_primary }]}>
              30-Day Streaks
            </Text>
            <Text style={[styles.achievementCount, { color: themeColors.text_secondary }]}>
              {streakData.milestone_achievements.thirty_day_count}x
            </Text>
          </View>
        </View>

        {/* Motivational Message */}
        <View style={[styles.motivationCard, { backgroundColor: themeColors.bg_secondary }]}>
          <Text style={[styles.motivationText, { color: themeColors.text_secondary }]}>
            {getMotivationalMessage(streakData.current_streak)}
          </Text>
        </View>
        </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  animatedContent: {
    flex: 1,
    marginTop: 50,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  statCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  statEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: Color.colorWhite,
  },
  statLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: Color.colorWhite,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  gridEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  gridNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: Color.colorWhite,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Color.colorWhite,
  },
  achievementsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  achievementEmoji: {
    fontSize: 24,
    width: 40,
  },
  achievementText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  achievementCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  motivationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  motivationText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
});
