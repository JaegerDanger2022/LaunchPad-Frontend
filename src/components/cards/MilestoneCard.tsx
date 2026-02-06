import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
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
  onPress: () => void;
}

// Challenge type animation mapping
const challengeTypeAnimations: Record<string, any> = {
  power_move: require("../../assets/animations/power_move.json"),
  knowledge_quest: require("../../assets/animations/knowledge_quest.json"),
  // Add other animations as they become available
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
  onPress,
}) => {
  return (
    <TouchableOpacity
      key={id}
      onPress={onPress}
      activeOpacity={isLocked ? 1 : 0.8}
      disabled={isLocked}
      style={{
        flexDirection: "row",
        height: 120,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: bgColor,
        opacity: isLocked ? 0.5 : 1,
      }}>
      {/* Animation or Image - Left Side */}
      {animation ? (
        <View
          style={{
            width: 120,
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: bgColor,
          }}>
          <LottieView
            source={animation}
            autoPlay
            loop={false}
            style={{
              width: 90,
              height: 90,
            }}
          />
        </View>
      ) : (
        <Image
          source={image}
          style={{
            width: 120,
            height: "100%",
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
        colors={[bgColor, bgColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>
        {/* Title */}
        <Text
          style={{
            fontFamily: "InriaSans-Bold",
            fontSize: 16,
            color: Color.colorWhite,
            fontWeight: "700",
          }}
          numberOfLines={2}>
          {title}
        </Text>

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
              backgroundColor: "rgba(255, 255, 255, 0.6)",
            }}
          />
          <Text
            style={{
              color: Color.colorWhite,
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
