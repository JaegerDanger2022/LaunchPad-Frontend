import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Animated,
  FlatList,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { AvatarIcon } from "../components/icons/SVGIcons";
import { GoalCard, type GoalCardData } from "../components/GoalCard";
import { HeroCard } from "../components/cards/HeroCard";
import { TopNavbar } from "../components/TopNavbar";
import { BottomNavbar } from "../components/BottomNavbar";
import { TabBar, type TabType } from "../components/TabBar";
import { EmptyDreamsState } from "../components/EmptyDreamsState";
import { SkeletonDreamCards } from "../components/SkeletonDreamCards";
import { NoRecentsState } from "../components/NoRecentsState";
import { StreakBadge } from "../components/streak/StreakBadge";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";

const HomeScreen = ({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("recents");
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const communityFadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const bottomEffectAnim = useRef(new Animated.Value(0)).current;
  const loadingSpinAnim = useRef(new Animated.Value(0)).current;
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

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const contentOffsetY = event.nativeEvent.contentOffset.y;
        const contentHeight = event.nativeEvent.contentSize.height;
        const layoutHeight = event.nativeEvent.layoutMeasurement.height;

        // Check if we're at top (within 50px of the beginning)
        const isTop = contentOffsetY <= 50;

        // Check if we're at bottom (within 50px of the end)
        const isBottom = contentOffsetY + layoutHeight >= contentHeight - 50;

        // Handle top edge detection
        if (isTop && !isAtTop) {
          setIsAtTop(true);
          // Trigger haptic feedback
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

          // Set refreshing state and start loading animation
          setIsRefreshing(true);
          Animated.loop(
            Animated.timing(loadingSpinAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ).start();

          // Wait 1 second before refetching user data
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
          }
          refreshTimeoutRef.current = setTimeout(() => {
            if (user?.uid) {
              loadUserData(user.uid).then(() => {
                setIsRefreshing(false);
              });
            }
          }, 1000);
        } else if (!isTop && isAtTop) {
          setIsAtTop(false);
          // Clear timeout if user scrolls away before refresh completes
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
          }
          setIsRefreshing(false);
        }

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

  // If still loading user data, show skeleton
  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>
        <SkeletonDreamCards />
        <BottomNavbar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>
      {/* <TopNavbar name="Ready to win, Kyla-Marie?" /> */}
      <BottomNavbar onNavigate={onNavigate} activeTab="home" />
      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}>
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
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 10,
              }}>
              <StreakBadge
                streakCount={userData.streak.current_streak}
                size="medium"
              />
            </View>
          )}

          {/* Hero Card Section - Only show if up_next exists */}
          {(() => {
            // console.log('[HomeScreen] up_next:', userData?.up_next);
            if (userData?.up_next) {
              console.log(
                "[HomeScreen] Showing HeroCard for milestone:",
                userData.up_next.milestone_title,
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
                  onPress={() => onNavigate("Milestone")}
                />
              );
            } else {
              // console.log("[HomeScreen] up_next is null - no HeroCard shown");
              return null;
            }
          })()}

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
                /* Goal Cards Grid - 2 columns or No Recents */
                dreamCardsData.length > 0 ? (
                  <FlatList
                    data={dreamCardsData}
                    renderItem={({ item }) => (
                      <View style={{ width: columnWidth }}>
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
                    )}
                    keyExtractor={(_, index) => index.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 14 }}
                    scrollEnabled={false}
                    nestedScrollEnabled={false}
                  />
                ) : (
                  <NoRecentsState />
                )
              ) : (
                /* No Timeline Yet Placeholder */
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
                    No Timeline Yet
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
                    Discover goals and ideas from our community to get started
                    on your journey
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
          </View>

          {/* Community Wins Section */}
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
            <Text
              style={{
                fontSize: 20,
                textAlign: "left",
                color: themeColors.text_primary,
                fontFamily: "InstrumentSans-Bold",
                fontWeight: "700",
                marginBottom: 12,
              }}>
              Community Wins
            </Text>

            {/* Card Content */}
            <LinearGradient
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
                <Text
                  style={{
                    color: themeColors.text_primary,
                    fontFamily: "InstrumentSans-Bold",
                    fontWeight: "700",
                    fontSize: 16,
                  }}>
                  Jessica M.
                </Text>
              </View>

              {/* Achievement Text */}
              <Text
                style={{
                  fontSize: 14,
                  textAlign: "left",
                  color: themeColors.text_primary,
                  fontFamily: "InstrumentSans-Regular",
                  fontWeight: "400",
                  lineHeight: 20,
                }}>
                🎉 Just booked my solo trip to Tokyo!
              </Text>

              {/* Action Badge */}
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
                    +85 XP
                  </Text>
                </View>
                <Text
                  style={{
                    color: "#A0A0A0",
                    fontSize: 11,
                    fontFamily: "InstrumentSans-Regular",
                  }}>
                  2 hours ago
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* Loading Spinner Overlay */}
      {isRefreshing && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            marginLeft: -30,
            transform: [
              {
                rotate: loadingSpinAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              borderWidth: 3,
              borderColor: Color.colorOrangered,
              borderTopColor: "transparent",
            }}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
