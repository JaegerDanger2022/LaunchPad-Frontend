import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Line } from "react-native-svg";
import { Color, getThemeColors } from "../../constants/GlobalStyles";
import { useThemeStore } from "../../store/themeStore";

interface OneTimeGoalProps {
  isCompleted: boolean;
  onPress: () => void;
}

export const OneTimeGoal: React.FC<OneTimeGoalProps> = ({
  isCompleted,
  onPress,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 30,
        alignItems: "center",
      }}>
      {/* Drag Handle */}
      <View style={{ marginBottom: 20 }}>
        <Svg width="40" height="4" viewBox="0 0 40 4">
          <Line x1="0" y1="2" x2="40" y2="2" stroke={themeColors.text_secondary} strokeWidth="4" strokeLinecap="round" />
        </Svg>
      </View>

      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: themeColors.text_primary,
          marginBottom: 40,
        }}>
        Complete this goal to succeed
      </Text>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          width: "100%",
          height: 60,
          backgroundColor: isCompleted ? "#00D4AA" : "#00D4AA",
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}>
        <Text
          style={{
            color: Color.colorWhite,
            fontSize: 18,
            fontWeight: "700",
          }}>
          {isCompleted ? "Goal Completed!" : "Mark as complete"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ width: "100%", paddingVertical: 10 }}>
        <Text
          style={{
            color: themeColors.text_secondary,
            textAlign: "center",
            fontSize: 16,
            fontWeight: "500",
          }}>
          Skip this goal
        </Text>
      </TouchableOpacity>

      {/* Home Indicator Spacer */}
      <View
        style={{
          width: 130,
          height: 5,
          backgroundColor: Color.colorBlack,
          borderRadius: 10,
          marginTop: "auto",
          marginBottom: 8,
        }}
      />
    </View>
  );
};
