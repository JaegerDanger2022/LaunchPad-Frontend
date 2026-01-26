import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ProgressRingIcon } from "./icons/SVGIcons";
import { Color } from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";

// Helper function to convert hex color to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface GoalCardData {
  title: string;
  bgImage: any;
  bgColor: string;
  progressColor: string;
}

interface GoalCardProps {
  data: GoalCardData;
  onPress?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ data, onPress }) => {
  const { theme } = useThemeStore();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ width: "100%" }}>
      <View
        style={{
          height: 228,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: data.bgColor,
        }}>
        <Image
          source={data.bgImage || require("../assets/images/goal-podcast.png")}
          style={{
            width: "100%",
            height: 140,
          }}
        />
        <LinearGradient
          style={{
            flex: 1,
            paddingHorizontal: 15,
            paddingVertical: 15,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            justifyContent: "space-between",
            backgroundColor: theme === "light" ? `${data.bgColor}40` : hexToRgba(data.bgColor, 0.2),
            borderTopWidth: 1,
            borderTopColor: theme === "light" ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.15)",
            borderLeftWidth: 0.5,
            borderLeftColor: theme === "light" ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)",
            borderRightWidth: 0.5,
            borderRightColor: theme === "light" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
          }}
          colors={theme === "light" ? [`${data.bgColor}60`, `${data.bgColor}40`] : [hexToRgba(data.bgColor, 0.3), hexToRgba(data.bgColor, 0.15)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}>
          <Text
            style={{
              fontFamily: "InriaSans-Bold",
              fontSize: 15,
              color: Color.colorWhite,
              fontWeight: "700",
            }}>
            {data.title}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}>
            <Text
              style={{
                fontFamily: "InriaSans-Regular",
                fontSize: 16,
                color: Color.colorWhite,
              }}>
              Progress
            </Text>
            <ProgressRingIcon size={30} color={data.progressColor} />
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};
