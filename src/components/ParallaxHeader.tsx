import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Image,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  TextStyle,
  ScrollViewProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ParallaxHeaderProps extends ScrollViewProps {
  title: string;
  subtitle?: string;
  backgroundImage?: ImageSourcePropType;
  backgroundColor?: string;
  parallaxHeight?: number;
  headerHeight?: number;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  children: React.ReactNode;
}

export const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({
  title,
  subtitle,
  backgroundImage,
  backgroundColor = '#1F2937',
  parallaxHeight = 220,
  headerHeight = 90,
  titleStyle,
  subtitleStyle,
  onEndReached,
  onEndReachedThreshold = 0.5,
  children,
  contentContainerStyle,
  ...scrollViewProps
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  // Handle onEndReached for infinite scroll
  const handleScroll = (event: any) => {
    if (onEndReached) {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToBottom = contentSize.height * onEndReachedThreshold;

      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
        onEndReached();
      }
    }
  };

  // Parallax effect for background image with elastic stretch on pull down
  const imageTranslate = scrollY.interpolate({
    inputRange: [-parallaxHeight, 0, parallaxHeight],
    outputRange: [-parallaxHeight / 2, 0, -parallaxHeight / 2],
    extrapolate: 'clamp',
  });

  // Stretch/scale effect when pulling down
  const imageScale = scrollY.interpolate({
    inputRange: [-parallaxHeight, 0, parallaxHeight],
    outputRange: [2, 1, 1],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, parallaxHeight / 2, parallaxHeight],
    outputRange: [1, 0.8, 0.3],
    extrapolate: 'clamp',
  });

  // Sticky header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [parallaxHeight - headerHeight - 40, parallaxHeight - headerHeight],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, parallaxHeight - headerHeight],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Parallax Header Background - Fixed position */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: parallaxHeight,
        overflow: 'hidden',
        zIndex: 0,
      }}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: parallaxHeight * 1.5,
            transform: [
              { translateY: imageTranslate },
              { scale: imageScale },
            ],
          }}>
          {backgroundImage ? (
            <>
              <Image
                source={backgroundImage}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
            </>
          ) : (
            <View style={{ flex: 1, backgroundColor }} />
          )}
        </Animated.View>

        {/* Title and Subtitle in Header */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 30,
            left: 20,
            right: 20,
            opacity: imageOpacity,
            transform: [{ scale: titleScale }],
          }}>
          <Text
            style={[
              {
                fontSize: 32,
                fontWeight: 'bold',
                color: '#FFFFFF',
                marginBottom: 8,
              },
              titleStyle,
            ]}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                {
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.9)',
                },
                subtitleStyle,
              ]}>
              {subtitle}
            </Text>
          )}
        </Animated.View>
      </View>

      {/* Sticky Header (appears on scroll) - with opaque background */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          zIndex: 100,
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingTop: 40,
          opacity: headerOpacity,
        }}>
        {/* Solid background that covers the parallax image */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor,
          }}
        />
        <Text
          style={[
            {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#FFFFFF',
            },
            titleStyle,
          ]}>
          {title}
        </Text>
      </Animated.View>

      <Animated.ScrollView
        {...scrollViewProps}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: handleScroll,
          }
        )}
        contentContainerStyle={[{ paddingTop: parallaxHeight + 20 }, contentContainerStyle]}>
        {/* Content starts after the header */}
        {children}
      </Animated.ScrollView>
    </View>
  );
};
