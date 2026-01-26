import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator } from 'react-native';
import { Color } from '../constants/GlobalStyles';

interface DreamLoadingScreenProps {
  visible: boolean;
}

export const DreamLoadingScreen: React.FC<DreamLoadingScreenProps> = ({
  visible,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Color.colorSnow,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
      }}>
      <Animated.View
        style={{
          alignItems: 'center',
          gap: 24,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}>
        {/* Circular Loading Indicator */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#F0F0F0',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator
            size="large"
            color="#fb6322"
            style={{ transform: [{ scale: 1.5 }] }}
          />
        </View>

        {/* Loading Text */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: Color.colorBlack,
            fontFamily: 'InstrumentSans-Bold',
            textAlign: 'center',
          }}>
          Creating Your Dream...
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: 14,
            color: '#A0A0A0',
            fontFamily: 'InstrumentSans-Regular',
            textAlign: 'center',
            lineHeight: 20,
          }}>
          We're processing your request and getting everything ready for you
        </Text>
      </Animated.View>
    </View>
  );
};
