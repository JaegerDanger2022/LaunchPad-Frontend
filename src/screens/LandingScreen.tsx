import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { Colors } from '../constants/Colors';
import { ContentTab, NavTab } from '../types';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { TabBar } from '../components/navigation/TabBar';
import { HeroCard } from '../components/cards/HeroCard';
import { GoalCard } from '../components/cards/GoalCard';

export const LandingScreen: React.FC = () => {
  const [activeContentTab, setActiveContentTab] = useState<ContentTab>('recents');
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('home');

  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  const handleHeroCardPress = () => {
    console.log('Hero card pressed');
  };

  const handleGoalCardPress = () => {
    console.log('Goal card pressed');
  };

  const contentTabs = [
    { id: 'recents' as const, label: 'Recents' },
    { id: 'inspiration' as const, label: 'Inspiration' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <Header
          userName="Kyla-Marie"
          onNotificationPress={handleNotificationPress}
        />

        {/* Main Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Card - Up Next Task */}
          <HeroCard
            badge="Up next"
            title="Seek feedback on pilot"
            timeMinutes={20}
            xpPoints={65}
            onPress={handleHeroCardPress}
          />

          {/* Content Tabs */}
          <TabBar
            tabs={contentTabs}
            activeTab={activeContentTab}
            onTabChange={setActiveContentTab}
          />

          {/* Goal Cards */}
          <GoalCard
            title="I want to start a podcast about tech careers"
            progress={40}
            onPress={handleGoalCardPress}
          />

          {/* Add spacing before bottom nav */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeNavTab}
          onTabPress={setActiveNavTab}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  spacer: {
    height: 40,
  },
});
