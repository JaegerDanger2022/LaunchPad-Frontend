import React from "react";
import { View, Text, StyleSheet } from "react-native";

export interface ProofPoint {
  id: number;
  date: string;
  mission: string;
  completed: boolean;
  impact: "critical" | "high" | "medium" | "low";
}

interface ProofPointItemProps {
  point: ProofPoint;
  index: number;
}

const getImpactColor = (impact: ProofPoint["impact"]) => {
  switch (impact) {
    case "critical":
      return "#FBBF24"; // amber-400
    case "high":
      return "#FB7185"; // rose-400
    case "medium":
      return "#A855F7"; // purple-400
    default:
      return "#14B8A6"; // teal-400
  }
};

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const ProofPointItem: React.FC<ProofPointItemProps> = ({
  point,
  index,
}) => (
  <View style={styles.proofPointContainer}>
    <View
      style={[
        styles.timelineDot,
        {
          backgroundColor: point.completed ? getImpactColor(point.impact) : "#E5E7EB",
        },
      ]}
    >
      {point.completed ? (
        <Text style={styles.checkmark}>✓</Text>
      ) : (
        <View style={styles.pendingDot} />
      )}
    </View>

    <View
      style={[
        styles.missionCard,
        {
          backgroundColor: point.completed ? "#FFFFFF" : "#F9FAFB",
          opacity: point.completed ? 1 : 0.7,
        },
      ]}
    >
      <View style={styles.missionHeader}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.missionTitle,
              { color: point.completed ? "#1F2937" : "#9CA3AF" },
            ]}
          >
            {point.mission}
          </Text>
          <Text style={styles.missionDate}>{formatDateShort(point.date)}</Text>
        </View>
        {point.impact === "critical" && point.completed && (
          <View style={styles.bigWinBadge}>
            <Text style={styles.bigWinText}>✨ Big Win</Text>
          </View>
        )}
      </View>

      {point.completed && (
        <View style={styles.couragePointsBadge}>
          <Text style={styles.couragePointsSmallText}>
            +
            {point.impact === "critical"
              ? 100
              : point.impact === "high"
                ? 50
                : 25}{" "}
            courage points
          </Text>
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  proofPointContainer: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    flexShrink: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkmark: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  pendingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  missionCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  missionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  missionDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  bigWinBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bigWinText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#B45309",
  },
  couragePointsBadge: {
    marginTop: 8,
  },
  couragePointsSmallText: {
    fontSize: 11,
    color: "#6B7280",
  },
});
