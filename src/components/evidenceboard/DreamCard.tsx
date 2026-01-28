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
  dream: Dream;
  isSelected: boolean;
  onPress: () => void;
}

const getCategoryGradient = (
  category: Dream["category"]
): [string, string, ...string[]] => {
  switch (category) {
    case "travel":
      return [EvidenceBoardColors.gradient.travelStart, EvidenceBoardColors.gradient.travelEnd];
    case "career":
      return [EvidenceBoardColors.gradient.careerStart, EvidenceBoardColors.gradient.careerEnd];
    case "financial":
      return [EvidenceBoardColors.gradient.financialStart, EvidenceBoardColors.gradient.financialEnd];
    default:
      return [EvidenceBoardColors.gradient.defaultStart, EvidenceBoardColors.gradient.defaultEnd];
  }
};

export const DreamCard: React.FC<DreamCardProps> = ({
  dream,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      borderRadius: 24,
      padding: 24,
      backgroundColor: EvidenceBoardColors.white,
      borderWidth: isSelected ? 2 : 0,
      borderColor: isSelected ? EvidenceBoardColors.teal : "transparent",
      opacity: isSelected ? 1 : 0.8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }}
  >
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
      <LinearGradient
        colors={getCategoryGradient(dream.category)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 20 }}>
          {dream.category === "travel"
            ? "✈️"
            : dream.category === "career"
              ? "💼"
              : "💰"}
        </Text>
      </LinearGradient>
      {dream.status === "completed" && (
        <View
          style={{
            backgroundColor: EvidenceBoardColors.successLight,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: EvidenceBoardColors.success }}>
            Completed!
          </Text>
        </View>
      )}
    </View>
    <Text style={{ fontSize: 18, fontWeight: "bold", color: EvidenceBoardColors.text.primary, marginBottom: 12 }}>
      {dream.title}
    </Text>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text style={{ fontSize: 14, color: EvidenceBoardColors.text.secondary }}>
        🏆 {dream.couragePoints} courage points
      </Text>
    </View>
  </TouchableOpacity>
);
