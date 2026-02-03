import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

export const VictoryCardSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

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
    outputRange: [0.25, 0.55],
  });

  const skeletonColor = 'rgba(255, 255, 255, 0.18)';

  return (
    <View style={styles.cardWrapper}>
      {/* Accent strip placeholder */}
      <View style={styles.accentStrip} />

      <BlurView intensity={40} tint="dark" style={styles.glassBody}>
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
      </BlurView>
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
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: 'rgba(255, 255, 255, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  accentStrip: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  glassBody: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
