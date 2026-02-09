import React, { useRef, forwardRef } from 'react';
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
import LottieView from 'lottie-react-native';

interface ParallaxHeaderProps extends ScrollViewProps {
  title: string;
  subtitle?: string;
  backgroundImage?: ImageSourcePropType;
  backgroundLottie?: any;
  backgroundColor?: string;
  parallaxHeight?: number;
  headerHeight?: number;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  stickyHeaderTitleStyle?: StyleProp<TextStyle>;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  children: React.ReactNode;
}

export const ParallaxHeader = forwardRef<ScrollView, ParallaxHeaderProps>(({
  title,
  subtitle,
  backgroundImage,
  backgroundLottie,
  backgroundColor = '#1F2937',
  parallaxHeight = 220,
  headerHeight = 90,
  titleStyle,
  subtitleStyle,
  stickyHeaderTitleStyle,
  onEndReached,
  onEndReachedThreshold = 0.5,
  children,
  contentContainerStyle,
  ...scrollViewProps
}, ref) => {
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
    inputRange: [0, parallaxHeight / 2, parallaxHeight - headerHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  // Sticky header animation - using translateY for better performance
  const headerTranslateY = scrollY.interpolate({
    inputRange: [parallaxHeight - headerHeight - 40, parallaxHeight - headerHeight],
    outputRange: [-headerHeight, 0],
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
      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: parallaxHeight,
        overflow: 'hidden',
        zIndex: 0,
        opacity: imageOpacity,
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
          {backgroundLottie ? (
            <>
              <LottieView
                source={backgroundLottie}
                autoPlay
                loop
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
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
          ) : backgroundImage ? (
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
      </Animated.View>

      {/* Sticky Header (appears on scroll) - with opaque background */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight,
          backgroundColor,
          zIndex: 100,
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingTop: 40,
          transform: [{ translateY: headerTranslateY }],
        }}>
        <Text
          style={[
            {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#FFFFFF',
            },
            stickyHeaderTitleStyle,
          ]}>
          {title}
        </Text>
      </Animated.View>

      <Animated.ScrollView
        ref={ref}
        {...scrollViewProps}
        scrollEventThrottle={1}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: handleScroll,
          }
        )}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        contentContainerStyle={[{ paddingTop: parallaxHeight + 20 }, contentContainerStyle]}>
        {/* Content starts after the header */}
        {children}
      </Animated.ScrollView>
    </View>
  );
});
