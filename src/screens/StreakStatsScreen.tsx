import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Color, getThemeColors } from '../constants/GlobalStyles';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export const StreakStatsScreen = ({ onNavigate }: { onNavigate?: (screen: string) => void }) => {
  const { userData } = useAuthStore();
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate?.('Home')}>
            <Text style={[styles.backButton, { color: themeColors.text_secondary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text_primary }]}>
            Your Streak Stats
          </Text>
        </View>

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
