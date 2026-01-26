import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useWindowDimensions } from 'react-native';

export const SkeletonDreamCards: React.FC = () => {
  const { width } = useWindowDimensions();
  const columnWidth = (width - 34 - 14) / 2;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.9, 0.6],
  });

  const SkeletonCard = () => (
    <Animated.View
      style={{
        width: columnWidth,
        height: 228,
        borderRadius: 10,
        backgroundColor: '#E0E0E0',
        opacity,
        overflow: 'hidden',
      }}>
      {/* Image skeleton */}
      <View
        style={{
          width: '100%',
          height: 120,
          backgroundColor: '#D0D0D0',
        }}
      />
      {/* Bottom section skeleton */}
      <View
        style={{
          flex: 1,
          backgroundColor: '#E0E0E0',
          paddingHorizontal: 15,
          paddingVertical: 15,
          justifyContent: 'space-between',
        }}>
        {/* Title skeleton */}
        <View
          style={{
            height: 20,
            backgroundColor: '#D0D0D0',
            borderRadius: 4,
            width: '70%',
          }}
        />
        {/* Progress skeleton */}
        <View
          style={{
            height: 30,
            backgroundColor: '#D0D0D0',
            borderRadius: 15,
            width: 100,
          }}
        />
      </View>
    </Animated.View>
  );

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 17,
        paddingTop: 20,
        paddingBottom: 20,
      }}>
      {/* Grid of skeleton cards - 2 columns */}
      <View style={{ flexDirection: 'row', gap: 14, marginBottom: 14 }}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
      <View style={{ flexDirection: 'row', gap: 14, marginBottom: 14 }}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
    </View>
  );
};
