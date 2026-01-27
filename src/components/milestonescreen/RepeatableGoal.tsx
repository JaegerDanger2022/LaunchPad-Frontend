import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Svg, { Line } from "react-native-svg";
import { Color, getThemeColors } from "../../constants/GlobalStyles";
import { useThemeStore } from "../../store/themeStore";

interface RepeatableGoalProps {
  completedSteps: number;
  onPress: () => void;
}

export const RepeatableGoal: React.FC<RepeatableGoalProps> = ({
  completedSteps,
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
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: themeColors.text_primary,
          marginBottom: 25,
        }}>
        Do it 3 times this week to succeed
      </Text>

      {/* Progress Dots */}
      <View
        style={{
          flexDirection: "row",
          gap: 15,
          marginBottom: 40,
        }}>
        {[1, 2, 3].map((num) => (
          <View
            key={num}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor:
                num <= completedSteps ? "#00D4AA" : themeColors.bg_secondary,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: Color.colorBlack,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 2,
            }}>
            <Text
              style={{
                color:
                  num <= completedSteps
                    ? Color.colorWhite
                    : themeColors.text_secondary,
                fontSize: 18,
                fontWeight: "600",
              }}>
              {num}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          width: "100%",
          height: 60,
          backgroundColor: "#00D4AA",
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
          {completedSteps === 3 ? "Goal Completed!" : "I have done this today!"}
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
