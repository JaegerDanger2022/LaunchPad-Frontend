import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useCommunityStore } from '../store/communityStore';
import { useFocusEffect } from '@react-navigation/native';
import { VictoryCard } from '../components/community/VictoryCard';
import { DreamCategory } from '../types/community';
import { CATEGORY_LABELS } from '../constants/communityColors';
import Toast from 'react-native-toast-message';

const CATEGORY_OPTIONS: Array<{ label: string; value: DreamCategory | 'all' }> =
  [
    { label: 'All Categories', value: 'all' },
    { label: 'Career', value: 'career_professional' },
    { label: 'Development', value: 'personal_development' },
    { label: 'Wellness', value: 'health_wellness' },
    { label: 'Creative', value: 'creative_expression' },
    { label: 'Relationships', value: 'relationships_community' },
    { label: 'Travel', value: 'travel_exploration' },
    { label: 'Finance', value: 'finance_security' },
    { label: 'Lifestyle', value: 'lifestyle_hobbies' },
    { label: 'Courage', value: 'courage_challenges' },
    { label: 'Achievement', value: 'achievement_goals' },
  ];

const TIME_OPTIONS = [
  { label: 'All Time', value: 'all' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

interface CommunityScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({ onNavigate }) => {
  const {
    victories,
    loading,
    hasMore,
    filters,
    error,
    fetchFeed,
    boostVictory,
    setFilters,
    resetFilters,
    clearError,
  } = useCommunityStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showTimeMenu, setShowTimeMenu] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchFeed(true);
    }, [fetchFeed])
  );

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
        duration: 3000,
      });
      clearError();
    }
  }, [error, clearError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFeed(true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchFeed();
    }
  };

  const handleCategoryChange = (value: string) => {
    setShowCategoryMenu(false);
    if (value === 'all') {
      setFilters({
        ...filters,
        categories: [],
      });
    } else {
      setFilters({
        ...filters,
        categories: [value as DreamCategory],
      });
    }
  };

  const handleTimeChange = (value: string) => {
    setShowTimeMenu(false);
    setFilters({
      ...filters,
      timeframe: value as 'all' | 'week' | 'month',
    });
  };

  const handleBoost = async (victoryId: string) => {
    try {
      await boostVictory(victoryId);
      Toast.show({
        type: 'success',
        text1: 'Courage Boost Given! ⚡',
        text2: '+1 courage point awarded',
        duration: 2000,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to give boost',
        text2: 'Please try again',
        duration: 2000,
      });
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🎯</Text>
      <Text style={styles.emptyTitle}>
        The Victory Wall is waiting for YOUR proof.
      </Text>
      <Text style={styles.emptyDescription}>
        Complete a milestone and share your win to inspire the community.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => {
          // Navigate to Dreams screen
          // Will be connected to navigation
        }}
      >
        <Text style={styles.emptyButtonText}>Go to My Dreams</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return loading ? (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#2D5BFF" />
      </View>
    ) : null;
  };

  const currentCategoryLabel =
    filters.categories.length === 0
      ? 'All Categories'
      : CATEGORY_LABELS[filters.categories[0]];

  const currentTimeLabel = TIME_OPTIONS.find(
    (t) => t.value === filters.timeframe
  )?.label;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Victory Wall</Text>
        <Text style={styles.headerSubtitle}>
          Proof of action, not perfection
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {/* Category Filter */}
          <View style={styles.filterButtonContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowCategoryMenu(!showCategoryMenu)}
            >
              <Text style={styles.filterButtonText}>
                {currentCategoryLabel} ▼
              </Text>
            </TouchableOpacity>
            {showCategoryMenu && (
              <View style={styles.dropdown}>
                {CATEGORY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownItem}
                    onPress={() => handleCategoryChange(option.value)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        filters.categories.length === 0 &&
                        option.value === 'all' &&
                        styles.dropdownItemActive,
                        filters.categories.includes(
                          option.value as DreamCategory
                        ) && styles.dropdownItemActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Time Filter */}
          <View style={styles.filterButtonContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowTimeMenu(!showTimeMenu)}
            >
              <Text style={styles.filterButtonText}>
                {currentTimeLabel} ▼
              </Text>
            </TouchableOpacity>
            {showTimeMenu && (
              <View style={styles.dropdown}>
                {TIME_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownItem}
                    onPress={() => handleTimeChange(option.value)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        filters.timeframe === option.value &&
                        styles.dropdownItemActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Feed */}
      <FlatList
        data={victories}
        renderItem={({ item }) => (
          <VictoryCard
            victory={item}
            onBoost={handleBoost}
          />
        )}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!loading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2D5BFF"
          />
        }
        contentContainerStyle={
          victories.length === 0 ? styles.emptyContainer : undefined
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButtonContainer: {
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 12,
    color: '#374151',
  },
  dropdownItemActive: {
    fontWeight: '600',
    color: '#2D5BFF',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#2D5BFF',
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
