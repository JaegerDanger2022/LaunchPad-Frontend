import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ProgressRingIcon } from "./icons/SVGIcons";
import { Color, getThemeColors } from "../constants/GlobalStyles";
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
  progress: number; // 0–100
  threadId?: string;
  status?: string;
}

interface GoalCardProps {
  data: GoalCardData;
  onPress?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ data, onPress }) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

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
        <View
          style={{
            height: 88,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderTopWidth: 1,
            borderTopColor: theme === "light" ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.15)",
            borderLeftWidth: 0.5,
            borderLeftColor: theme === "light" ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.1)",
            borderRightWidth: 0.5,
            borderRightColor: theme === "light" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
            overflow: "hidden",
          }}>
          {/* Gradient as absolute background fill */}
          <LinearGradient
            colors={theme === "light" ? [`${data.bgColor}60`, `${data.bgColor}40`] : [hexToRgba(data.bgColor, 0.3), hexToRgba(data.bgColor, 0.15)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: theme === "light" ? `${data.bgColor}40` : hexToRgba(data.bgColor, 0.2),
            }}
          />
          {/* Content layer on top */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: 15,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <Text
              style={{
                fontFamily: "InriaSans-Bold",
                fontSize: 15,
                color: Color.colorBlack,
                fontWeight: "700",
                flex: 1,
                marginRight: 10,
              }}>
              {data.title.length > 20 ? data.title.slice(0, 20) + "…" : data.title}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
              }}>
              <ProgressRingIcon size={30} color={themeColors.bg_primary} progress={data.progress} />
              <Text
                style={{
                  fontFamily: "InriaSans-Bold",
                  fontSize: 14,
                  color: Color.colorBlack,
                  fontWeight: "700",
                }}>
                {Math.round(data.progress)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
