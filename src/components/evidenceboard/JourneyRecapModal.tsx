import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { EvidenceBoardColors } from "../../constants/GlobalStyles";

// Helper function to calculate duration between two dates
const calculateDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "1 day";
  } else if (diffDays < 7) {
    return `${diffDays} days`;
  } else if (diffDays < 14) {
    return "1 week";
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""}`;
  } else if (diffDays < 60) {
    return "1 month";
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? "s" : ""}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? "s" : ""}`;
  }
};

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
  isComplete?: boolean;
}

interface JourneyRecapModalProps {
  visible: boolean;
  dream: Dream | null;
  totalMissions?: number;
  onClose: () => void;
}

export const JourneyRecapModal: React.FC<JourneyRecapModalProps> = ({
  visible,
  dream,
  onClose,
}) => {
  if (!dream) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 400,
          }}>
          <View
            style={{
              width: "100%",
              maxWidth: 400,
              borderRadius: 32,
              overflow: "hidden",
              position: "relative",
            }}>
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={onClose}>
            <Text
              style={{
                fontSize: 32,
                color: EvidenceBoardColors.text.secondary,
                fontWeight: "300",
              }}>
              ×
            </Text>
          </TouchableOpacity>

          <LinearGradient
            colors={["#FEE2E2", "#FEF3C7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 32 }}>
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <LinearGradient
                colors={["#FBBF24", "#FB7185"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                <Text style={{ fontSize: 32 }}>🏆</Text>
              </LinearGradient>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: EvidenceBoardColors.text.primary,
                  marginBottom: 4,
                }}>
                You Did It!
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: EvidenceBoardColors.text.secondary,
                }}>
                Journey Complete
              </Text>
            </View>

            <View
              style={{
                backgroundColor: EvidenceBoardColors.white,
                borderRadius: 24,
                padding: 24,
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: EvidenceBoardColors.text.secondary,
                  }}>
                  Time taken
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: EvidenceBoardColors.text.primary,
                  }}>
                  {dream.completedDate
                    ? calculateDuration(dream.startDate, dream.completedDate)
                    : "—"}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: EvidenceBoardColors.text.secondary,
                  }}>
                  Missions completed
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: EvidenceBoardColors.text.primary,
                  }}>
                  {dream.proofPoints.length} actions
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: EvidenceBoardColors.text.secondary,
                  }}>
                  Courage earned
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#B45309",
                  }}>
                  {dream.couragePoints} points
                </Text>
              </View>
            </View>

            <View
              style={{
                borderRadius: 24,
                paddingHorizontal: 24,
                paddingVertical: 20,
                marginBottom: 24,
              }}>
              <Text
                style={{
                  fontSize: 14,
                  fontStyle: "italic",
                  color: "#374151",
                  lineHeight: 22,
                  marginBottom: 12,
                }}>
                "When you started, this was just a dream. Today, it's your
                reality. You showed up, took action, and proved to yourself what
                you're capable of."
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: EvidenceBoardColors.text.secondary,
                  textAlign: "right",
                }}>
                — Gabby
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: EvidenceBoardColors.text.primary,
                  }}>
                  Share Victory
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: EvidenceBoardColors.white,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: EvidenceBoardColors.gray400,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#374151" }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
