import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { EvidenceBoardColors } from "../../constants/GlobalStyles";

export interface Dream {
  id: number;
  title: string;
  category: "travel" | "career" | "financial" | "other";
  status: "in-progress" | "completed";
  progress: number;
  startDate: string;
  targetDate?: string;
  completedDate?: string;
  couragePoints: number;
  proofPoints: any[];
}

interface DreamCardProps {
  dream: Dream & { dream_card_bg?: string };
  isSelected: boolean;
  onPress: () => void;
  isDark?: boolean;
}

const getCategoryGradient = (
  category: Dream["category"],
): [string, string, ...string[]] => {
  switch (category) {
    case "travel":
      return [
        EvidenceBoardColors.gradient.travelStart,
        EvidenceBoardColors.gradient.travelEnd,
      ];
    case "career":
      return [
        EvidenceBoardColors.gradient.careerStart,
        EvidenceBoardColors.gradient.careerEnd,
      ];
    case "financial":
      return [
        EvidenceBoardColors.gradient.financialStart,
        EvidenceBoardColors.gradient.financialEnd,
      ];
    default:
      return [
        EvidenceBoardColors.gradient.defaultStart,
        EvidenceBoardColors.gradient.defaultEnd,
      ];
  }
};

export const DreamCard: React.FC<DreamCardProps> = ({
  dream,
  isSelected,
  onPress,
  isDark = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      borderRadius: 24,
      padding: 24,
      backgroundColor: isSelected
        ? isDark
          ? "#1b1f52"
          : EvidenceBoardColors.white
        : dream.dream_card_bg ||
          (isDark ? "#2B2D56" : EvidenceBoardColors.dream_card_bg),
      borderWidth: isSelected ? 2 : 0,
      borderColor: isSelected ? EvidenceBoardColors.teal : "transparent",
      opacity: 1,
      shadowColor: isDark ? "rgba(0,0,0,0.4)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    }}>
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
      }}>
      {dream.isComplete && (
        <View
          style={{
            backgroundColor: isDark
              ? "rgba(34, 197, 94, 0.2)"
              : EvidenceBoardColors.successLight,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: EvidenceBoardColors.success,
            }}>
            Completed!
          </Text>
        </View>
      )}
    </View>
    <Text
      style={{
        fontSize: 18,
        fontWeight: "bold",
        color: "#000000",
        marginBottom: 12,
      }}>
      {dream.title}
    </Text>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text
        style={{
          fontSize: 14,
          color: "#000000",
        }}>
        🏆 {dream.couragePoints} courage points
      </Text>
    </View>
  </TouchableOpacity>
);
