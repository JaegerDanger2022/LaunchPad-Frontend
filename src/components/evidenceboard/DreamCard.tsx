import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
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
}) => {
  const textColor = isDark ? "#ffffff" : "#000000";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.cardWrapper,
        {
          borderColor: dream.dream_card_bg || "transparent",
          backgroundColor: "#FFFFFF",
          shadowColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#000",
          shadowOpacity: isDark ? 1 : 0.1,
        }
      ]}>
      <BlurView
        intensity={isDark ? 80 : 20}
        tint={isDark ? "dark" : "light"}
        style={styles.blurContainer}>
        <View
          style={[
            styles.contentWrapper,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.08)"
                : isSelected
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(255, 255, 255, 0.6)",
            }
          ]}>
          <View style={styles.headerRow}>
            {dream.isComplete && (
              <View
                style={[
                  styles.completedBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(34, 197, 94, 0.2)"
                      : EvidenceBoardColors.successLight,
                  }
                ]}>
                <Text style={styles.completedText}>Completed!</Text>
              </View>
            )}
          </View>

          <Text style={[styles.title, { color: textColor }]}>
            {dream.title.charAt(0).toUpperCase() + dream.title.slice(1)}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={[styles.courageText, { color: textColor }]}>
              🏆 {dream.couragePoints} courage points
            </Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 24,
    borderWidth: 2,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: "hidden",
  },
  contentWrapper: {
    padding: 24,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  completedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "600",
    color: EvidenceBoardColors.success,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  courageText: {
    fontSize: 14,
  },
});
