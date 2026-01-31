import React, { useEffect, useRef } from "react";
import { View, Animated, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getThemeColors } from "../../constants/GlobalStyles";
import { useThemeStore } from "../../store/themeStore";

export const CommunityWinCardSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
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
      ]),
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  // Theme-aware skeleton colors
  const skeletonColor = theme === "dark" ? "#d1d1d1" : "#D0D0D0";

  
  return (
    <LinearGradient
      colors={[themeColors.bg_secondary, themeColors.bg_secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 18,
        flexDirection: "column",
        gap: 14,
        borderWidth: 1,
        borderColor: themeColors.border,
        overflow: "hidden",
        width: width - 34,
      }}>
      {/* Avatar and User Info Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}>
        {/* Avatar Circle Skeleton */}
        <Animated.View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: skeletonColor,
            opacity,
          }}
        />

        {/* User Info Skeleton */}
        <View style={{ flex: 1, gap: 6 }}>
          <Animated.View
            style={{
              width: 120,
              height: 16,
              backgroundColor: skeletonColor,
              borderRadius: 4,
              opacity,
            }}
          />
          <Animated.View
            style={{
              width: 80,
              height: 12,
              backgroundColor: skeletonColor,
              borderRadius: 4,
              opacity,
            }}
          />
        </View>
      </View>

      {/* Milestone Title Skeleton */}
      <Animated.View
        style={{
          width: "85%",
          height: 20,
          backgroundColor: skeletonColor,
          borderRadius: 4,
          opacity,
        }}
      />

      {/* Evidence Snippet Skeleton */}
      <View style={{ gap: 6 }}>
        <Animated.View
          style={{
            width: "95%",
            height: 14,
            backgroundColor: skeletonColor,
            borderRadius: 4,
            opacity,
          }}
        />
        <Animated.View
          style={{
            width: "70%",
            height: 14,
            backgroundColor: skeletonColor,
            borderRadius: 4,
            opacity,
          }}
        />
      </View>

      {/* Stats Row Skeleton */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}>
          <Animated.View
            style={{
              width: 130,
              height: 28,
              backgroundColor: skeletonColor,
              borderRadius: 12,
              opacity,
            }}
          />
          <Animated.View
            style={{
              width: 50,
              height: 28,
              backgroundColor: skeletonColor,
              borderRadius: 12,
              opacity,
            }}
          />
        </View>
        <Animated.View
          style={{
            width: 60,
            height: 12,
            backgroundColor: skeletonColor,
            borderRadius: 4,
            opacity,
          }}
        />
      </View>
    </LinearGradient>
  );
};
