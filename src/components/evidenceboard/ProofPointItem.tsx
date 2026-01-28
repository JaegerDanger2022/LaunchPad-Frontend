import React from "react";
import { View, Text } from "react-native";
import { EvidenceBoardColors } from "../../constants/GlobalStyles";

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
      return EvidenceBoardColors.amber400;
    case "high":
      return EvidenceBoardColors.rose400;
    case "medium":
      return EvidenceBoardColors.purple400;
    default:
      return EvidenceBoardColors.teal400;
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
  <View style={{ flexDirection: "row", marginBottom: 24, alignItems: "flex-start" }}>
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: point.completed ? getImpactColor(point.impact) : EvidenceBoardColors.gray300,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
        flexShrink: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {point.completed ? (
        <Text style={{ fontSize: 24, fontWeight: "bold", color: EvidenceBoardColors.white }}>✓</Text>
      ) : (
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: EvidenceBoardColors.white,
          }}
        />
      )}
    </View>

    <View
      style={{
        flex: 1,
        borderRadius: 12,
        padding: 16,
        backgroundColor: point.completed ? EvidenceBoardColors.white : EvidenceBoardColors.gray100,
        opacity: point.completed ? 1 : 0.7,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 4,
              color: point.completed ? EvidenceBoardColors.text.primary : EvidenceBoardColors.gray500,
            }}
          >
            {point.mission}
          </Text>
          <Text style={{ fontSize: 12, color: EvidenceBoardColors.gray500 }}>
            {formatDateShort(point.date)}
          </Text>
        </View>
        {point.impact === "critical" && point.completed && (
          <View
            style={{
              backgroundColor: "#FEF3C7",
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "bold", color: "#B45309" }}>✨ Big Win</Text>
          </View>
        )}
      </View>

      {point.completed && (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 11, color: EvidenceBoardColors.text.secondary }}>
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
