import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Animated,
  FlatList,
  useWindowDimensions,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { GoalCard, type GoalCardData } from "../components/GoalCard";
import { BottomNavbar } from "../components/BottomNavbar";
import { CreateDreamModal } from "../components/CreateDreamModal";
import { DreamChoiceModal } from "../components/DreamChoiceModal";
import { DIYDreamModal } from "../components/DIYDreamModal";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { StreakBadge } from "../components/streak/StreakBadge";
import { fetchDreamsList } from "../config/api";


const dreamCreatingPhrases = [
  "Catching your dream…",
  "Shaping your vision…",
  "Mapping the road ahead…",
  "Breaking it into steps…",
  "Setting up your milestones…",
  "Almost there…",
];

const AllDreamsScreen = ({
  onNavigate,
  creatingDream,
}: {
  onNavigate: (screen: string, params?: any) => void;
  creatingDream?: boolean;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const { width } = useWindowDimensions();
  const [isDreamChoiceModalVisible, setIsDreamChoiceModalVisible] =
    useState(false);
  const [isCreateDreamModalVisible, setIsCreateDreamModalVisible] =
    useState(false);
  const [isDIYDreamModalVisible, setIsDIYDreamModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(creatingDream === true);
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Get user data from auth store
  const { userData, addToRecents, user, refreshDreamsFromCrud, isPremium } =
    useAuthStore();
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const streakData = userData?.streak;

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
    // Fade in and slide up on mount
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

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
  }, [fadeAnim, slideAnim]);

  // Sync creatingDream prop to isCreating state
  useEffect(() => {
    if (creatingDream === true && !isCreating) {
      setIsCreating(true);
    }
  }, [creatingDream]);

  // Cycle through phrases while the placeholder card is visible
  useEffect(() => {
    if (!isCreating) {
      setPhraseIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % dreamCreatingPhrases.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isCreating]);

  // Poll for the new dream; dismiss placeholder once it appears
  const knownDreamIds = useRef<Set<string>>(new Set());
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isCreating || !user?.uid) return;

    let cancelled = false;
    const uid = user.uid;

    const stopPolling = () => {
      cancelled = true;
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
      if (pollTimeout.current) {
        clearTimeout(pollTimeout.current);
        pollTimeout.current = null;
      }
    };

    const poll = async () => {
      if (cancelled) return;
      try {
        const res = await fetchDreamsList(uid, { summary: true });
        const dreams: any[] = res.dreams || [];
        // A new dream is "ready" once it exists AND has milestones persisted.
        // The summary endpoint back-fills milestones_count from the roadmap;
        // keep polling until that count is > 0 so the GoalCard can render
        // progress immediately.
        const newReady = dreams.some(
          (d) =>
            !knownDreamIds.current.has(d.thread_id) &&
            (d.milestones_count || 0) > 0,
        );
        if (newReady && !cancelled) {
          stopPolling();
          await refreshDreamsFromCrud(uid);
          setIsCreating(false);
          // Push notification is sent by the backend when the dream
          // is created, so no local notification is needed here.
        }
      } catch {
        // keep polling on transient errors
      }
    };

    const init = async () => {
      try {
        const res = await fetchDreamsList(uid, { summary: true });
        // Only treat dreams that already have milestones as "known".
        // The new dream may already exist in the DB (conversation_complete
        // fires after the dream doc is created) but won't have milestones
        // yet, so we must NOT add it to knownDreamIds — otherwise the poll
        // will never detect it becoming "ready".
        knownDreamIds.current = new Set(
          (res.dreams || [])
            .filter((d: any) => (d.milestones_count || 0) > 0)
            .map((d: any) => d.thread_id as string),
        );
      } catch {
        knownDreamIds.current = new Set();
      }

      if (cancelled) return;
      pollInterval.current = setInterval(poll, 7000);
      // Safety: dismiss placeholder after 500 s
      pollTimeout.current = setTimeout(() => {
        stopPolling();
        setIsCreating(false);
      }, 500000);
    };

    init();
    return () => stopPolling();
  }, [isCreating, user?.uid]);

  const convertBinaryToImage = (binaryData: string) => {
    try {
      return `data:image/jpeg;base64,${binaryData}`;
    } catch (error) {
      console.error("Error converting binary to image:", error);
      return null;
    }
  };

  // Sort dreams with active status first
  const sortedDreams: GoalCardData[] = useMemo(() => {
    if (!userData?.dreams || !Array.isArray(userData.dreams)) {
      return [];
    }

    // Separate active and non-active dreams
    const activeDreams = userData.dreams.filter(
      (dream: any) => dream.status === "active",
    );
    const inactiveDreams = userData.dreams.filter(
      (dream: any) => dream.status !== "active",
    );

    // Combine with active first
    const sorted = [...activeDreams, ...inactiveDreams];

    return sorted.map((dream: any) => {
      let progress = 0;
      const milestones = dream.roadmap?.milestones;
      if (milestones && milestones.length > 0) {
        const completed = milestones.filter(
          (m: any) => m.status === "completed",
        ).length;
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
  }, [userData?.dreams]);

  const handleGoalCardPress = (threadId: string, status: string) => {
    // Add to recents if status is active
    if (status === "active") {
      addToRecents(threadId);
    }
    onNavigate("Dream", { threadId });
  };

  const hasDreams = sortedDreams.length > 0 || isCreating;

  if (!hasDreams) {
    return (
      <>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 40,
            }}>
            {/* Empty State */}
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}>
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
                <Text style={{ fontSize: 60, opacity: 0.6 }}>🌙</Text>
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: themeColors.text_primary,
                  fontFamily: "InstrumentSans-Bold",
                  marginBottom: 12,
                  textAlign: "center",
                }}>
                No Dreams Yet
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: themeColors.text_secondary,
                  fontFamily: "InstrumentSans-Regular",
                  textAlign: "center",
                  lineHeight: 20,
                  marginBottom: 40,
                }}>
                Create your first dream to get started on your journey
              </Text>

              {/* Add New Dream Button */}
              <TouchableOpacity
                onPress={handleAddDreamPress}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: Color.colorOrangered,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: Color.colorOrangered,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}>
                <Plus size={28} color={Color.colorWhite} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
        <BottomNavbar onNavigate={onNavigate} activeTab="dreams" />

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
            setIsCreating(true);
          }}
        />

        {/* DIY Dream Modal */}
        <DIYDreamModal
          visible={isDIYDreamModalVisible}
          onClose={() => setIsDIYDreamModalVisible(false)}
          onDreamCreating={() => {
            setIsDIYDreamModalVisible(false);
            setIsCreating(true);
          }}
        />
      </>
    );
  }

  return (
    <>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>

        {/* Fixed Header row: title + streak chip */}
        <View
          style={{
            position: "absolute",
            top: insets.top,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 12,
            zIndex: 100,
            backgroundColor: themeColors.bg_primary,
          }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              fontFamily: "InstrumentSans-Bold",
              color: themeColors.text_primary,
            }}>
            Dreams
          </Text>
          {streakData && streakData.current_streak > 0 && (
            <StreakBadge
              streakCount={streakData.current_streak}
              size="medium"
            />
          )}
        </View>

        {/* Dreams Grid */}
        <Animated.ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: bottomPadding, paddingTop: 80 }}
          showsVerticalScrollIndicator={false}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginHorizontal: 17,
            }}>

            <FlatList
              data={
                isCreating
                  ? [{ __placeholder: true } as any, ...sortedDreams]
                  : sortedDreams
              }
              renderItem={({ item }) => {
                if (item.__placeholder) {
                  return (
                    <View style={{ width: columnWidth }}>
                      <LinearGradient
                        colors={["#fb6322", "#f79971"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          height: 228,
                          borderRadius: 10,
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 14,
                        }}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#fff",
                            fontFamily: "InstrumentSans-Bold",
                            textAlign: "center",
                            paddingHorizontal: 12,
                          }}>
                          {dreamCreatingPhrases[phraseIndex]}
                        </Text>
                      </LinearGradient>
                    </View>
                  );
                }
                return (
                  <View style={{ width: columnWidth }}>
                    <GoalCard
                      data={item}
                      onPress={() =>
                        handleGoalCardPress(
                          item.threadId || "",
                          item.status || "",
                        )
                      }
                    />
                  </View>
                );
              }}
              keyExtractor={(item, index) =>
                item.__placeholder ? "__placeholder__" : index.toString()
              }
              numColumns={2}
              columnWrapperStyle={{ gap: 14, marginBottom: 14 }}
              scrollEnabled={false}
              nestedScrollEnabled={false}
            />
          </Animated.View>
        </Animated.ScrollView>

        {/* Floating Add Button */}
        <View
          style={{
            position: "absolute",
            bottom: 110,
            left: 0,
            right: 0,
            alignItems: "center",
          }}>
          <TouchableOpacity
            onPress={handleAddDreamPress}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Color.colorOrangered,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: Color.colorOrangered,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}>
            <Plus size={28} color={Color.colorWhite} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <BottomNavbar onNavigate={onNavigate} activeTab="dreams" />

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
          setIsCreating(true);
        }}
      />

      {/* DIY Dream Modal */}
      <DIYDreamModal
        visible={isDIYDreamModalVisible}
        onClose={() => setIsDIYDreamModalVisible(false)}
        onDreamCreating={() => {
          setIsDIYDreamModalVisible(false);
          setIsCreating(true);
        }}
      />
    </>
  );
};

export default AllDreamsScreen;
