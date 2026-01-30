import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Animated,
  FlatList,
  useWindowDimensions,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { AvatarIcon } from "../components/icons/SVGIcons";
import { GoalCard, type GoalCardData } from "../components/GoalCard";
import { HeroCard } from "../components/cards/HeroCard";
import { HeroCardSkeleton } from "../components/cards/HeroCardSkeleton";
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
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { areDependenciesCompleted } from "../utils/dependencyChecker";
import { fetchVictories, fetchInspirationVictories } from "../config/api";
import { VictoryCard as VictoryCardType } from "../types/community";
import { formatDate } from "../utils/communityUtils";

const HomeScreen = ({
  onNavigate,
}: {
  onNavigate: (screen: string, params?: any) => void;
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("recents");
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentVictories, setRecentVictories] = useState<VictoryCardType[]>([]);
  const [inspirationVictories, setInspirationVictories] = useState<VictoryCardType[]>([]);
  const [inspirationLoading, setInspirationLoading] = useState(false);
  const [recentVictoriesLoading, setRecentVictoriesLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const communityFadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const bottomEffectAnim = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  // Get user data from auth store
  const { userData, addToRecents, user, loadUserData, loading } = useAuthStore();
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  // Calculate column width (2 columns with 17px margins on each side and 14px gap)
  const columnWidth = (width - 34 - 14) / 2;

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
  const loadRecentVictories = async () => {
    setRecentVictoriesLoading(true);
    try {
      const response = await fetchVictories({ page: 1, limit: 3 });
      setRecentVictories(response.victories.slice(0, 2)); // Show only 2
    } catch (error) {
      console.error("Failed to load recent victories:", error);
      setRecentVictories([]);
    } finally {
      setRecentVictoriesLoading(false);
    }
  };

  // Load inspiration victories (victories user has Me Too'd)
  const loadInspirationVictories = async () => {
    if (!user?.uid) return;

    setInspirationLoading(true);
    try {
      const response = await fetchInspirationVictories(user.uid);
      setInspirationVictories(response.victories);
    } catch (error) {
      console.error("Failed to load inspiration victories:", error);
      setInspirationVictories([]);
    } finally {
      setInspirationLoading(false);
    }
  };

  useEffect(() => {
    loadRecentVictories();
    if (user?.uid) {
      loadInspirationVictories();
    }
  }, [user?.uid]);

  useEffect(() => {
    // Fade out and slide down
    fadeAnim.setValue(0);

    slideAnim.setValue(20);

    // Then fade in and slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab, fadeAnim, slideAnim]);

  useEffect(() => {
    // Animate community wins section on mount
    Animated.timing(communityFadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [communityFadeAnim]);

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
      console.error('[HomeScreen] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const contentOffsetY = event.nativeEvent.contentOffset.y;
        const contentHeight = event.nativeEvent.contentSize.height;
        const layoutHeight = event.nativeEvent.layoutMeasurement.height;

        // Check if we're at bottom (within 50px of the end)
        const isBottom = contentOffsetY + layoutHeight >= contentHeight - 50;

        // Handle bottom edge detection
        if (isBottom && !isAtBottom) {
          setIsAtBottom(true);
          // Trigger haptic feedback
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Trigger bottom effect animation
          Animated.sequence([
            Animated.timing(bottomEffectAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(bottomEffectAnim, {
              toValue: 0,
              duration: 300,
              delay: 1000,
              useNativeDriver: true,
            }),
          ]).start();
        } else if (!isBottom && isAtBottom) {
          setIsAtBottom(false);
        }
      },
    },
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

    return recentDreams.map((dream: any) => ({
      title: dream.dream || "",
      bgImage: dream.dream_image_bytes
        ? { uri: convertBinaryToImage(dream.dream_image_bytes) }
        : require("../assets/images/goal-podcast.png"),
      bgColor: dream.dream_card_bg || Color.colorBurlywood,
      progressColor: "#6B9BD1",
      threadId: dream.thread_id,
      status: dream.status,
    }));
  }, [userData?.dreams, userData?.recents]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>
      {/* <TopNavbar name="Ready to win, Kyla-Marie?" /> */}
      <BottomNavbar onNavigate={onNavigate} activeTab="home" />
      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#2D5BFF"
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

          {/* Streak Badge - Show if user has active streak */}
          {userData?.streak && userData.streak.current_streak > 0 && (
            <View
              style={{
                alignItems: "flex-end",
                paddingRight: 20,
                marginBottom: 16,
              }}>
              <TouchableOpacity onPress={() => onNavigate("StreakStats")}>
                <StreakBadge
                  streakCount={userData.streak.current_streak}
                  size="medium"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Hero Card Section - Show skeleton during refresh or actual card */}
          {isRefreshing && userData?.up_next ? (
            <HeroCardSkeleton />
          ) : (
            (() => {
              // console.log('[HomeScreen] up_next:', userData?.up_next);
              if (userData?.up_next) {
                console.log(
                  "[HomeScreen] Showing HeroCard for milestone:",
                  userData.up_next.milestone_title,
                );

                // Find the actual milestone object to check dependencies
                let rawMilestone: any = null;
                if (userData?.dreams) {
                  for (const dream of userData.dreams) {
                    if (dream.roadmap?.milestones) {
                      const found = dream.roadmap.milestones.find(
                        (m: any) => m.id === userData.up_next!.milestone_id,
                      );
                      if (found) {
                        rawMilestone = found;
                        break;
                      }
                    }
                  }
                }

                const dependenciesMet = areDependenciesCompleted(
                  rawMilestone,
                  userData?.dreams,
                );

                return (
                  <HeroCard
                    heroOpacity={heroOpacity}
                    heroScale={heroScale}
                    badge="Up next"
                    title={userData.up_next.milestone_title}
                    timeMinutes={parseTimeToMinutes(
                      userData.up_next.time_estimate,
                    )}
                    xpPoints={userData.up_next.xp_points}
                    challengeType={userData.up_next.challenge_type}
                    isLocked={!dependenciesMet}
                    onPress={() => {
                      if (dependenciesMet) {
                        onNavigate("Milestone", {
                          milestoneId: userData.up_next!.milestone_id,
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
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}>
              {activeTab === "recents" ? (
                /* Goal Cards Carousel, Skeletons, or No Recents */
                (loading || isRefreshing) && dreamCardsData.length === 0 ? (
                  <SkeletonDreamCardsCarousel />
                ) : isRefreshing && dreamCardsData.length > 0 ? (
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
                          marginRight: index < dreamCardsData.length - 1 ? 14 : 0,
                        }}>
                        <GoalCard
                          data={item}
                          onPress={() => {
                            if (item.status === "active" && item.threadId) {
                              addToRecents(item.threadId);
                            }
                            onNavigate("Dream");
                          }}
                        />
                      </View>
                    ))}
                  </Animated.ScrollView>
                ) : (
                  <NoRecentsState />
                )
              ) : (
                /* Inspiration Tab - Saved Victories */
                inspirationLoading || isRefreshing ? (
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
                    {inspirationVictories.map((victory) => (
                      <View key={victory.id} style={{ width: width - 20 }}>
                        <VictoryCard
                          victory={victory}
                          onBoost={() => {}}
                          onPress={() => {
                            // Navigate to victory detail if needed
                          }}
                        />
                      </View>
                    ))}
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
                      Visit the Community Wall and tap "Me Too" on victories that inspire you to save them here
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
                )
              )}
            </Animated.View>
          </View>

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
              {recentVictoriesLoading || isRefreshing ? (
                <CommunityWinCardSkeleton />
              ) : recentVictories.length > 0 ? (
                <Animated.ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingRight: 17,
                  }}
                  snapToInterval={width - 34}
                  decelerationRate="fast">
                  {recentVictories.map((victory) => (
                  <LinearGradient
                    key={victory.id}
                    colors={[themeColors.bg_secondary, themeColors.bg_secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 16,
                      paddingHorizontal: 18,
                      paddingVertical: 18,
                      flexDirection: "column",
                      gap: 14,
                      borderWidth: 1,
                      borderColor: themeColors.border,
                      overflow: "hidden",
                      marginRight: 12,
                      width: width - 34,
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
                        <AvatarIcon size={28} color={Color.colorLightsteelblue} />
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
                        <Text
                          style={{
                            color: "#A0A0A0",
                            fontSize: 12,
                            fontFamily: "InstrumentSans-Regular",
                          }}>
                          {victory.dreamTitle}
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

                    {/* Evidence Snippet */}
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
                      "{victory.evidenceSnippet}"
                    </Text>

                    {/* Stats Row */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}>
                        <View
                          style={{
                            backgroundColor: "rgba(0, 212, 170, 0.2)",
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 12,
                          }}>
                          <Text
                            style={{
                              color: "#00D4AA",
                              fontSize: 12,
                              fontWeight: "600",
                              fontFamily: "InstrumentSans-Medium",
                            }}>
                            +{victory.confidenceBoost}% confidence
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}>
                          <Text style={{ fontSize: 14 }}>⚡</Text>
                          <Text
                            style={{
                              color: "#F59E0B",
                              fontSize: 12,
                              fontWeight: "600",
                              fontFamily: "InstrumentSans-Medium",
                            }}>
                            {victory.courageBoosts}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{
                          color: "#A0A0A0",
                          fontSize: 11,
                          fontFamily: "InstrumentSans-Regular",
                        }}>
                        {formatDate(victory.createdAt)}
                      </Text>
                    </View>
                  </LinearGradient>
                ))}
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
