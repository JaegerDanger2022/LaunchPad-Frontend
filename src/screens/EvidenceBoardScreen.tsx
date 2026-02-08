import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Animated,
  Easing,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ParallaxHeader } from "../components/ParallaxHeader";
import {
  Color,
  getThemeColors,
  EvidenceBoardColors,
  ChallengeTypeColors,
} from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { BottomNavbar } from "../components/BottomNavbar";
import { fetchDreamDetails } from "../config/api";
import {
  DreamCard,
  ProofPointItem,
  JourneyRecapModal,
  Dream,
  ProofPoint,
  formatDate,
  getCategoryGradient,
} from "../components/evidenceboard";

const EvidenceBoardScreen = ({
  onNavigate,
}: {
  onNavigate: (screen: string, params?: any) => void;
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();

  // Bottom navbar height + safe area
  const bottomNavbarHeight = 60; // Approximate navbar height
  const bottomPadding = bottomNavbarHeight + Math.max(insets.bottom, 8) + 20;
  const { width } = useWindowDimensions();
  const { userData, user } = useAuthStore();

  const [expandedDreamId, setExpandedDreamId] = useState<number | null>(null);
  const [showRecap, setShowRecap] = useState(false);
  const [isLoadingDream, setIsLoadingDream] = useState(false);
  // Track which completed dream should play fireworks (plays once per expand)
  const [fireworksDreamId, setFireworksDreamId] = useState<number | null>(null);
  const fireworksRef = useRef<LottieView>(null);
  // Cache of fully-fetched dream data keyed by thread_id
  const [fullDreamsCache, setFullDreamsCache] = useState<Record<string, any>>(
    {},
  );

  // Animation values for expand/collapse
  const expandAnim = useRef(new Animated.Value(0)).current;

  // Update status bar based on theme
  useEffect(() => {
    StatusBar.setBarStyle(
      theme === "light" ? "dark-content" : "light-content",
      true,
    );
    StatusBar.setBackgroundColor(themeColors.bg_primary, true);
  }, [theme, themeColors.bg_primary]);

  // Fetch full dream data when a card is expanded
  useEffect(() => {
    if (expandedDreamId == null || !user?.uid) {
      setIsLoadingDream(false);
      return;
    }
    // Already cached?
    if (fullDreamsCache[expandedDreamId as any]) {
      setIsLoadingDream(false);
      return;
    }

    const load = async () => {
      setIsLoadingDream(true);
      try {
        const fullDream = await fetchDreamDetails(
          user.uid,
          String(expandedDreamId),
        );
        if (fullDream) {
          setFullDreamsCache((prev) => ({
            ...prev,
            [expandedDreamId as any]: fullDream,
          }));
        }
      } catch (e) {
        console.error("[EvidenceBoard] Failed to fetch full dream:", e);
      } finally {
        setIsLoadingDream(false);
      }
    };
    load();
  }, [expandedDreamId, user?.uid]);

  // Trigger animation when dream is expanded
  useEffect(() => {
    if (expandedDreamId !== null) {
      Animated.timing(expandAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // Layout changes require this to be false
      }).start();
    } else {
      Animated.timing(expandAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start();
      setFireworksDreamId(null);
    }
  }, [expandedDreamId, expandAnim]);

  // Map userData.dreams to Dream format
  const dreams: Dream[] = useMemo(() => {
    if (!userData?.dreams || !Array.isArray(userData.dreams)) {
      return [];
    }

    return userData.dreams.map((dreamData: any) => {
      // Use fully-fetched data if cached, otherwise fall back to summary
      const source = fullDreamsCache[dreamData.thread_id] || dreamData;

      // Extract proof points from roadmap milestones
      const proofPoints: ProofPoint[] = [];
      if (
        source.roadmap?.milestones &&
        Array.isArray(source.roadmap.milestones)
      ) {
        proofPoints.push(
          ...source.roadmap.milestones.map((milestone: any) => ({
            id: milestone.id,
            date: milestone.completedDate || "",
            mission: milestone.title,
            completed: milestone.status === "completed",
            impact: "high" as const,
          })),
        );
      }

      // Calculate progress: use _metadata counts when full data not yet loaded
      const totalMilestones =
        source._metadata?.milestones_count ||
        source.roadmap?.milestones?.length ||
        0;
      const completedCount =
        source._metadata?.completed_milestones_count ||
        proofPoints.filter((p) => p.completed).length;
      const progress =
        totalMilestones > 0
          ? Math.min(100, Math.round((completedCount / totalMilestones) * 100))
          : 0;

      const currentScore = source.metadata?.score || 0;

      return {
        id: dreamData.thread_id,
        title: dreamData.dream,
        category: (dreamData.roadmap?.category || "") as unknown as
          | "travel"
          | "career"
          | "financial"
          | "other",
        status: dreamData.status as "in-progress" | "completed",
        isComplete: dreamData.isComplete || false,
        progress,
        startDate: dreamData.created_at || new Date().toISOString(),
        targetDate: "",
        completedDate: dreamData.completed_at,
        couragePoints: currentScore,
        proofPoints,
        dream_card_bg: dreamData.dream_card_bg,
      };
    });
  }, [userData, fullDreamsCache]);

  // Use real data if available, otherwise use fallback
  const displayDreams =
    dreams.length > 0
      ? dreams
      : // Fallback sample data if no userData
        ([] as Dream[]);

  // Trigger fireworks when a completed dream finishes loading its details
  useEffect(() => {
    if (expandedDreamId == null || isLoadingDream) return;
    const expandedDream = displayDreams.find((d) => d.id === expandedDreamId);
    if (expandedDream?.isComplete) {
      setFireworksDreamId(expandedDreamId);
    }
  }, [expandedDreamId, isLoadingDream, displayDreams]);

  const activeDream =
    displayDreams.find((d) => d.id === expandedDreamId) || null;
  const completedMissions =
    activeDream?.proofPoints.filter((p: ProofPoint) => p.completed) || [];
  const totalMissions = activeDream?.proofPoints.length || 0;

  // For Journey Recap Modal - use activeDream if available
  const recapDream = activeDream;

  // Calculate total stats across all dreams
  const totalStats = useMemo(() => {
    const totalActions = displayDreams.reduce(
      (sum, dream) => sum + dream.proofPoints.filter((p) => p.completed).length,
      0,
    );
    const totalCourage = displayDreams.reduce(
      (sum, dream) => sum + dream.couragePoints,
      0,
    );
    const completedDreams = displayDreams.filter((d) => d.isComplete).length;

    return { totalActions, totalCourage, completedDreams };
  }, [displayDreams]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: themeColors.bg_primary }}
      edges={["left", "right"]}>
      <ParallaxHeader
        backgroundColor={themeColors.bg_primary}
        backgroundImage={require("../assets/images/evidence board.png")}
        title="✨ Evidence Board"
        subtitle={`${totalStats.totalActions} Actions • ${totalStats.totalCourage} Courage Points • ${displayDreams.length} Dreams`}
        titleStyle={{
          fontSize: 28,
          fontWeight: "bold",
          color: Color.colorWhite,
        }}
        subtitleStyle={{
          fontSize: 14,
          color: "rgba(255, 255, 255, 0.9)",
        }}
        parallaxHeight={220}
        headerHeight={90}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: bottomPadding,
        }}
        showsVerticalScrollIndicator={false}>
        {displayDreams.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 40,
            }}>
            <Text
              style={{
                fontSize: 16,
                color: EvidenceBoardColors.text.secondary,
                textAlign: "center",
              }}>
              No dreams yet. Create one to get started!
            </Text>
          </View>
        ) : (
          <>
            {/* Dream Cards with Expandable Evidence Board */}
            <View
              style={{
                width: "100%",
                marginBottom: 32,
              }}>
              {displayDreams.map((dream) => {
                const isExpanded = expandedDreamId === dream.id;
                const completedMissions = dream.proofPoints.filter(
                  (p: ProofPoint) => p.completed,
                );

                return (
                  <Animated.View
                    key={dream.id}
                    style={{
                      marginBottom: 16,
                      opacity: expandAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1],
                      }),
                    }}>
                    {/* Dream Card Container - Expands to show evidence board */}
                    <View
                      style={{
                        backgroundColor: isExpanded
                          ? isDark
                            ? "#1b1f52"
                            : EvidenceBoardColors.white
                          : dream.dream_card_bg ||
                            (isDark
                              ? "#2B2D56"
                              : EvidenceBoardColors.dream_card_bg),
                        borderRadius: 24,
                        padding: isExpanded ? 32 : 0,
                        shadowColor: isExpanded
                          ? isDark
                            ? "rgba(0,0,0,0.5)"
                            : "#000"
                          : "transparent",
                        shadowOffset: isExpanded
                          ? { width: 0, height: 10 }
                          : { width: 0, height: 0 },
                        shadowOpacity: isExpanded ? (isDark ? 0.3 : 0.1) : 0,
                        shadowRadius: isExpanded ? 20 : 0,
                        elevation: isExpanded ? 8 : 0,
                      }}>
                      {/* Dream Card Header */}
                      <TouchableOpacity
                        onPress={() =>
                          setExpandedDreamId(
                            expandedDreamId === dream.id ? null : dream.id,
                          )
                        }
                        activeOpacity={0.7}>
                        <DreamCard
                          dream={dream}
                          isSelected={isExpanded}
                          isDark={isDark}
                          onPress={() =>
                            setExpandedDreamId(
                              expandedDreamId === dream.id ? null : dream.id,
                            )
                          }
                        />
                      </TouchableOpacity>

                      {/* Fireworks animation for completed dreams */}
                      {isExpanded && dream.isComplete && fireworksDreamId === dream.id && (
                        <View
                          pointerEvents="none"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 10,
                            overflow: "hidden",
                            borderRadius: 24,
                          }}>
                          <LottieView
                            ref={fireworksRef}
                            source={require("../assets/animations/fireworks.json")}
                            style={{ width: "100%", height: "100%" }}
                            autoPlay
                            loop={false}
                            speed={1}
                            onAnimationFinish={() => setFireworksDreamId(null)}
                          />
                        </View>
                      )}

                      {/* Expanded Evidence Board Content - Inside the card */}
                      {isExpanded && (
                        <View
                          style={{
                            marginTop: 24,
                            paddingTop: 24,
                            borderTopWidth: 1,
                            borderTopColor: isDark
                              ? "rgba(255,255,255,0.1)"
                              : EvidenceBoardColors.gray300,
                          }}>
                          {/* Loading Indicator */}
                          {isLoadingDream && (
                            <View
                              style={{
                                paddingVertical: 40,
                                alignItems: "center",
                                justifyContent: "center",
                              }}>
                              <ActivityIndicator
                                size="large"
                                color={isDark ? "#A855F7" : "#8B5CF6"}
                              />
                              <Text
                                style={{
                                  marginTop: 12,
                                  fontSize: 14,
                                  color: isDark ? "#b0b0b0" : EvidenceBoardColors.text.secondary,
                                }}>
                                Loading details...
                              </Text>
                            </View>
                          )}

                          {/* Progress Overview */}
                          {!isLoadingDream && (
                          <>
                          <View
                            style={{
                              marginBottom: 32,
                              paddingBottom: 32,
                              borderBottomWidth: 1,
                              borderBottomColor: isDark
                                ? "rgba(255,255,255,0.1)"
                                : EvidenceBoardColors.gray300,
                            }}>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 24,
                              }}>
                              <View style={{ flex: 1 }}>
                                <Text
                                  style={{
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    color: isDark
                                      ? "#ffffff"
                                      : EvidenceBoardColors.text.primary,
                                    marginBottom: 8,
                                  }}>
                                  Journey Details
                                </Text>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      color: isDark
                                        ? "#b0b0b0"
                                        : EvidenceBoardColors.text.secondary,
                                    }}>
                                    📅 Started {formatDate(dream.startDate)}
                                  </Text>
                                </View>
                              </View>
                              <View style={{ flexDirection: "row", gap: 8 }}>
                                {dream.isComplete && (
                                  <TouchableOpacity
                                    style={{
                                      backgroundColor: isDark
                                        ? "rgba(251, 191, 36, 0.15)"
                                        : "#FEF3C7",
                                      paddingHorizontal: 16,
                                      paddingVertical: 12,
                                      borderRadius: 12,
                                    }}
                                    onPress={() => setShowRecap(true)}>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        fontWeight: "600",
                                        color: isDark
                                          ? "#FBBF24"
                                          : EvidenceBoardColors.text.primary,
                                      }}>
                                      🏆 View Journey Recap
                                    </Text>
                                  </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                  style={{
                                    backgroundColor: "transparent",
                                    paddingHorizontal: 12,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  onPress={() => setExpandedDreamId(null)}>
                                  <Text
                                    style={{
                                      fontSize: 20,
                                      color: isDark
                                        ? "#b0b0b0"
                                        : EvidenceBoardColors.text.secondary,
                                    }}>
                                    ↓
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>

                            {/* Progress Bar */}
                            <View style={{ marginBottom: 24 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  marginBottom: 8,
                                }}>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontWeight: "600",
                                    color: isDark
                                      ? "#b0b0b0"
                                      : EvidenceBoardColors.text.secondary,
                                  }}>
                                  Progress
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontWeight: "bold",
                                    color: isDark
                                      ? "#ffffff"
                                      : EvidenceBoardColors.text.primary,
                                  }}>
                                  {completedMissions.length} of{" "}
                                  {dream.proofPoints.length} missions
                                </Text>
                              </View>
                              <View
                                style={{
                                  height: 12,
                                  backgroundColor: isDark
                                    ? "rgba(255,255,255,0.1)"
                                    : EvidenceBoardColors.gray300,
                                  borderRadius: 9999,
                                  overflow: "hidden",
                                }}>
                                <LinearGradient
                                  colors={getCategoryGradient(dream.category)}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={{
                                    height: "100%",
                                    width: `${dream.progress}%`,
                                    borderRadius: 9999,
                                  }}
                                />
                              </View>
                            </View>

                            {/* Stats */}
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                gap: 12,
                              }}>
                              <LinearGradient
                                colors={
                                  isDark
                                    ? [
                                        "rgba(168,85,247,0.2)",
                                        "rgba(139,92,246,0.3)",
                                      ]
                                    : ["#F3E8FF", "#DDD6FE"]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                  flex: 1,
                                  borderRadius: 12,
                                  padding: 16,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}>
                                <Text
                                  style={{
                                    fontSize: 22,
                                    fontWeight: "bold",
                                    color: isDark
                                      ? "#ffffff"
                                      : EvidenceBoardColors.text.primary,
                                    marginBottom: 4,
                                  }}>
                                  {completedMissions.length}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 11,
                                    color: isDark
                                      ? "#b0b0b0"
                                      : EvidenceBoardColors.text.secondary,
                                  }}>
                                  Actions Taken
                                </Text>
                              </LinearGradient>
                              <LinearGradient
                                colors={
                                  isDark
                                    ? [
                                        "rgba(251,191,36,0.2)",
                                        "rgba(249,115,22,0.25)",
                                      ]
                                    : ["#FEF3C7", "#FED7AA"]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                  flex: 1,
                                  borderRadius: 12,
                                  padding: 16,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}>
                                <Text
                                  style={{
                                    fontSize: 22,
                                    fontWeight: "bold",
                                    color: isDark
                                      ? "#ffffff"
                                      : EvidenceBoardColors.text.primary,
                                    marginBottom: 4,
                                  }}>
                                  {dream.couragePoints}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 11,
                                    color: isDark
                                      ? "#b0b0b0"
                                      : EvidenceBoardColors.text.secondary,
                                  }}>
                                  Courage Points
                                </Text>
                              </LinearGradient>
                              <LinearGradient
                                colors={
                                  isDark
                                    ? [
                                        "rgba(20,184,166,0.2)",
                                        "rgba(6,182,212,0.25)",
                                      ]
                                    : ["#CCFBF1", "#99F6E4"]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                  flex: 1,
                                  borderRadius: 12,
                                  padding: 16,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}>
                                <Text
                                  style={{
                                    fontSize: 22,
                                    fontWeight: "bold",
                                    color: isDark
                                      ? "#ffffff"
                                      : EvidenceBoardColors.text.primary,
                                    marginBottom: 4,
                                  }}>
                                  {dream.progress}%
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 11,
                                    color: isDark
                                      ? "#b0b0b0"
                                      : EvidenceBoardColors.text.secondary,
                                  }}>
                                  Complete
                                </Text>
                              </LinearGradient>
                            </View>
                          </View>

                          {/* Proof Points Timeline */}
                          <View style={{ marginBottom: 24, marginTop: 24 }}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 24,
                                gap: 8,
                              }}>
                              <Text style={{ fontSize: 24 }}>✨</Text>
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "bold",
                                  color: isDark
                                    ? "#ffffff"
                                    : EvidenceBoardColors.text.primary,
                                }}>
                                Your Proof Points
                              </Text>
                            </View>

                            <FlatList
                              scrollEnabled={false}
                              data={dream.proofPoints}
                              keyExtractor={(item) => item.id.toString()}
                              renderItem={({ item, index }) => (
                                <ProofPointItem
                                  point={item}
                                  index={index}
                                  isDark={isDark}
                                />
                              )}
                            />
                          </View>

                          {/* Next Mission CTA */}
                          {!dream.isComplete &&
                            (() => {
                              // Find the corresponding dream data to get milestones
                              const dreamData = userData?.dreams?.find(
                                (d: any) => d.thread_id === dream.id,
                              );

                              // Find first incomplete milestone
                              const nextMilestone =
                                dreamData?.roadmap?.milestones?.find(
                                  (m: any) => m.status !== "completed",
                                );

                              // Get challenge type color for gradient
                              const challengeTypeColor =
                                nextMilestone?.challenge_type &&
                                ChallengeTypeColors[
                                  nextMilestone.challenge_type as keyof typeof ChallengeTypeColors
                                ]
                                  ? ChallengeTypeColors[
                                      nextMilestone.challenge_type as keyof typeof ChallengeTypeColors
                                    ]
                                  : "#14B8A6";

                              const handleNextMission = () => {
                                if (nextMilestone?.id) {
                                  onNavigate("Milestone", {
                                    milestoneId: nextMilestone.id,
                                  });
                                }
                              };

                              return (
                                <LinearGradient
                                  colors={[
                                    challengeTypeColor,
                                    challengeTypeColor,
                                  ]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={{
                                    borderRadius: 24,
                                    padding: 24,
                                    marginTop: 24,
                                  }}>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      gap: 16,
                                    }}>
                                    <View style={{ flex: 1 }}>
                                      <Text
                                        style={{
                                          fontSize: 16,
                                          fontWeight: "bold",
                                          color: EvidenceBoardColors.white,
                                          marginBottom: 4,
                                        }}>
                                        Ready for your next proof point?
                                      </Text>
                                      <Text
                                        style={{
                                          fontSize: 13,
                                          color: "rgba(255, 255, 255, 0.9)",
                                        }}>
                                        Keep building your evidence. You're
                                        closer than you think.
                                      </Text>
                                    </View>
                                    <TouchableOpacity
                                      onPress={handleNextMission}
                                      disabled={!nextMilestone}
                                      activeOpacity={0.8}
                                      style={{
                                        backgroundColor:
                                          EvidenceBoardColors.white,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderRadius: 12,
                                        opacity: nextMilestone ? 1 : 0.5,
                                      }}>
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          fontWeight: "600",
                                          color: challengeTypeColor,
                                        }}>
                                        Next Mission →
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </LinearGradient>
                              );
                            })()}

                          {/* Motivational Footer */}
                          <LinearGradient
                            colors={
                              isDark
                                ? [
                                    "rgba(168,85,247,0.15)",
                                    "rgba(236,72,153,0.15)",
                                  ]
                                : ["#F3E8FF", "#FCE7F3"]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              borderRadius: 24,
                              padding: 24,
                              marginTop: 24,
                              justifyContent: "center",
                              alignItems: "center",
                              borderWidth: isDark ? 1 : 0,
                              borderColor: isDark
                                ? "rgba(255,255,255,0.08)"
                                : "transparent",
                            }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontStyle: "italic",
                                color: isDark
                                  ? "#b0b0b0"
                                  : EvidenceBoardColors.text.light,
                                textAlign: "center",
                                marginBottom: 12,
                                lineHeight: 24,
                              }}>
                              "Every single action is proof. Proof that you're
                              not just dreaming anymore—you're doing."
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: isDark
                                  ? "#808080"
                                  : EvidenceBoardColors.text.secondary,
                              }}>
                              — Gabby Beckford
                            </Text>
                          </LinearGradient>
                          </>
                          )}
                        </View>
                      )}
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          </>
        )}
      </ParallaxHeader>

      {/* Bottom Navigation */}
      <BottomNavbar onNavigate={onNavigate} activeTab="evidence" />

      {/* Journey Recap Modal */}
      <JourneyRecapModal
        visible={showRecap}
        dream={activeDream}
        totalMissions={totalMissions}
        onClose={() => setShowRecap(false)}
      />
    </SafeAreaView>
  );
};

export default EvidenceBoardScreen;
