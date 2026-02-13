import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { getThemeColors } from '../../constants/GlobalStyles';

export const UpNextHeroSkeleton: React.FC = () => {
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
  const skeletonBgColor = themeColors.bg_secondary;
  const skeletonColor = theme === 'dark' ? '#d1d1d1' : '#D0D0D0';

  return (
    <View
      style={{
        marginHorizontal: 17,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        height: 180,
        backgroundColor: skeletonBgColor,
      }}>
      <View
        style={{
          flex: 1,
          padding: 20,
          justifyContent: 'space-between',
        }}>
        {/* Badge skeleton */}
        <Animated.View
          style={{
            width: 80,
            height: 24,
            backgroundColor: skeletonColor,
            borderRadius: 12,
            opacity,
          }}
        />

        {/* Title skeleton */}
        <View style={{ gap: 8 }}>
          <Animated.View
            style={{
              width: '90%',
              height: 28,
              backgroundColor: skeletonColor,
              borderRadius: 4,
              opacity,
            }}
          />
          <Animated.View
            style={{
              width: '70%',
              height: 28,
              backgroundColor: skeletonColor,
              borderRadius: 4,
              opacity,
            }}
          />
        </View>

        {/* Stats row skeleton */}
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
          }}>
          <Animated.View
            style={{
              width: 80,
              height: 32,
              backgroundColor: skeletonColor,
              borderRadius: 8,
              opacity,
            }}
          />
          <Animated.View
            style={{
              width: 60,
              height: 32,
              backgroundColor: skeletonColor,
              borderRadius: 8,
              opacity,
            }}
          />
        </View>
      </View>
    </View>
  );
};
