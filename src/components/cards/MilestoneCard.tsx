import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Lock } from "lucide-react-native";
import { Color, ChallengeTypeName } from "../../constants/GlobalStyles";

interface MilestoneCardProps {
  id: string;
  title: string;
  bgColor: string;
  duration: string;
  image?: any;
  animation?: any;
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

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  id,
  title,
  bgColor,
  duration,
  image,
  animation,
  challengeType,
  isLocked = false,
  status,
  onPress,
}) => {
  // Determine which animation to use (priority: prop > challengeType mapping > fallback to image)
  const animationSource =
    animation ||
    (challengeType ? challengeTypeAnimations[challengeType] : null);

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
        backgroundColor: "#2B2D56",
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
            backgroundColor: "#2B2D56",
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
            backgroundColor: "#2B2D56",
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
        colors={["#2B2D56", "#2B2D56"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>
        {/* Title and Status Badge */}
        <View
          style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
          <Text
            style={{
              fontFamily: "InriaSans-Bold",
              fontSize: 16,
              color: "#FFFFFF",
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
              color: "#B0B0B0",
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
