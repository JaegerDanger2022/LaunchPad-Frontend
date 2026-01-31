import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ActivityIndicator } from 'react-native';

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isConnecting,
  error,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isConnecting) {
      // Pulse animation for connecting state
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnecting, pulseAnim]);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={[styles.dot, styles.dotError]} />
        <Text style={styles.errorText}>Connection failed</Text>
      </View>
    );
  }

  if (isConnecting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#FFD93D" />
        <Text style={styles.connectingText}>Connecting...</Text>
      </View>
    );
  }

  if (isConnected) {
    return (
      <View style={styles.container}>
        <View style={[styles.dot, styles.dotConnected]} />
        <Text style={styles.connectedText}>Ready</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotConnected: {
    backgroundColor: '#4CAF50',
  },
  dotError: {
    backgroundColor: '#FF4444',
  },
  connectedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontFamily: 'InstrumentSans-Regular',
  },
  connectingText: {
    fontSize: 12,
    color: '#FFD93D',
    fontFamily: 'InstrumentSans-Regular',
    marginLeft: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    fontFamily: 'InstrumentSans-Regular',
  },
});
