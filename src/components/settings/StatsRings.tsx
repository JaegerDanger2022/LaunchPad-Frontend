import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useThemeStore } from '../../store/themeStore';
import { getThemeColors } from '../../constants/GlobalStyles';

const { width } = Dimensions.get('window');
const SIZE = Math.min(width - 80, 280);
const CENTER = SIZE / 2;
const STROKE_WIDTH = 16;

interface RingProps {
  progress: number;
  radius: number;
  colors: string[];
  gradientId: string;
  delay?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const Ring: React.FC<RingProps> = ({ progress, radius, colors, gradientId, delay = 0 }) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 2000,
      delay,
      useNativeDriver: true,
    }).start();
  }, [progress, delay]);

  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <>
      {/* Background circle */}
      <Circle
        cx={CENTER}
        cy={CENTER}
        r={radius}
        stroke="rgba(128, 128, 128, 0.1)"
        strokeWidth={STROKE_WIDTH}
        fill="none"
      />
      {/* Progress circle */}
      <AnimatedCircle
        cx={CENTER}
        cy={CENTER}
        r={radius}
        stroke={`url(#${gradientId})`}
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="none"
        rotation="-90"
        origin={`${CENTER}, ${CENTER}`}
      />
    </>
  );
};

interface StatsRingsProps {
  currentStreak: number;
  dreamCount: number;
  completedMilestones: number;
  maxStreak?: number;
  maxDreams?: number;
  maxMilestones?: number;
}

export const StatsRings: React.FC<StatsRingsProps> = ({
  currentStreak,
  dreamCount,
  completedMilestones,
  maxStreak = 30,
  maxDreams = 10,
  maxMilestones = 50,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  // Calculate progress (0 to 1)
  const streakProgress = Math.min(currentStreak / maxStreak, 1);
  const dreamsProgress = Math.min(dreamCount / maxDreams, 1);
  const milestonesProgress = Math.min(completedMilestones / maxMilestones, 1);

  // Ring radii (from outer to inner)
  const streakRadius = CENTER - STROKE_WIDTH / 2 - 10;
  const dreamsRadius = CENTER - STROKE_WIDTH * 1.5 - 25;
  const milestonesRadius = CENTER - STROKE_WIDTH * 2.5 - 40;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          {/* Gradient for Streak ring */}
          <LinearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6B35" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FF9068" stopOpacity="1" />
          </LinearGradient>

          {/* Gradient for Dreams ring */}
          <LinearGradient id="dreamsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#14B8A6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#06B6D4" stopOpacity="1" />
          </LinearGradient>

          {/* Gradient for Milestones ring */}
          <LinearGradient id="milestonesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD93D" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FFA502" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Outer ring - Streak */}
        <Ring
          progress={streakProgress}
          radius={streakRadius}
          colors={['#FF6B35', '#FF9068']}
          gradientId="streakGradient"
          delay={0}
        />

        {/* Middle ring - Dreams */}
        <Ring
          progress={dreamsProgress}
          radius={dreamsRadius}
          colors={['#14B8A6', '#06B6D4']}
          gradientId="dreamsGradient"
          delay={200}
        />

        {/* Inner ring - Milestones */}
        <Ring
          progress={milestonesProgress}
          radius={milestonesRadius}
          colors={['#FFD93D', '#FFA502']}
          gradientId="milestonesGradient"
          delay={400}
        />
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF6B35' }]} />
          <Text style={[styles.legendText, { color: themeColors.text_secondary }]}>
            {currentStreak} Day Streak
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#14B8A6' }]} />
          <Text style={[styles.legendText, { color: themeColors.text_secondary }]}>
            {dreamCount} Dreams
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFD93D' }]} />
          <Text style={[styles.legendText, { color: themeColors.text_secondary }]}>
            {completedMilestones} Milestones
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  legend: {
    marginTop: 24,
    gap: 12,
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
  },
});
