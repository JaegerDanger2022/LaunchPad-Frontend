import React, { useMemo, useRef, useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import {
  Color,
  getThemeColors,
  ChallengeTypeColors,
} from "../constants/GlobalStyles";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Plus } from "lucide-react-native";
import { MilestoneCard } from "../components/cards/MilestoneCard";
import { BottomNavbar } from "../components/BottomNavbar";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { areDependenciesCompleted } from "../utils/dependencyChecker";
import { AddMilestoneModal } from "../components/AddMilestoneModal";
import { fetchDreamDetails } from "../config/api";
import { ParallaxHeader } from "../components/ParallaxHeader";

const { width: screenWidth } = Dimensions.get("window");

interface Milestone {
  id: string;
  title: string;
  bgColor: string;
  duration: string;
  image?: any;
  challengeType?: string;
  roadmapId?: string;
  milestoneId?: string;
  status?: string;
  rawMilestone?: any; // Store raw milestone object for dependency checking
}

// Custom dream image
const customDreamImage = require("../assets/images/customDream.png");

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
  // or if it has a more recent timestamp, otherwise use fullDreamData
  const dream = useMemo(() => {
    if (!dreamFromStore && !fullDreamData) return null;
    if (!fullDreamData) return dreamFromStore;
    if (!dreamFromStore) return fullDreamData;

    // Check for freshness indicators
    const storeTimestamp = dreamFromStore?._lastUpdated || 0;
    const fullDataTimestamp = fullDreamData?._lastUpdated || 0;
    const storeMilestoneCount = dreamFromStore?.roadmap?.milestones?.length || 0;
    const fullDataMilestoneCount = fullDreamData?.roadmap?.milestones?.length || 0;

    // Use store data if:
    // 1. It has a more recent timestamp (updated after milestone completion)
    // 2. It has more milestones (custom milestone was just added)
    if (storeTimestamp > fullDataTimestamp || storeMilestoneCount > fullDataMilestoneCount) {
      return dreamFromStore;
    }

    return fullDreamData;
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

  const convertBinaryToImage = (binaryData: string) => {
    try {
      return `data:image/jpeg;base64,${binaryData}`;
    } catch (error) {
      console.error("Error converting binary to image:", error);
      return null;
    }
  };

  const dreamField = dream?.dream || "Dream";
  const dreamCardBg = dream?.dream_card_bg || "#4FA9DB";

  // Determine background image: custom dream uses customDream.png, AI dreams use generated image
  const isCustomDream = dream?.is_custom === true;
  const dreamImageUri = isCustomDream
    ? customDreamImage
    : dream?.dream_image_bytes
      ? convertBinaryToImage(dream.dream_image_bytes)
      : null;

  const dreamScore = dream?.metadata?.score ??
    (dream?.roadmap?.milestones || []).reduce((sum: number, m: any) => sum + (m.status === "completed" ? (m.xp_points || 0) : 0), 0);
  const dreamTotalXp = dream?.metadata?.total_xp ??
    (dream?.roadmap?.milestones || []).reduce((sum: number, m: any) => sum + (m.xp_points || 0), 0);

  // Transform this dream's milestones to MilestoneCard props
  const milestones: Milestone[] = useMemo(() => {
    if (!dream?.roadmap?.milestones || !Array.isArray(dream.roadmap.milestones)) {
      return [];
    }

    // Check if this is a custom dream
    const isCustomDream = dream.is_custom === true;

    return dream.roadmap.milestones.map((milestone: any, milestoneIndex: number) => {
      // For custom dreams, use the custom dream image
      const image = isCustomDream ? customDreamImage : undefined;

      // For custom dreams, prioritize dream_card_bg (user's chosen color)
      // For AI dreams, use challenge type color
      const bgColor = isCustomDream
        ? dream.dream_card_bg || "#537787"
        : ChallengeTypeColors[
            milestone.challenge_type as keyof typeof ChallengeTypeColors
          ] ||
          milestone.bgColor ||
          dream.dream_card_bg ||
          "#537787";

      return {
        id: `${milestoneIndex}`,
        title: milestone.title || milestone.name || "Untitled Milestone",
        bgColor,
        duration: milestone.time_estimate || "60 mins",
        image,
        // Don't pass animation prop - let MilestoneCard handle theme-aware icon selection
        challengeType: milestone.challenge_type,
        roadmapId: dream.thread_id,
        milestoneId: milestone.id,
        status: milestone.status,
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

        {/* Back Button - Fixed Position with Semi-transparent Background */}
        <View
          style={{
            position: "absolute",
            top: 50,
            left: 22,
            zIndex: 110,
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
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
            <ChevronLeft size={24} color={Color.colorWhite} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* ParallaxHeader with Dream Content */}
        <ParallaxHeader
          title={dreamField}
          subtitle={`${dreamScore}/${dreamTotalXp} Courage Points`}
          backgroundImage={
            dreamImageUri
              ? isCustomDream
                ? dreamImageUri // customDreamImage is a require() - use directly
                : { uri: dreamImageUri } // AI dream image is a base64 URI
              : undefined
          }
          backgroundColor={dreamCardBg}
          parallaxHeight={280}
          headerHeight={90}
          titleStyle={{
            fontSize: 28,
            fontFamily: "InstrumentSans-Bold",
            color: Color.colorWhite,
          }}
          subtitleStyle={{
            fontSize: 16,
            fontFamily: "InstrumentSans-Bold",
            color: "rgba(255, 255, 255, 0.9)",
          }}
          stickyHeaderTitleStyle={{
            fontSize: 20,
            fontFamily: "InstrumentSans-Bold",
            color: Color.colorBlack,
          }}>
          <View
            style={{
              paddingHorizontal: 22,
              paddingBottom: 120, // Extra padding to clear bottom navbar
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
                // For dependency checking, pass all dreams but with the current dream's FRESH data
                // Use 'dream' (which picks the freshest between store and fullDreamData)
                // This handles both intra-dream and cross-dream dependencies
                const dreamsForDepCheck = userData?.dreams?.map((d: any) =>
                  d.thread_id === threadId && dream ? dream : d
                ) || [];

                const dependenciesMet = areDependenciesCompleted(
                  milestone.rawMilestone,
                  dreamsForDepCheck,
                );

                // Debug logging - log all milestones for debugging
                if (index < 3) {
                  console.log(`[DreamPage] Milestone ${index + 1} debug:`, {
                    milestoneId: milestone.milestoneId,
                    milestoneTitle: milestone.title?.substring(0, 30),
                    hasDependencies: !!milestone.rawMilestone?.dependencies,
                    dependencies: milestone.rawMilestone?.dependencies,
                    status: milestone.rawMilestone?.status,
                    dependenciesMet,
                    isLocked: !dependenciesMet,
                    dreamSource: dream === dreamFromStore ? 'store' : 'fullData',
                    storeTimestamp: dreamFromStore?._lastUpdated,
                    fullDataTimestamp: fullDreamData?._lastUpdated,
                  });
                }

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
        </ParallaxHeader>

      </View>

      {/* FAB – add custom milestone (hide for completed dreams OR completed custom dreams) */}
      {dream?.status !== "completed" && !(isCustomDream && dream?.status === "completed") && (
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
        onSubmit={async (title, challengeType, description) => {
          setShowAddMilestone(false);
          console.log('[DreamPage] Adding custom milestone:', { title, challengeType, description, threadId });

          try {
            await addCustomMilestone(threadId, title, challengeType, description);
            console.log('[DreamPage] Custom milestone added successfully');

            // Trigger a refresh to fetch the updated dream with the new milestone from backend
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
