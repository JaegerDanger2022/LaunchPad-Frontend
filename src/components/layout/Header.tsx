import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface HeaderProps {
  userName: string;
  avatarUrl?: string;
  onNotificationPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  avatarUrl,
  onNotificationPress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Ready to win, {userName}?</Text>
      </View>
      <TouchableOpacity
        onPress={onNotificationPress}
        activeOpacity={0.7}
        style={styles.bellButton}
      >
        <Text style={styles.bellIcon}>🔔</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 20,
  },
});
