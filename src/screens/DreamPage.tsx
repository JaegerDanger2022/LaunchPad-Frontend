import React, { useMemo, useRef, useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import {
  Color,
  getThemeColors,
  ChallengeTypeColors,
} from "../constants/GlobalStyles";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ChevronLeft, Plus } from "lucide-react-native";
import { MilestoneCard } from "../components/cards/MilestoneCard";
import { BottomNavbar } from "../components/BottomNavbar";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { areDependenciesCompleted } from "../utils/dependencyChecker";
import { AddMilestoneModal } from "../components/AddMilestoneModal";
import { fetchDreamDetails } from "../config/api";

const { width: screenWidth } = Dimensions.get("window");

interface Milestone {
  id: string;
  title: string;
  bgColor: string;
  duration: string;
  image?: any;
  animation?: any;
  challengeType?: string;
  roadmapId?: string;
  milestoneId?: string;
  rawMilestone?: any; // Store raw milestone object for dependency checking
}

// Animation mapping for challenge types
const challengeTypeAnimations: Record<string, any> = {
  power_move: require("../assets/animations/power_move.json"),
  knowledge_quest: require("../assets/animations/knowledge_quest.json"),
  // Add other animations as they become available
};

// Fallback placeholder images
const placeholderImages = [
  require("../assets/images/placeholder-flights.png"),
  require("../assets/images/placeholder-lodging.png"),
  require("../assets/images/placeholder-feedback.png"),
];

// Helper function to get animation or fallback to image
const getAnimationOrImage = (challengeType: string, fallbackImageIndex: number) => {
  return {
    animation: challengeTypeAnimations[challengeType] || null,
    image: placeholderImages[fallbackImageIndex % placeholderImages.length],
  };
};

