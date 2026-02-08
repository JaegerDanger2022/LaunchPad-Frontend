import * as React from "react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  Animated,
  useWindowDimensions,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Plus, Settings } from "lucide-react-native";
import { Color, getThemeColors, ChallengeTypeColors } from "../constants/GlobalStyles";
import { AvatarIcon } from "../components/icons/SVGIcons";
import { GoalCard, type GoalCardData } from "../components/GoalCard";
import { CreateDreamModal } from "../components/CreateDreamModal";
import { DreamChoiceModal } from "../components/DreamChoiceModal";
import { DIYDreamModal } from "../components/DIYDreamModal";
import { UpNextHeroCard } from "../components/cards/UpNextHeroCard";
import { UpNextHeroSkeleton } from "../components/cards/UpNextHeroSkeleton";
import { TopNavbar } from "../components/TopNavbar";
import { BottomNavbar } from "../components/BottomNavbar";
import { TabBar, type TabType } from "../components/TabBar";
import { EmptyDreamsState } from "../components/EmptyDreamsState";
import { SkeletonDreamCards } from "../components/SkeletonDreamCards";
import { SkeletonDreamCardsCarousel } from "../components/SkeletonDreamCardsCarousel";
import { VictoryCardSkeleton } from "../components/community/VictoryCardSkeleton";
import { CommunityWinCardSkeleton } from "../components/community/CommunityWinCardSkeleton";
import { NoRecentsState } from "../components/NoRecentsState";
import { StreakBadge } from "../components/streak/StreakBadge";
import { VictoryCard } from "../components/community/VictoryCard";
import { ResonanceIndicator } from "../components/community/ResonanceIndicator";
import { useAuthStore } from "../store/authStore";
import { useCommunityStore } from "../store/communityStore";
import { useThemeStore } from "../store/themeStore";
import { areDependenciesCompleted } from "../utils/dependencyChecker";
import { fetchVictories, fetchInspirationVictories, togglePinInspiration } from "../config/api";
import Toast from "react-native-toast-message";
import {
  VictoryCard as VictoryCardType,
  CommunityFeedItem,
} from "../types/community";
import { formatDate } from "../utils/communityUtils";

