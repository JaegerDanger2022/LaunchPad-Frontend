import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { NavTab } from '../../types';

interface BottomNavProps {
  activeTab: NavTab;
  onTabPress: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[
          styles.navItem,
          activeTab === 'dreams' && styles.navItemActive,
        ]}
        onPress={() => onTabPress('dreams')}
        activeOpacity={0.7}
      >
        <Text style={styles.navIcon}>📁</Text>
        <Text
          style={[
            styles.navLabel,
            activeTab === 'dreams' && styles.navLabelActive,
          ]}
        >
          Dreams
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navItem,
          activeTab === 'home' && styles.navItemActive,
        ]}
        onPress={() => onTabPress('home')}
        activeOpacity={0.7}
      >
        <Text style={styles.navIcon}>🏠</Text>
        <Text
          style={[
            styles.navLabel,
            activeTab === 'home' && styles.navLabelActive,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 12,
  },
  navItemActive: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  navLabelActive: {
    color: Colors.white,
  },
});
