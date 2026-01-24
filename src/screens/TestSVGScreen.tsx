import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BellIcon,
  HomeIcon,
  ClockIcon,
  LightningIcon,
  ArrowRightIcon,
  AvatarIcon,
} from '../components/icons/SVGIcons';

const TestSVGScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>SVG Icon Test</Text>

        <View style={styles.iconRow}>
          <View style={styles.iconContainer}>
            <BellIcon size={50} color="#000" />
            <Text style={styles.label}>Bell</Text>
          </View>

          <View style={styles.iconContainer}>
            <HomeIcon size={50} color="#000" />
            <Text style={styles.label}>Home</Text>
          </View>

          <View style={styles.iconContainer}>
            <ClockIcon size={50} color="#000" />
            <Text style={styles.label}>Clock</Text>
          </View>
        </View>

        <View style={styles.iconRow}>
          <View style={styles.iconContainer}>
            <LightningIcon size={50} color="#ff9000" />
            <Text style={styles.label}>Lightning</Text>
          </View>

          <View style={styles.iconContainer}>
            <ArrowRightIcon size={50} color="#000" />
            <Text style={styles.label}>Arrow</Text>
          </View>

          <View style={styles.iconContainer}>
            <AvatarIcon size={50} color="#b4c5fd" />
            <Text style={styles.label}>Avatar</Text>
          </View>
        </View>

        <Text style={styles.instruction}>
          If you see 6 icons above, the SVG rendering is working!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  iconRow: {
    flexDirection: 'row',
    marginBottom: 40,
    justifyContent: 'space-around',
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
  },
  label: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
  instruction: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default TestSVGScreen;
