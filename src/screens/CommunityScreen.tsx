import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ParallaxHeader } from '../components/ParallaxHeader';
import { useCommunityStore } from '../store/communityStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getThemeColors, Color } from '../constants/GlobalStyles';
import { useFocusEffect } from '@react-navigation/native';
import { VictoryCard as VictoryCardComponent } from '../components/community/VictoryCard';
import { JourneyRecapCard } from '../components/community/JourneyRecapCard';
import { VictoryCard, DreamCategory, PermissionSlip, PermissionType, CommunityFeedItem } from '../types/community';
import { CATEGORY_LABELS } from '../constants/communityColors';
import { fetchVictories } from '../config/api';
import Toast from 'react-native-toast-message';
import { BottomNavbar } from '../components/BottomNavbar';
import { PermissionSlipModal } from '../components/community/PermissionSlipModal';
import { PermissionSlipList } from '../components/community/PermissionSlipList';
import { VictoryCardSkeleton } from '../components/community/VictoryCardSkeleton';
import { ChevronUp } from 'lucide-react-native';

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
  // Get theme
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();

  // Get current user
  const { user } = useAuthStore();

  // Get filters and actions from store (NO victory caching)
  const {
    filters,
    error: storeError,
    boostVictory,
    toggleMeToo,
    givePermission,
    loadPermissions,
    setFilters,
    clearError,
  } = useCommunityStore();

  // LOCAL component state for streaming pagination (mixed feed)
  const [feedItems, setFeedItems] = useState<CommunityFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showTimeMenu, setShowTimeMenu] = useState(false);

  // Permission slip modals
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedVictoryForPermission, setSelectedVictoryForPermission] = useState<VictoryCard | null>(null);
  const [showPermissionsList, setShowPermissionsList] = useState(false);
  const [permissionsToView, setPermissionsToView] = useState<PermissionSlip[]>([]);

  // Scroll ref for scroll-to-top button
  const scrollRef = useRef<ScrollView>(null);

  // Fetch feed from backend (streaming) - includes victories and journey recaps
  const loadFeed = async (page: number, reset: boolean = false) => {
    if (loading) return;

    try {
      setLoading(true);

      const response = await fetchVictories({
        page,
        limit: 20,
        categories: filters.categories.length > 0 ? filters.categories : undefined,
        timeframe: filters.timeframe !== 'all' ? filters.timeframe : undefined,
      });

      setFeedItems(prev => reset ? response.feed : [...prev, ...response.feed]);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error loading feed:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load feed',
        text2: 'Please try again',
        visibilityTime: 3000,
      });
      setLoading(false);
    }
  };

  // Load initial feed on mount
  useFocusEffect(
    React.useCallback(() => {
      loadFeed(1, true);
    }, [filters])
  );

  // Show error toasts from store
  useEffect(() => {
    if (storeError) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: storeError,
        visibilityTime: 3000,
      });
      clearError();
    }
  }, [storeError, clearError]);

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed(1, true);
    setRefreshing(false);
  };

  // Load more on scroll (pagination)
  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      loadFeed(currentPage + 1, false);
    }
  };

  // Filter handlers
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

  // Boost handler with optimistic update
  const handleBoost = async (victoryId: string) => {
    // Optimistic UI update
    setFeedItems(prev =>
      prev.map(item =>
        item.id === victoryId
          ? { ...item, courageBoosts: item.courageBoosts + 1, hasUserBoosted: true }
          : item
      )
    );

    try {
      await boostVictory(victoryId);
      Toast.show({
        type: 'success',
        text1: 'Courage Boost Given! ⚡',
        text2: '+1 courage point awarded',
        visibilityTime: 2000,
      });
    } catch (err) {
      // Rollback optimistic update on error
      setFeedItems(prev =>
        prev.map(item =>
          item.id === victoryId
            ? { ...item, courageBoosts: item.courageBoosts - 1, hasUserBoosted: false }
            : item
        )
      );

      // Show specific error message based on error type
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      if (errorMessage.includes('Cannot boost your own victory')) {
        Toast.show({
          type: 'info',
          text1: 'Can\'t Boost Your Own Victory',
          text2: 'Share the love with others! 💙',
          visibilityTime: 2500,
        });
      } else if (errorMessage.includes('already boosted')) {
        Toast.show({
          type: 'info',
          text1: 'Already Boosted',
          text2: 'You\'ve already given this victory a boost',
          visibilityTime: 2000,
        });
      } else if (errorMessage.includes('not authenticated')) {
        Toast.show({
          type: 'error',
          text1: 'Not Authenticated',
          text2: 'Please log in to give boosts',
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to give boost',
          text2: 'Please try again',
          visibilityTime: 2000,
        });
      }
    }
  };

  // Me Too handler with optimistic update
  const handleMeToo = async (victoryId: string) => {
    const feedItem = feedItems.find(item => item.id === victoryId);
    if (!feedItem) return;

    const previousState = feedItem.hasUserMeTooed;
    const previousCount = feedItem.meTooCount;

    // Optimistic UI update
    setFeedItems(prev =>
      prev.map(item =>
        item.id === victoryId
          ? {
              ...item,
              meTooCount: previousState ? item.meTooCount - 1 : item.meTooCount + 1,
              hasUserMeTooed: !previousState,
            }
          : item
      )
    );

    try {
      const result = await toggleMeToo(victoryId);

      // Update with actual count from server
      setFeedItems(prev =>
        prev.map(item =>
          item.id === victoryId
            ? { ...item, meTooCount: result.newCount, hasUserMeTooed: result.added }
            : item
        )
      );

      Toast.show({
        type: 'success',
        text1: result.added ? 'Me Too! 👥' : 'Removed',
        text2: result.added ? 'Victory saved to your inspirations' : 'Removed from inspirations',
        visibilityTime: 2000,
      });
    } catch (err) {
      // Rollback optimistic update on error
      setFeedItems(prev =>
        prev.map(item =>
          item.id === victoryId
            ? { ...item, meTooCount: previousCount, hasUserMeTooed: previousState }
            : item
        )
      );
      Toast.show({
        type: 'error',
        text1: 'Failed to toggle Me Too',
        text2: 'Please try again',
        visibilityTime: 2000,
      });
    }
  };

  // Permission slip handlers
  const handlePermissionClick = (victoryId: string) => {
    const feedItem = feedItems.find(item => item.id === victoryId);
    if (feedItem && feedItem.type === 'victory') {
      setSelectedVictoryForPermission(feedItem);
      setShowPermissionModal(true);
    }
  };

  const handleGivePermission = async (permissionType: PermissionType) => {
    if (!selectedVictoryForPermission) return;

    try {
      const permissionText = await givePermission(selectedVictoryForPermission.id, permissionType);

      // Update local state - increment permission count
      setFeedItems(prev =>
        prev.map(item =>
          item.id === selectedVictoryForPermission.id
            ? { ...item, permissionsCount: item.permissionsCount + 1 }
            : item
        )
      );

      Toast.show({
        type: 'success',
        text1: 'Permission Granted! 💬',
        text2: `+5 courage points awarded`,
        visibilityTime: 2000,
      });
    } catch (err) {
      // Show specific error message based on error type
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      if (errorMessage.includes('Cannot give permission to your own victory')) {
        Toast.show({
          type: 'info',
          text1: 'Can\'t Give Permission to Your Victory',
          text2: 'Share encouragement with others! 💙',
          visibilityTime: 2500,
        });
      } else if (errorMessage.includes('already given a permission')) {
        Toast.show({
          type: 'info',
          text1: 'Already Granted',
          text2: 'You\'ve already given a permission to this victory',
          visibilityTime: 2000,
        });
      } else if (errorMessage.includes('not authenticated')) {
        Toast.show({
          type: 'error',
          text1: 'Not Authenticated',
          text2: 'Please log in to give permissions',
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to give permission',
          text2: 'Please try again',
          visibilityTime: 2000,
        });
      }
    }
  };

  const handleViewPermissions = async (victoryId: string) => {
    try {
      const permissions = await loadPermissions(victoryId);
      setPermissionsToView(permissions);
      setShowPermissionsList(true);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load permissions',
        text2: 'Please try again',
        visibilityTime: 2000,
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
        onPress={() => onNavigate?.('AllDreams')}
      >
        <Text style={styles.emptyButtonText}>Go to My Dreams</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (currentPage >= totalPages) return null;
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

  const styles = createStyles(themeColors);

  // Bottom navbar height + safe area
  const bottomNavbarHeight = 60; // Approximate navbar height
  const bottomPadding = bottomNavbarHeight + Math.max(insets.bottom, 8) + 20;

  // Scroll to top handler
  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ParallaxHeader
        ref={scrollRef}
        backgroundColor={themeColors.bg_secondary}
        backgroundImage={require('../assets/images/hero-bg.png')}
        title="🏆 Victory Wall"
        subtitle={`Proof of action, not perfection • ${feedItems.length} ${feedItems.length === 1 ? 'post' : 'posts'}`}
        titleStyle={{
          fontSize: 28,
          fontWeight: 'bold',
          color: theme === 'dark' ? '#FFFFFF' : Color.colorBlack,
        }}
        subtitleStyle={{
          fontSize: 14,
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
        }}
        stickyHeaderTitleStyle={{
          fontSize: 20,
          fontWeight: 'bold',
          color: themeColors.text_primary,
        }}
        parallaxHeight={200}
        headerHeight={80}
        contentContainerStyle={{
          paddingBottom: bottomPadding,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          {/* Category Filter */}
          <View style={styles.filterButtonContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowCategoryMenu(!showCategoryMenu)}
            >
              <Text style={styles.filterButtonText} numberOfLines={1}>
                {currentCategoryLabel} ▼
              </Text>
            </TouchableOpacity>
            {showCategoryMenu && (
              <View style={styles.dropdown}>
                <ScrollView
                  style={styles.dropdownScroll}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
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
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Time Filter */}
          <View style={styles.filterButtonContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowTimeMenu(!showTimeMenu)}
            >
              <Text style={styles.filterButtonText} numberOfLines={1}>
                {currentTimeLabel} ▼
              </Text>
            </TouchableOpacity>
            {showTimeMenu && (
              <View style={styles.dropdown}>
                <ScrollView
                  style={styles.dropdownScroll}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
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
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Feed */}
      {(loading || refreshing) && feedItems.length === 0 ? (
        // Show skeleton loaders on initial load or refresh with no data
        <>
          <VictoryCardSkeleton />
          <VictoryCardSkeleton />
          <VictoryCardSkeleton />
        </>
      ) : feedItems.length === 0 && !loading && !refreshing ? (
        renderEmpty()
      ) : (
        <>
          {refreshing && feedItems.length > 0 ? (
            // Show skeleton loaders while refreshing with existing data
            <>
              <VictoryCardSkeleton />
              <VictoryCardSkeleton />
              <VictoryCardSkeleton />
            </>
          ) : (
            feedItems.map((item) => {
              if (item.type === 'journey_recap') {
                // Render Journey Recap Card
                return (
                  <JourneyRecapCard
                    key={item.id}
                    journeyRecap={item}
                    onBoost={handleBoost}
                    onMeToo={item.userId !== user?.uid ? handleMeToo : undefined}
                    onPermission={item.userId !== user?.uid ? handlePermissionClick : undefined}
                    onViewPermissions={handleViewPermissions}
                  />
                );
              } else {
                // Render Victory Card
                return (
                  <VictoryCardComponent
                    key={item.id}
                    victory={item}
                    onBoost={handleBoost}
                    onMeToo={item.userId !== user?.uid ? handleMeToo : undefined}
                    onPermission={item.userId !== user?.uid ? handlePermissionClick : undefined}
                    onViewPermissions={handleViewPermissions}
                  />
                );
              }
            })
          )}
          {renderFooter()}
        </>
      )}

      </ParallaxHeader>

      {/* Scroll to Top Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          right: 20,
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          onPress={scrollToTop}
          style={{
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ChevronUp size={24} color={themeColors.text_primary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Permission Slip Modal */}
      {selectedVictoryForPermission && (
        <PermissionSlipModal
          visible={showPermissionModal}
          victoryId={selectedVictoryForPermission.id}
          dreamCategory={selectedVictoryForPermission.dreamCategory}
          onClose={() => {
            setShowPermissionModal(false);
            setSelectedVictoryForPermission(null);
          }}
          onGrant={handleGivePermission}
        />
      )}

      {/* Permissions List Modal */}
      <PermissionSlipList
        visible={showPermissionsList}
        permissions={permissionsToView}
        onClose={() => {
          setShowPermissionsList(false);
          setPermissionsToView([]);
        }}
      />

      <BottomNavbar onNavigate={onNavigate} activeTab="community" />
    </SafeAreaView>
  );
};

const createStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.bg_primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: themeColors.bg_secondary,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: themeColors.text_primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: themeColors.text_secondary,
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: themeColors.bg_secondary,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
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
    backgroundColor: themeColors.bg_primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: themeColors.text_primary,
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: themeColors.bg_secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    zIndex: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    width: '100%',
  },
  dropdownItemText: {
    fontSize: 12,
    color: themeColors.text_secondary,
    width: '100%',
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
    color: themeColors.text_primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: themeColors.text_secondary,
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