const DreamPage = ({
  threadId,
  onNavigate,
}: {
  threadId: string;
  onNavigate: (screen: string, params?: Record<string, any>) => void;
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const { userData, addCustomMilestone, user, loadFullDreams } = useAuthStore();
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [fullDreamData, setFullDreamData] = useState<any>(null);
  const [isLoadingDream, setIsLoadingDream] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Find the dream matching the threadId passed from navigation
  const dreamFromStore = useMemo(
    () => userData?.dreams?.find((d: any) => d.thread_id === threadId),
    [userData?.dreams, threadId],
  );

  // Use dreamFromStore if it has more milestones (indicates a recent update),
  // otherwise use fullDreamData, or fall back to dreamFromStore
  const dream = useMemo(() => {
    if (!dreamFromStore && !fullDreamData) return null;
    if (!fullDreamData) return dreamFromStore;
    if (!dreamFromStore) return fullDreamData;

    // If dreamFromStore has more milestones, it's fresher (e.g., custom milestone was just added)
    const storeMilestoneCount = dreamFromStore?.roadmap?.milestones?.length || 0;
    const fullDataMilestoneCount = fullDreamData?.roadmap?.milestones?.length || 0;

    return storeMilestoneCount > fullDataMilestoneCount ? dreamFromStore : fullDreamData;
  }, [dreamFromStore, fullDreamData]);

  // Load full dream details on mount and when refreshTrigger changes
  useEffect(() => {
    const loadDreamDetails = async () => {
      if (!user?.uid || !threadId) {
        setIsLoadingDream(false);
        return;
      }

      try {
        console.log('[DreamPage] Loading full dream details for thread:', threadId);
        const details = await fetchDreamDetails(user.uid, threadId);
        if (details) {
          // Verify the fetched dream matches the requested threadId
          if (details.thread_id === threadId) {
            console.log('[DreamPage] Loaded dream:', {
              threadId: details.thread_id,
              dreamTitle: details.dream,
              milestoneCount: details.roadmap?.milestones?.length || 0,
              milestones: details.roadmap?.milestones?.map((m: any) => ({
                id: m.id,
                title: m.title,
                is_custom: m.is_custom,
              })),
            });
            setFullDreamData(details);
          } else {
            console.error('[DreamPage] Thread ID mismatch!', {
              requested: threadId,
              received: details.thread_id,
            });
          }
        } else {
          console.error('[DreamPage] No dream details returned for thread:', threadId);
        }
      } catch (error) {
        console.error('[DreamPage] Error loading dream details:', error);
      } finally {
        setIsLoadingDream(false);
      }
    };

    loadDreamDetails();
  }, [user?.uid, threadId, refreshTrigger]);

  const dismiss = useCallback(() => onNavigate("Home"), [onNavigate]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 8,
      onPanResponderMove: () => {},
      onPanResponderReleaseOrTerminate: (_, gestureState) => {
        if (gestureState.dy > 50) {
          dismiss();
        }
      },
    }),
  ).current;

  const dreamField = dream?.dream || "Dream";
  const dreamCardBg = dream?.dream_card_bg || "#4FA9DB";

  const curveDepth = 200;
  const elasticPath = `M 0 0 L ${screenWidth} 0 L ${screenWidth} ${curveDepth} Q ${screenWidth / 2} ${curveDepth + 50} 0 ${curveDepth} Z`;

  const dreamScore = dream?.metadata?.score ??
    (dream?.roadmap?.milestones || []).reduce((sum: number, m: any) => sum + (m.status === "completed" ? (m.xp_points || 0) : 0), 0);
  const dreamTotalXp = dream?.metadata?.total_xp ??
    (dream?.roadmap?.milestones || []).reduce((sum: number, m: any) => sum + (m.xp_points || 0), 0);

  // Transform this dream's milestones to MilestoneCard props
  const milestones: Milestone[] = useMemo(() => {
    if (!dream?.roadmap?.milestones || !Array.isArray(dream.roadmap.milestones)) {
      return [];
    }

    return dream.roadmap.milestones.map((milestone: any, milestoneIndex: number) => {
      const { animation, image } = getAnimationOrImage(
        milestone.challenge_type,
        milestoneIndex
      );

      return {
        id: `${milestoneIndex}`,
        title: milestone.title || milestone.name || "Untitled Milestone",
        bgColor:
          ChallengeTypeColors[
            milestone.challenge_type as keyof typeof ChallengeTypeColors
          ] ||
          milestone.bgColor ||
          dream.dream_card_bg ||
          "#537787",
        duration: milestone.time_estimate || "60 mins",
        image,
        animation,
        challengeType: milestone.challenge_type,
        roadmapId: dream.thread_id,
        milestoneId: milestone.id,
        rawMilestone: milestone,
      };
    });
  }, [dream]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: themeColors.bg_primary }}
      edges={["bottom", "left", "right"]}>
      <BottomNavbar onNavigate={onNavigate} />
      <View style={{ flex: 1 }}>
        {/* Drag handle — invisible hit area + visible pill */}
        <View
          {...panResponder.panHandlers}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            zIndex: 20,
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 6,
          }}>
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
            }}
          />
        </View>

        {/* SVG Curve */}
        <Svg
          width={screenWidth}
          height={320}
          style={{ position: "absolute", top: 0, zIndex: 5 }}>
          <Path d={elasticPath} fill={dreamCardBg} stroke="none" />
        </Svg>

        {/* Back Button - Fixed Position with Semi-transparent Background */}
        <View
          style={{
            position: "absolute",
            top: 50,
            left: 22,
            zIndex: 10,
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <TouchableOpacity
            onPress={() => onNavigate("Back")}
            style={{
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
            }}>
            <ChevronLeft size={24} color={Color.colorBlack} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        {/* Header Content */}
        <View style={{ paddingHorizontal: 22, paddingTop: 100, zIndex: 6 }}>
          {/* Title */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: Color.colorBlack,
              fontFamily: "InstrumentSans-Bold",
              marginBottom: 8,
              textAlign: "center",
            }}>
            {dreamField}
          </Text>

          {/* Score Display */}
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: "rgba(255, 255, 255, 0.25)",
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: Color.colorBlack,
                  fontFamily: "InstrumentSans-Bold",
                  fontWeight: "700",
                }}>
                {dreamScore}/{dreamTotalXp} Points
              </Text>
            </View>
          </View>

        </View>

        <View style={{ flex: 1, overflow: "hidden" }}>
          <ScrollView>
            <View
              style={{
                paddingHorizontal: 22,
                paddingTop: 120,
                paddingBottom: 40,
              }}>
              {/* Loading indicator */}
              {isLoadingDream && milestones.length === 0 ? (
                <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
                  <ActivityIndicator size="large" color={themeColors.text_primary} />
                  <Text style={{
                    color: themeColors.text_secondary,
                    fontFamily: "InstrumentSans-Regular",
                    fontSize: 14,
                    marginTop: 12,
                  }}>
                    Loading milestones...
                  </Text>
                </View>
              ) : null}

              {/* Milestones List - One Item Per Row */}
              <View style={{ gap: 16 }}>
                {milestones.map((milestone, index) => {
                  // For dependency checking, pass all dreams but with the current dream's full data
                  // This handles both intra-dream and cross-dream dependencies
                  const dreamsForDepCheck = userData?.dreams?.map((d: any) =>
                    d.thread_id === threadId && fullDreamData ? fullDreamData : d
                  ) || [];

                  const dependenciesMet = areDependenciesCompleted(
                    milestone.rawMilestone,
                    dreamsForDepCheck,
                  );

                  // Debug logging
                  // if (index === 0) {
                  //   console.log('[DreamPage] First milestone debug:', {
                  //     milestoneId: milestone.milestoneId,
                  //     milestoneTitle: milestone.title,
                  //     hasDependencies: milestone.rawMilestone?.dependencies,
                  //     dependencies: milestone.rawMilestone?.dependencies,
                  //     status: milestone.rawMilestone?.status,
                  //     dependenciesMet,
                  //     currentDreamMilestones: dream?.roadmap?.milestones?.length,
                  //     allDreams: userData?.dreams?.length,
                  //     usingFullData: !!fullDreamData,
                  //   });
                  // }

                  return (
                    <MilestoneCard
                      key={milestone.id}
                      {...milestone}
                      isLocked={!dependenciesMet}
                      onPress={() => {
                        if (dependenciesMet) {
                          onNavigate("Milestone", {
                            milestoneId: milestone.milestoneId,
                            threadId: threadId,
                          });
                        }
                      }}
                    />
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>

      </View>

      {/* FAB – add custom milestone (hide only for completed dreams) */}
      {dream?.status !== "completed" && (
        <TouchableOpacity
          onPress={() => setShowAddMilestone(true)}
          style={{
            position: "absolute",
            bottom: insets.bottom + 70,
            right: 24,
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
            elevation: 20,
            zIndex: 200,
          }}>
          <Plus size={28} color={Color.colorWhite} strokeWidth={2.5} />
        </TouchableOpacity>
      )}

      {/* Add-milestone bottom sheet (inline overlay — avoids nested <Modal> inside transparentModal) */}
      <AddMilestoneModal
        visible={showAddMilestone}
        onClose={() => setShowAddMilestone(false)}
        onSubmit={async (title, challengeType) => {
          setShowAddMilestone(false);
          console.log('[DreamPage] Adding custom milestone:', { title, challengeType, threadId });

          try {
            await addCustomMilestone(threadId, title, challengeType);
            console.log('[DreamPage] Custom milestone added, waiting 500ms before refresh');

            // Small delay to ensure backend has persisted the data
            await new Promise(resolve => setTimeout(resolve, 500));

            // Force reload from backend by clearing local cache
            if (user?.uid) {
              console.log('[DreamPage] Refreshing dream data from backend');
              await loadFullDreams(user.uid);
            }

            console.log('[DreamPage] Triggering component refresh');
            // Trigger a refresh to fetch the updated dream with the new milestone
            setRefreshTrigger(prev => prev + 1);
          } catch (error) {
            console.error('[DreamPage] Error adding custom milestone:', error);
          }
        }}
      />
    </SafeAreaView>
  );
};

export default DreamPage;
