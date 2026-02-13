import React, { useEffect, useRef } from 'react';
import { View, Animated, useWindowDimensions } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { getThemeColors } from '../constants/GlobalStyles';

export const SkeletonDreamCardsCarousel: React.FC = () => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 34 - 14) / 2; // Same as GoalCard column width
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  // Theme-aware skeleton colors - matches Community Wins skeleton
  const skeletonBgColor = themeColors.bg_secondary;
  const skeletonColor = theme === 'dark' ? '#d1d1d1' : '#D0D0D0';

  const SkeletonCard = () => (
    <View
      style={{
        width: cardWidth,
        height: 228,
        borderRadius: 10,
        backgroundColor: skeletonBgColor,
        overflow: 'hidden',
        marginRight: 14,
      }}>
      {/* Image skeleton */}
      <Animated.View
        style={{
          width: '100%',
          height: 120,
          backgroundColor: skeletonColor,
          opacity,
        }}
      />
      {/* Bottom section skeleton */}
      <View
        style={{
          flex: 1,
          backgroundColor: skeletonBgColor,
          paddingHorizontal: 15,
          paddingVertical: 15,
          justifyContent: 'space-between',
        }}>
        {/* Title skeleton */}
        <Animated.View
          style={{
            height: 20,
            backgroundColor: skeletonColor,
            borderRadius: 4,
            width: '70%',
            opacity,
          }}
        />
        {/* Progress skeleton */}
        <Animated.View
          style={{
            height: 30,
            backgroundColor: skeletonColor,
            borderRadius: 15,
            width: 100,
            opacity,
          }}
        />
      </View>
    </View>
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingTop: 20,
      }}>
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
};
