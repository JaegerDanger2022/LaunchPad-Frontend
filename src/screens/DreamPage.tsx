import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import {
  Color,
  getThemeColors,
  ChallengeTypeColors,
} from "../constants/GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ChevronLeft } from "lucide-react-native";
import LottieView from "lottie-react-native";
import { MilestoneCard } from "../components/cards/MilestoneCard";
import { BottomNavbar } from "../components/BottomNavbar";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { areDependenciesCompleted } from "../utils/dependencyChecker";

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
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const { userData } = useAuthStore();

  // Find the dream matching the threadId passed from navigation
  const dream = useMemo(
    () => userData?.dreams?.find((d: any) => d.thread_id === threadId),
    [userData?.dreams, threadId],
  );
  const dreamField = dream?.dream || "Dream";
  const dreamCardBg = dream?.dream_card_bg || "#4FA9DB";
  const dreamScore = dream?.metadata?.score || 0;
  const dreamTotalXp = dream?.metadata?.total_xp || 0;

  // Static curve depth
  const curveDepth = 200;

  // Calculate SVG path: combines scroll animation (curve straightens) + drag animation (curve extends)
  const elasticPath = `M 0 0 L ${screenWidth} 0 L ${screenWidth} ${curveDepth} Q ${screenWidth / 2} ${curveDepth + 50} 0 ${curveDepth} Z`;

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
        {/* SVG Curve at bottom */}
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
            onPress={() => onNavigate("Home")}
            style={{
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
            }}>
            <ChevronLeft size={24} color={Color.colorBlack} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        {/* Dream Achievements Animation - Absolutely Positioned */}
        <View
          style={{
            position: "absolute",
            top: 180,
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 7,
            height: 100,
          }}>
          <LottieView
            source={require("../assets/animations/dream_achievements.json")}
            autoPlay
            loop={false}
            style={{ width: 120, height: 80 }}
          />
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
          <Text
            style={{
              fontSize: 14,
              color: Color.colorBlack,
              fontFamily: "InstrumentSans-Regular",
              fontWeight: "500",
              opacity: 0.8,
              marginTop: 8,
              width: 100,
              height: 48,
              borderRadius: 12,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}>
            {dreamScore}/{dreamTotalXp} Points
          </Text>

          {/* Dream Achievements Animation - Centered */}
          {/* <View style={{ alignItems: "center", marginBottom: 20 }}>
            <LottieView
              source={require("../assets/animations/dream_achievements.json")}
              autoPlay
              loop
              style={{ width: 120, height: 80 }}
            />
          </View> */}
        </View>

        <View style={{ flex: 1, overflow: "hidden" }}>
          <ScrollView>
            <View
              style={{
                paddingHorizontal: 22,
                paddingTop: 120,
                paddingBottom: 40,
              }}>
              {/* milestones Grid - 2 Items Per Row */}
              <View style={{ gap: 16 }}>
                {Array.from({ length: Math.ceil(milestones.length / 2) }).map(
                  (_, rowIndex) => {
                    const rowItems = milestones.slice(
                      rowIndex * 2,
                      rowIndex * 2 + 2,
                    );
                    return (
                      <View
                        key={rowIndex}
                        style={{ flexDirection: "row", gap: 16 }}>
                        {rowItems.map((milestone) => {
                          const dependenciesMet = areDependenciesCompleted(
                            milestone.rawMilestone,
                            userData?.dreams,
                          );

                          return (
                            <MilestoneCard
                              key={milestone.id}
                              {...milestone}
                              isLocked={!dependenciesMet}
                              onPress={() => {
                                if (dependenciesMet) {
                                  onNavigate("Milestone", {
                                    milestoneId: milestone.milestoneId,
                                  });
                                }
                              }}
                            />
                          );
                        })}

                        {/* Spacer for odd-numbered rows */}
                        {rowItems.length === 1 && <View style={{ flex: 1 }} />}
                      </View>
                    );
                  },
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DreamPage;
