import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface GoalCardProps {
  title: string;
  progress: number; // 0-100
  onPress: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  title,
  progress,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image Placeholder */}
      <View style={styles.imageContainer}>
        <Text style={styles.imagePlaceholder}>📚</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircleWrapper}>
            <View
              style={[
                styles.progressCircle,
                {
                  backgroundColor: Colors.success,
                  width: progress * 1.2,
                },
              ]}
            />
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
          <Text style={styles.progressLabel}>Progress</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    height: 100,
    backgroundColor: Colors.cardBgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 40,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  progressContainer: {
    alignItems: 'center',
    gap: 6,
  },
  progressCircleWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  progressCircle: {
    height: '100%',
    borderRadius: 60,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.success,
    zIndex: 1,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