const HomeScreen = ({
  onNavigate,
}: {
  onNavigate: (screen: string, params?: any) => void;
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("recents");
  const [isDreamChoiceModalVisible, setIsDreamChoiceModalVisible] = useState(false);
  const [isCreateDreamModalVisible, setIsCreateDreamModalVisible] = useState(false);
  const [isDIYDreamModalVisible, setIsDIYDreamModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentVictories, setRecentVictories] = useState<CommunityFeedItem[]>(
    [],
  );
  const [inspirationVictories, setInspirationVictories] = useState<
    CommunityFeedItem[]
  >([]);
  const [inspirationLoading, setInspirationLoading] = useState(true);
  const [recentVictoriesLoading, setRecentVictoriesLoading] = useState(true);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const communityFadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const communityCarouselRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();

  // Get user data from auth store
  const { userData, addToRecents, user, loadUserData, loading, isPremium } =
    useAuthStore();
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const { toggleMeToo } = useCommunityStore();

  // Dream-limit gate: free = 2 total, pro = 3 active
  const dreamLimitReached = useMemo(() => {
    const dreams = userData?.dreams || [];
    if (isPremium) {
      return dreams.filter((d: any) => d.status === "active").length >= 3;
    }
    return dreams.length >= 2;
  }, [userData?.dreams, isPremium]);

  const handleAddDreamPress = () => {
    if (dreamLimitReached) {
      if (!isPremium) {
        onNavigate("Paywall");
      } else {
        Alert.alert(
          "Active Dream Limit",
          "You already have 3 active dreams. Complete or delete one before creating a new dream.",
        );
      }
      return;
    }
    setIsDreamChoiceModalVisible(true);
  };

  // Calculate column width (2 columns with 17px margins on each side and 14px gap)
  const columnWidth = (width - 34 - 14) / 2;

  // Bottom navbar height + safe area
  const bottomNavbarHeight = 60; // Approximate navbar height
  const bottomPadding = bottomNavbarHeight + Math.max(insets.bottom, 8) + 20;

  useEffect(() => {
    // Update status bar based on theme
    StatusBar.setBarStyle(
      theme === "light" ? "dark-content" : "light-content",
      true,
    );
  }, [theme]);

  useEffect(() => {
    // Refresh user data when HomeScreen mounts to ensure fresh state
    if (user?.uid) {
      // console.log('[HomeScreen] Mounting - refreshing user data');
      loadUserData(user.uid).catch((error: any) => {
        // console.error('[HomeScreen] Failed to refresh user data on mount:', error);
      });
    }
  }, []);

  // Load recent community victories
  const loadRecentVictories = useCallback(async () => {
    setRecentVictoriesLoading(true);
    try {
      const response = await fetchVictories({ page: 1, limit: 10 });
      // Filter to only show victory cards (not journey recaps) for recent wins section
      const victoryCards =
        response.feed
          ?.filter((item) => item.type === "victory_card")
          .slice(0, 10) || [];
      setRecentVictories(victoryCards);
    } catch (error) {
      console.error("Failed to load recent victories:", error);
      setRecentVictories([]);
    } finally {
      setRecentVictoriesLoading(false);
    }
  }, []);

  // Load inspiration victories (victories user has Me Too'd)
  const loadInspirationVictories = useCallback(async () => {
    if (!user?.uid) return;

    setInspirationLoading(true);
    try {
      const response = await fetchInspirationVictories(user.uid);
      // Add type field to make it compatible with CommunityFeedItem
      const victoryCards = response.victories.map((v) => ({
        ...v,
        type: "victory_card" as const,
      }));
      setInspirationVictories(victoryCards);
    } catch (error) {
      console.error("Failed to load inspiration victories:", error);
      setInspirationVictories([]);
    } finally {
      setInspirationLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadRecentVictories();
    if (user?.uid) {
      loadInspirationVictories();
    }
  }, [user?.uid]);

  // Reload inspiration victories when tab comes back into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        loadInspirationVictories();
      }
    }, [user?.uid, loadInspirationVictories])
  );

  useEffect(() => {
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  }, [activeTab]);

  useEffect(() => {
    // Animate community wins section on mount
    Animated.timing(communityFadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [communityFadeAnim]);

  // Autoplay carousel for Community Wins
  useEffect(() => {
    if (recentVictories.length <= 1) return; // No autoplay if 1 or fewer cards

    const cardWidth = width - 34;
    const cardSpacing = 12;

    const autoplayInterval = setInterval(() => {
      setCurrentCarouselIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % recentVictories.length;

        // Scroll to next card - account for card width + spacing
        if (communityCarouselRef.current) {
          communityCarouselRef.current.scrollTo({
            x: nextIndex * (cardWidth + cardSpacing),
            animated: true,
          });
        }

        return nextIndex;
      });
    }, 4000); // Change card every 4 seconds

    return () => clearInterval(autoplayInterval);
  }, [recentVictories.length, width]);

  // Pull to refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (user?.uid) {
        await loadUserData(user.uid);
        // Reload recent victories
        await loadRecentVictories();
        // Reload inspiration victories
        await loadInspirationVictories();
      }
    } catch (error) {
      console.error("[HomeScreen] Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Unpin from inspiration handler
  const handleUnpin = async (victoryId: string) => {
    if (!user?.uid) return;

    // Optimistic removal
    setInspirationVictories(prev => prev.filter(v => v.id !== victoryId));

    try {
      await togglePinInspiration(victoryId, user.uid);
      Toast.show({
        type: 'success',
        text1: 'Removed from Inspiration',
        visibilityTime: 1500,
      });
    } catch (err) {
      // Rollback — reload from server
      await loadInspirationVictories();
      Toast.show({
        type: 'error',
        text1: 'Failed to unpin',
        text2: 'Please try again',
        visibilityTime: 2000,
      });
    }
  };

  // Me Too handler for community wins carousel
  const handleMeToo = async (victoryId: string) => {
    const item = recentVictories.find((v) => v.id === victoryId);
    if (!item) return;

    const previousState = item.hasUserMeTooed;
    const previousCount = item.meTooCount;

    // Optimistic update
    setRecentVictories((prev) =>
      prev.map((v) =>
        v.id === victoryId
          ? {
              ...v,
              meTooCount: previousState ? v.meTooCount - 1 : v.meTooCount + 1,
              hasUserMeTooed: !previousState,
            }
          : v
      )
    );

    try {
      const result = await toggleMeToo(victoryId);
      // Sync with server
      setRecentVictories((prev) =>
        prev.map((v) =>
          v.id === victoryId
            ? { ...v, meTooCount: result.newCount, hasUserMeTooed: result.added }
            : v
        )
      );
    } catch {
      // Rollback on error
      setRecentVictories((prev) =>
        prev.map((v) =>
          v.id === victoryId
            ? { ...v, meTooCount: previousCount, hasUserMeTooed: previousState }
            : v
        )
      );
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true },
  );

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.5],
    extrapolate: "clamp",
  });

  const heroScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.95],
    extrapolate: "clamp",
  });

  const convertBinaryToImage = (binaryData: string) => {
    try {
      return `data:image/jpeg;base64,${binaryData}`;
    } catch (error) {
      console.error("Error converting binary to image:", error);
      return null;
    }
  };

  const parseTimeToMinutes = (timeEstimate: string): number => {
    const match = timeEstimate.match(/(\d+)/);
    return match ? parseInt(match[1]) : 30;
  };

  const dreamCardsData: GoalCardData[] = useMemo(() => {
    if (!userData?.dreams || !Array.isArray(userData.dreams)) {
      return [];
    }

    const recentsArray = userData.recents || [];

    // Filter and map only recent dreams
    const recentDreams = recentsArray
      .map((threadId: string) =>
        userData.dreams.find((dream: any) => dream.thread_id === threadId),
      )
      .filter((dream: any) => dream !== undefined);

    return recentDreams.map((dream: any) => {
      // Compute progress: prefer full milestones array, fall back to summary metadata
      let progress = 0;
      const milestones = dream.roadmap?.milestones;
      if (milestones && milestones.length > 0) {
        const completed = milestones.filter((m: any) => m.status === "completed").length;
        progress = (completed / milestones.length) * 100;
      } else if (dream._metadata) {
        const total = dream._metadata.milestones_count || 0;
        const completed = dream._metadata.completed_milestones_count || 0;
        progress = total > 0 ? (completed / total) * 100 : 0;
      }

      return {
        title: dream.dream || "",
        bgImage: dream.is_custom
          ? require("../assets/images/customDream.png")
          : dream.dream_image_bytes
            ? { uri: convertBinaryToImage(dream.dream_image_bytes) }
            : require("../assets/images/customDream.png"),
        bgColor: dream.dream_card_bg || Color.colorBurlywood,
        progressColor: "#A855F7",
        progress,
        threadId: dream.thread_id,
        status: dream.status,
      };
    });
  }, [userData?.dreams, userData?.recents]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>
      {/* <TopNavbar name="Ready to win, Kyla-Marie?" /> */}
      <BottomNavbar onNavigate={onNavigate} activeTab="home" />
      {/* <DebugOverlay /> */}
      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="white"
            colors={["white"]}
            progressBackgroundColor="transparent"
          />
        }>
        <View
          style={{
            flexDirection: "column",
            backgroundColor: themeColors.bg_primary,
            overflow: "hidden",
          }}>
          {/* Background gradient container */}
          <View
            style={{
              position: "absolute",
              top: -9,
              left: -3,
              backgroundColor: themeColors.bg_primary,
              width: 442,
              height: 941,
            }}
          />

          {/* Top row: Settings gear (left) + Streak badge (right) */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 16,
            }}>
            <TouchableOpacity onPress={() => onNavigate("Settings")} activeOpacity={0.6} style={{ padding: 4 }}>
              <Settings size={30} color={themeColors.text_secondary} strokeWidth={2} />
            </TouchableOpacity>
            {userData?.streak && userData.streak.current_streak > 0 ? (
              <StreakBadge
                streakCount={userData.streak.current_streak}
                size="medium"
              />
            ) : <View />}
          </View>

          {/* Hero Card Section - Show skeleton during refresh or actual card */}
          {isRefreshing && userData?.up_next ? (
            <UpNextHeroSkeleton />
          ) : (
            (() => {
              // console.log('[HomeScreen] up_next:', userData?.up_next);
              if (userData?.up_next) {
                // console.log(
                //   "[HomeScreen] Showing HeroCard for milestone:",
                //   userData.up_next.milestone_title,
                // );

                // Find the actual milestone object to check dependencies
                let rawMilestone: any = null;
                let milestoneThreadId: string | null = null;
                let milestonesLoaded = false;

                if (userData?.dreams) {
                  for (const dream of userData.dreams) {
                    if (dream.roadmap?.milestones) {
                      const found = dream.roadmap.milestones.find(
                        (m: any) => m.id === userData.up_next!.milestone_id,
                      );
                      if (found) {
                        rawMilestone = found;
                        milestoneThreadId = dream.thread_id;
                        milestonesLoaded = dream.roadmap.milestones.length > 0;
                        break;
                      }
                    }
                  }
                }

                // SAFETY CHECK: Default to locked if milestone data isn't fully loaded yet
                const dependenciesMet = milestonesLoaded
                  ? areDependenciesCompleted(rawMilestone, userData?.dreams)
                  : false;

                return (
                  <UpNextHeroCard
                    heroOpacity={heroOpacity}
                    heroScale={heroScale}
                    title={userData.up_next.milestone_title}
                    timeMinutes={parseTimeToMinutes(
                      userData.up_next.time_estimate,
                    )}
                    xpPoints={userData.up_next.xp_points}
                    challengeType={userData.up_next.challenge_type}
                    isLocked={!dependenciesMet}
                    onPress={() => {
                      if (dependenciesMet && milestoneThreadId) {
                        onNavigate("Milestone", {
                          milestoneId: userData.up_next!.milestone_id,
                          threadId: milestoneThreadId,
                        });
                      }
                    }}
                  />
                );
              } else {
                // console.log("[HomeScreen] up_next is null - no HeroCard shown");
                return null;
              }
            })()
          )}

          {/* Recents and Favorites Section */}
          <View
            style={{
              flexDirection: "column",
              marginHorizontal: 17,
              marginTop: 20,
              marginBottom: 20,
              zIndex: 10,
            }}>
            {(() => {
              const noDreams = !loading && userData && (!userData.dreams || userData.dreams.length === 0) && !userData.dreams_count;
              return (
              <>
                <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }}>
                  {activeTab === "recents" ? (
                    /* Goal Cards Carousel, Skeletons, No Recents, or No Dreams */
                    noDreams ? (
                      <View
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          paddingVertical: 48,
                          paddingHorizontal: 24,
                        }}>
                        <View
                          style={{
                            width: 96,
                            height: 96,
                            borderRadius: 48,
                            backgroundColor: theme === "dark" ? "rgba(251, 99, 34, 0.15)" : "rgba(251, 99, 34, 0.1)",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 20,
                          }}>
                          <Plus size={40} color={Color.colorOrangered} />
                        </View>
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "700",
                            color: themeColors.text_primary,
                            fontFamily: "InstrumentSans-Bold",
                            marginBottom: 8,
                            textAlign: "center",
                          }}>
                          Create a Dream
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: themeColors.text_secondary,
                            fontFamily: "InstrumentSans-Regular",
                            textAlign: "center",
                            lineHeight: 20,
                            marginBottom: 24,
                          }}>
                          You don't have any dreams yet. Tap the button below to get started.
                        </Text>
                        <TouchableOpacity
                          onPress={handleAddDreamPress}
                          activeOpacity={0.8}
                          style={{
                            backgroundColor: Color.colorOrangered,
                            borderRadius: 28,
                            paddingHorizontal: 28,
                            paddingVertical: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}>
                          <Plus size={20} color={Color.colorWhite} />
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "700",
                              color: Color.colorWhite,
                              fontFamily: "InstrumentSans-Bold",
                            }}>
                            New Dream
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : loading || isRefreshing || (dreamCardsData.length === 0 && (userData?.recents?.length || (userData?.dreams_count && (!userData.dreams || userData.dreams.length === 0)))) ? (
                      <SkeletonDreamCardsCarousel />
                    ) : dreamCardsData.length > 0 ? (
                      <Animated.ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                          paddingTop: 20,
                        }}
                        snapToInterval={columnWidth + 14}
                        decelerationRate="fast">
                        {dreamCardsData.map((item, index) => (
                          <View
                            key={index}
                            style={{
                              width: columnWidth,
                              marginRight:
                                index < dreamCardsData.length - 1 ? 14 : 0,
                            }}>
                            <GoalCard
                              data={item}
                              onPress={() => {
                                if (item.status === "active" && item.threadId) {
                                  addToRecents(item.threadId);
                                }
                                onNavigate("Dream", { threadId: item.threadId });
                              }}
                            />
                          </View>
                        ))}
                      </Animated.ScrollView>
                    ) : (
                      <NoRecentsState />
                    )
                  ) : /* Inspiration Tab - Saved Victories */
                  loading || inspirationLoading || isRefreshing ? (
                    <VictoryCardSkeleton />
                  ) : inspirationVictories.length > 0 ? (
                    <Animated.ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        paddingRight: 17,
                      }}
                      snapToInterval={width - 20}
                      decelerationRate="fast"
                      style={{ marginLeft: -17 }}>
                      {inspirationVictories.map((item) => {
                        // Type guard - we've already added type field
                        if (item.type !== "victory_card") return null;
                        const victory = item;

                        return (
                          <View key={victory.id} style={{ width: width - 20 }}>
                            <VictoryCard
                              victory={victory}
                              onPin={() => handleUnpin(victory.id)}
                              isPinned={true}
                            />
                          </View>
                        );
                      })}
                    </Animated.ScrollView>
                  ) : (
                    /* No Inspiration Yet Placeholder */
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 60,
                        paddingHorizontal: 40,
                      }}>
                      {/* Decorative Circle Background */}
                      <View
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 60,
                          backgroundColor: "#F0F0F0",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 24,
                        }}>
                        {/* Lightbulb Icon */}
                        <Text
                          style={{
                            fontSize: 60,
                            opacity: 0.6,
                          }}>
                          💡
                        </Text>
                      </View>

                      {/* Main Text */}
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "700",
                          color: themeColors.text_primary,
                          fontFamily: "InstrumentSans-Bold",
                          marginBottom: 12,
                          textAlign: "center",
                        }}>
                        No Inspiration Yet
                      </Text>

                      {/* Subtitle */}
                      <Text
                        style={{
                          fontSize: 14,
                          color: themeColors.text_secondary,
                          fontFamily: "InstrumentSans-Regular",
                          textAlign: "center",
                          lineHeight: 20,
                          marginBottom: 24,
                        }}>
                        Visit the Community Wall and tap "Me Too" on victories that
                        inspire you to save them here
                      </Text>

                      {/* Decorative Dots */}
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 6,
                          marginTop: 12,
                        }}>
                        {[1, 2, 3].map((dot) => (
                          <View
                            key={dot}
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: dot === 2 ? "#00D4AA" : "#E0E0E0",
                            }}
                          />
                        ))}
                      </View>
                    </View>
                  )}
                </Animated.View>
              </>
              );
            })()}
          </View>

          {/* Dream Choice Modal */}
          <DreamChoiceModal
            visible={isDreamChoiceModalVisible}
            onClose={() => setIsDreamChoiceModalVisible(false)}
            onSelectLuna={() => {
              setIsDreamChoiceModalVisible(false);
              setIsCreateDreamModalVisible(true);
            }}
            onSelectDIY={() => {
              setIsDreamChoiceModalVisible(false);
              setIsDIYDreamModalVisible(true);
            }}
          />

          {/* Create Dream Modal (Luna chatbot) */}
          <CreateDreamModal
            visible={isCreateDreamModalVisible}
            onClose={() => setIsCreateDreamModalVisible(false)}
            onDreamCreating={() => {
              setIsCreateDreamModalVisible(false);
              onNavigate("AllDreams", { creatingDream: true });
            }}
          />

          {/* DIY Dream Modal */}
          <DIYDreamModal
            visible={isDIYDreamModalVisible}
            onClose={() => setIsDIYDreamModalVisible(false)}
            onDreamCreating={() => {
              setIsDIYDreamModalVisible(false);
              onNavigate("AllDreams", { creatingDream: true });
            }}
          />

          {/* Community Wins Section - Always show, with skeleton on load */}
          <Animated.View
            style={{
              flexDirection: "column",
              marginHorizontal: 17,
              marginTop: 20,
              marginBottom: 20,
              zIndex: 10,
              opacity: communityFadeAnim,
              transform: [
                {
                  translateY: communityFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}>
            {/* Title */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  textAlign: "left",
                  color: themeColors.text_primary,
                  fontFamily: "InstrumentSans-Bold",
                  fontWeight: "700",
                }}>
                Community Wins
              </Text>
              <TouchableOpacity onPress={() => onNavigate("Community")}>
                <Text
                  style={{
                    fontSize: 14,
                    color: Color.colorOrangered,
                    fontFamily: "InstrumentSans-Medium",
                    fontWeight: "600",
                  }}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {/* Victory Cards Carousel or Skeletons */}
            {loading || recentVictoriesLoading || isRefreshing ? (
              <CommunityWinCardSkeleton />
            ) : recentVictories.length > 0 ? (
              <Animated.ScrollView
                ref={communityCarouselRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingLeft: 17,
                  paddingRight: 17,
                }}
                snapToInterval={width - 34 + 12}
                decelerationRate="fast"
                pagingEnabled={false}
                style={{ marginLeft: -17 }}>
                {recentVictories.map((item, index) => {
                  // Type guard - we've already filtered to only victory cards
                  if (item.type !== "victory_card") return null;
                  const victory = item;

                  return (
                    <View
                      key={victory.id}
                      style={{
                        borderRadius: 20,
                        overflow: "hidden",
                        marginRight:
                          index < recentVictories.length - 1 ? 12 : 0,
                        width: width - 34,
                        borderWidth: 1,
                        borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.18)" : "rgba(0, 0, 0, 0.1)",
                      }}>
                      {/* Gradient accent strip — matches Community VictoryCard */}
                      <LinearGradient
                        colors={[
                          victory.challengeType
                            ? ChallengeTypeColors[victory.challengeType as keyof typeof ChallengeTypeColors] || Color.colorOrangered
                            : Color.colorOrangered,
                          (victory.challengeType
                            ? ChallengeTypeColors[victory.challengeType as keyof typeof ChallengeTypeColors] || Color.colorOrangered
                            : Color.colorOrangered) + "00",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ height: 3 }}
                      />
                      <BlurView
                        intensity={60}
                        tint={theme === "dark" ? "dark" : "light"}
                        style={{
                          flex: 1,
                          paddingHorizontal: 18,
                          paddingVertical: 18,
                          flexDirection: "column",
                          gap: 14,
                          backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                        }}>
                      {/* Avatar and User Info Row */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                        }}>
                        {/* Avatar Circle */}
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: "rgba(180, 197, 253, 0.4)",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                          <AvatarIcon
                            size={28}
                            color={Color.colorLightsteelblue}
                          />
                        </View>

                        {/* User Name */}
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: themeColors.text_primary,
                              fontFamily: "InstrumentSans-Bold",
                              fontWeight: "700",
                              fontSize: 16,
                            }}>
                            {victory.userDisplayName}
                          </Text>
                        </View>
                      </View>

                      {/* Milestone Title */}
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          textAlign: "left",
                          color: themeColors.text_primary,
                          fontFamily: "InstrumentSans-SemiBold",
                          lineHeight: 20,
                        }}>
                        {victory.milestoneTitle}
                      </Text>

                      {/* Evidence Snippet - only show if proof exists */}
                      {victory.evidenceSnippet ? (
                        <Text
                          style={{
                            fontSize: 14,
                            textAlign: "left",
                            color: themeColors.text_secondary,
                            fontFamily: "InstrumentSans-Regular",
                            fontWeight: "400",
                            lineHeight: 20,
                            fontStyle: "italic",
                          }}>
                          {victory.evidenceSnippet}
                        </Text>
                      ) : null}

                      {/* Stats Row */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: "auto",
                        }}>
                        <ResonanceIndicator
                          meTooCount={victory.meTooCount}
                          hasUserMeTooed={victory.hasUserMeTooed}
                          onPress={victory.userId !== user?.uid ? () => handleMeToo(victory.id) : undefined}
                          size="small"
                          disabled={victory.userId === user?.uid}
                        />
                        <Text
                          style={{
                            color: "#A0A0A0",
                            fontSize: 11,
                            fontFamily: "InstrumentSans-Regular",
                          }}>
                          {formatDate(victory.createdAt)}
                        </Text>
                      </View>
                      </BlurView>
                    </View>
                  );
                })}
              </Animated.ScrollView>
            ) : (
              <View style={{ paddingVertical: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: themeColors.text_secondary,
                    fontFamily: "InstrumentSans-Regular",
                    textAlign: "center",
                  }}>
                  No community wins yet
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
