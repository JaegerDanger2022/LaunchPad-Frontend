import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ChevronLeft } from "lucide-react-native";
import { MilestoneCard } from "../components/cards/MilestoneCard";
import { BottomNavbar } from "../components/BottomNavbar";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";

const { width: screenWidth } = Dimensions.get("window");

interface Milestone {
  id: string;
  title: string;
  bgColor: string;
  tags: string[];
  duration: string;
  image: any;
}

const placeholderImages = [
  require("../assets/images/placeholder-flights.png"),
  require("../assets/images/placeholder-lodging.png"),
  require("../assets/images/placeholder-feedback.png"),
];

const DreamPage = ({
  onNavigate,
}: {
  onNavigate: (screen: string, params?: Record<string, any>) => void;
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const { userData } = useAuthStore();

  // Static curve depth
  const curveDepth = 200;

  // Calculate SVG path: combines scroll animation (curve straightens) + drag animation (curve extends)
  const elasticPath = `M 0 0 L ${screenWidth} 0 L ${screenWidth} ${curveDepth} Q ${screenWidth / 2} ${curveDepth + 50} 0 ${curveDepth} Z`;

  // Transform dream milestones to MilestoneCard props
  const milestones: Milestone[] = useMemo(() => {
    if (!userData?.dreams || !Array.isArray(userData.dreams)) {
      return [];
    }

    const allMilestones: Milestone[] = [];

    userData.dreams.forEach((dream: any, dreamIndex: number) => {
      // Check if dream has roadmap with milestones
      if (
        dream.roadmap?.milestones &&
        Array.isArray(dream.roadmap.milestones)
      ) {
        dream.roadmap.milestones.forEach(
          (milestone: any, milestoneIndex: number) => {
            allMilestones.push({
              id: `${dreamIndex}-${milestoneIndex}`,
              title: milestone.title || milestone.name || "Untitled Milestone",
              bgColor: milestone.bgColor || dream.dream_card_bg || "#537787",
              tags: milestone.tags || ["Task"],
              duration: milestone.time_estimate || "60 mins",
              // Cycle through placeholder images
              image:
                placeholderImages[
                  allMilestones.length % placeholderImages.length
                ],
            });
          },
        );
      }
    });

    return allMilestones;
  }, [userData?.dreams]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: themeColors.bg_primary }}
      edges={["bottom", "left", "right"]}>
      <BottomNavbar />
      <View style={{ flex: 1 }}>
        {/* SVG Curve at bottom */}
        <Svg
          width={screenWidth}
          height={320}
          style={{ position: "absolute", top: 0, zIndex: 5 }}>
          <Path d={elasticPath} fill="#4FA9DB" stroke="none" />
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
            <ChevronLeft size={24} color={Color.colorWhite} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Header Content */}
        <View style={{ paddingHorizontal: 22, paddingTop: 100, zIndex: 6 }}>
          {/* Collection Badge */}
          {/* <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              marginBottom: 20,
            }}>
            <Text
              style={{
                color: Color.colorWhite,
                fontSize: 12,
                fontWeight: "600",
                fontFamily: "InstrumentSans-Medium",
              }}>
              Collection
            </Text>
          </View> */}

          {/* Title */}
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: Color.colorWhite,
              fontFamily: "InstrumentSans-Bold",
              marginBottom: 8,
            }}>
            Take 5
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: 16,
              color: Color.colorWhite,
              fontFamily: "InstrumentSans-Regular",
              fontWeight: "400",
              opacity: 0.9,
            }}>
            5 minutes a day is all it takes to feel your best.
          </Text>
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
                        {rowItems.map((milestone) => (
                          <MilestoneCard
                            key={milestone.id}
                            {...milestone}
                            onPress={() => onNavigate("Milestone", { milestoneId: milestone.id })}
                          />
                        ))}

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
