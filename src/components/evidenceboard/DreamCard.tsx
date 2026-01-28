import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Color } from "../../constants/GlobalStyles";

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
      return ["#14B8A6", "#06B6D4"]; // teal to cyan
    case "career":
      return ["#F43F5E", "#EC4899"]; // rose to pink
    case "financial":
      return ["#F59E0B", "#F97316"]; // amber to orange
    default:
      return ["#A855F7", "#6366F1"]; // purple to indigo
  }
};

export const DreamCard: React.FC<DreamCardProps> = ({
  dream,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.dreamCard,
      {
        backgroundColor: isSelected ? "#FFFFFF" : "#FFFFFF",
        borderWidth: isSelected ? 2 : 0,
        borderColor: isSelected ? "#14B8A6" : "transparent",
        opacity: isSelected ? 1 : 0.8,
      },
    ]}
  >
    <View style={styles.dreamCardHeader}>
      <LinearGradient
        colors={getCategoryGradient(dream.category)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.categoryIcon}
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
          style={[
            styles.completedBadge,
            { backgroundColor: "rgba(34, 197, 94, 0.2)" },
          ]}
        >
          <Text style={styles.completedBadgeText}>Completed!</Text>
        </View>
      )}
    </View>
    <Text style={styles.dreamTitle}>{dream.title}</Text>
    <View style={styles.couragePoints}>
      <Text style={styles.couragePointsText}>
        🏆 {dream.couragePoints} courage points
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  dreamCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dreamCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  completedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#15803D",
  },
  dreamTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  couragePoints: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  couragePointsText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
