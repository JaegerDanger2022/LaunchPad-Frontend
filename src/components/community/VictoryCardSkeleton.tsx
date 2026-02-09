import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { getThemeColors } from '../../constants/GlobalStyles';

export const VictoryCardSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  // Theme-aware skeleton colors - matches Community Wins skeleton
  const skeletonColor = theme === "dark" ? "#d1d1d1" : "#D0D0D0";

  return (
    <View style={[
      styles.cardWrapper,
      {
        borderColor: themeColors.border,
      }
    ]}>
      {/* Accent strip placeholder */}
      <Animated.View style={[
        styles.accentStrip,
        { backgroundColor: skeletonColor, opacity }
      ]} />

      <LinearGradient
        colors={[themeColors.bg_secondary, themeColors.bg_secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glassBody}>
        {/* Top row: badge + category pill */}
        <View style={styles.topRow}>
          <Animated.View style={[styles.badgePill, { opacity, backgroundColor: skeletonColor }]} />
          <Animated.View style={[styles.categoryPill, { opacity, backgroundColor: skeletonColor }]} />
        </View>

        {/* Title lines */}
        <Animated.View style={[styles.titleLine, { opacity, backgroundColor: skeletonColor }]} />
        <Animated.View style={[styles.titleLineShort, { opacity, backgroundColor: skeletonColor }]} />

        {/* Quote lines */}
        <Animated.View style={[styles.quoteLine, { opacity, backgroundColor: skeletonColor }]} />
        <Animated.View style={[styles.quoteLineShort, { opacity, backgroundColor: skeletonColor }]} />

        {/* Meta row */}
        <View style={styles.metaRow}>
          <Animated.View style={[styles.metaChip, { opacity, backgroundColor: skeletonColor }]} />
          <Animated.View style={[styles.metaChipShort, { opacity, backgroundColor: skeletonColor }]} />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Action pills */}
        <View style={styles.actionRow}>
          <Animated.View style={[styles.actionPill, { opacity, backgroundColor: skeletonColor }]} />
          <Animated.View style={[styles.actionPill, { opacity, backgroundColor: skeletonColor }]} />
          <Animated.View style={[styles.actionPillShort, { opacity, backgroundColor: skeletonColor }]} />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    // borderColor is now dynamic
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
  },
  accentStrip: {
    height: 3,
    // backgroundColor and opacity are now dynamic
  },
  glassBody: {
    // colors are now from LinearGradient
    padding: 18,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePill: {
    width: 100,
    height: 28,
    borderRadius: 14,
  },
  categoryPill: {
    width: 80,
    height: 24,
    borderRadius: 12,
  },
  titleLine: {
    width: '85%',
    height: 22,
    borderRadius: 6,
  },
  titleLineShort: {
    width: '55%',
    height: 22,
    borderRadius: 6,
  },
  quoteLine: {
    width: '95%',
    height: 16,
    borderRadius: 4,
  },
  quoteLineShort: {
    width: '65%',
    height: 16,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaChip: {
    width: 90,
    height: 16,
    borderRadius: 4,
  },
  metaChipShort: {
    width: 60,
    height: 16,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'transparent',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionPill: {
    width: 72,
    height: 30,
    borderRadius: 14,
  },
  actionPillShort: {
    width: 56,
    height: 30,
    borderRadius: 14,
  },
});
