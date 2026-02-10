import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Lock } from "lucide-react-native";
import { Color, ChallengeTypeName } from "../../constants/GlobalStyles";
import { useThemeStore } from "../../store/themeStore";

interface MilestoneCardProps {
  id: string;
  title: string;
  bgColor: string;
  duration: string;
  image?: any;
  challengeType?: string;
  isLocked?: boolean;
  status?: string;
  onPress: () => void;
}

// Challenge type animation mapping (using PNGs for all types)
const challengeTypeAnimations: Record<string, any> = {
  power_move: require("../../assets/animations/PowerMove.png"),
  knowledge_quest: require("../../assets/animations/KnowledgeQuest.png"),
  courage_check: require("../../assets/animations/courageCheck.png"),
  skill_flex: require("../../assets/animations/SkillFlex.png"),
  decision_point: require("../../assets/animations/DecisionPoint.png"),
  celebration_moment: require("../../assets/animations/Celebration Moment.png"),
  prep_ritual: require("../../assets/animations/PrepRitual.png"),
  custom_dream: require("../../assets/images/customDream.png"), // Custom dream uses static image
};

// Dark mode versions (for light mode backgrounds) - located in animations folder
const challengeTypeAnimationsDark: Record<string, any> = {
  power_move: require("../../assets/animations/PowerMove_dark.png"),
  knowledge_quest: require("../../assets/animations/KnowledgeQuest_dark.png"),
  courage_check: require("../../assets/animations/courageCheck_dark.png"),
  skill_flex: require("../../assets/animations/SkillFlex_dark.png"),
  decision_point: require("../../assets/animations/DecisionPoint_dark.png"),
  celebration_moment: require("../../assets/animations/CelebrationMoment_dark.png"),
  prep_ritual: require("../../assets/animations/PrepRitual_dark.png"),
  custom_dream: require("../../assets/images/customDream.png"), // Custom dream uses same image
};

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  id,
  title,
  bgColor,
  duration,
  image,
  challengeType,
  isLocked = false,
  status,
  onPress,
}) => {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  // Determine which icon to use based on theme and challenge type
  // Light mode uses dark icons for visibility, dark mode uses light icons
  const animationSource = challengeType
    ? !isDark
      ? challengeTypeAnimationsDark[challengeType] || challengeTypeAnimations[challengeType]
      : challengeTypeAnimations[challengeType]
    : null;

  // Debug logging
  console.log('[MilestoneCard] Icon selection:', {
    title: title.substring(0, 30),
    challengeType,
    isDark,
    usingDarkIcon: !isDark,
    selectedIcon: !isDark ? 'dark' : 'light',
    hasAnimationSource: !!animationSource,
    hasImage: !!image,
  });

  // Light mode gradient colors based on bgColor (challenge type color)
  const getLightGradient = () => {
    // Create a soft gradient using the accent color
    const baseColor = bgColor;
    return [
      `${baseColor}15`, // Very light version (15% opacity)
      `${baseColor}08`, // Even lighter (8% opacity)
    ];
  };

  const cardBg = isDark ? "#2B2D56" : "#FFFFFF";

  // Icon background should match the gradient color (lighter tint of accent color)
  const iconBg = isDark ? "#2B2D56" : `${bgColor}15`;

  return (
    <TouchableOpacity
      key={id}
      onPress={onPress}
      activeOpacity={isLocked ? 1 : 0.8}
      disabled={isLocked}
      style={{
        flexDirection: "row",
        height: 100,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: cardBg,
        borderWidth: 2,
        borderColor: bgColor,
        opacity: isLocked ? 0.5 : 1,
      }}>
      {/* Animation or Image - Left Side */}
      {animationSource || image ? (
        <View
          style={{
            width: 100,
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: iconBg,
          }}>
          <Image
            source={animationSource || image}
            style={{
              width: 48,
              height: 48,
              resizeMode: "contain",
            }}
          />
        </View>
      ) : (
        <View
          style={{
            width: 100,
            height: "100%",
            backgroundColor: iconBg,
          }}
        />
      )}

      {/* Card Content with Gradient - Right Side */}
      <LinearGradient
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingVertical: 16,
          justifyContent: "space-between",
        }}
        colors={isDark ? ["#2B2D56", "#2B2D56"] : getLightGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}>
        {/* Title and Status Badge */}
        <View
          style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
          <Text
            style={{
              fontFamily: "InriaSans-Bold",
              fontSize: 16,
              color: isDark ? "#FFFFFF" : "#000000",
              fontWeight: "700",
              flex: 1,
            }}
            numberOfLines={2}>
            {title}
          </Text>
          {status === "pending" && (
            <View
              style={{
                backgroundColor: "rgba(255, 165, 0, 0.2)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "rgba(255, 165, 0, 0.4)",
              }}>
              <Text
                style={{
                  color: "#FFA500",
                  fontSize: 10,
                  fontWeight: "600",
                  fontFamily: "InriaSans-Bold",
                }}>
                PENDING
              </Text>
            </View>
          )}
          {status === "completed" && (
            <View
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "rgba(34, 197, 94, 0.4)",
              }}>
              <Text
                style={{
                  color: "#22C55E",
                  fontSize: 10,
                  fontWeight: "600",
                  fontFamily: "InriaSans-Bold",
                }}>
                COMPLETED
              </Text>
            </View>
          )}
        </View>

        {/* Challenge Type */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 1,
              backgroundColor: bgColor,
            }}
          />
          <Text
            style={{
              color: isDark ? "#B0B0B0" : "#6B7280",
              fontSize: 12,
              fontWeight: "400",
              fontFamily: "InriaSans-Regular",
            }}>
            {challengeType
              ? ChallengeTypeName[
                  challengeType as keyof typeof ChallengeTypeName
                ]
              : "Task"}
          </Text>
        </View>
      </LinearGradient>

      {/* Locked Overlay */}
      {isLocked && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 12,
          }}>
          <Lock size={48} color={Color.colorWhite} strokeWidth={1.5} />
        </View>
      )}
    </TouchableOpacity>
  );
};
