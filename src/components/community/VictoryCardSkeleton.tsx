import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#F5F5F5', '#E0E0E0', '#F5F5F5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}>
        {/* Header Section */}
        <View style={styles.header}>
          <Animated.View style={[styles.badge, { opacity }]} />
          <View style={styles.headerRight}>
            <Animated.View style={[styles.categoryBadge, { opacity }]} />
          </View>
        </View>

        {/* Title */}
        <Animated.View style={[styles.title, { opacity }]} />
        <Animated.View style={[styles.titleShort, { opacity }]} />

        {/* Quote */}
        <Animated.View style={[styles.quote, { opacity }]} />

        {/* Confidence */}
        <Animated.View style={[styles.confidence, { opacity }]} />

        {/* Footer */}
        <View style={styles.footer}>
          <Animated.View style={[styles.author, { opacity }]} />
          <Animated.View style={[styles.date, { opacity }]} />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Animated.View style={[styles.actionButton, { opacity }]} />
          <Animated.View style={[styles.actionButton, { opacity }]} />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    width: 80,
    height: 24,
    backgroundColor: '#D0D0D0',
    borderRadius: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    width: 100,
    height: 24,
    backgroundColor: '#D0D0D0',
    borderRadius: 12,
  },
  title: {
    width: '90%',
    height: 24,
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
    marginBottom: 8,
  },
  titleShort: {
    width: '60%',
    height: 24,
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
    marginBottom: 16,
  },
  quote: {
    width: '80%',
    height: 16,
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
    marginBottom: 16,
  },
  confidence: {
    width: 120,
    height: 20,
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  author: {
    width: 80,
    height: 16,
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
  },
  date: {
    width: 60,
    height: 16,
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 60,
    height: 36,
    backgroundColor: '#D0D0D0',
    borderRadius: 18,
  },
});
