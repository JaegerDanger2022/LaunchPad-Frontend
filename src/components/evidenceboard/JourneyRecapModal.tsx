import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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

interface JourneyRecapModalProps {
  visible: boolean;
  dream: Dream;
  totalMissions: number;
  onClose: () => void;
}

export const JourneyRecapModal: React.FC<JourneyRecapModalProps> = ({
  visible,
  dream,
  totalMissions,
  onClose,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.recapContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={["#FEE2E2", "#FEF3C7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.recapContent}
        >
          <View style={styles.recapHeader}>
            <LinearGradient
              colors={["#FBBF24", "#FB7185"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.recapIcon}
            >
              <Text style={styles.trophyIcon}>🏆</Text>
            </LinearGradient>
            <Text style={styles.recapTitle}>You Did It!</Text>
            <Text style={styles.recapSubtitle}>Journey Complete</Text>
          </View>

          <View style={styles.recapStats}>
            <View style={styles.recapStatRow}>
              <Text style={styles.recapStatLabel}>Time taken</Text>
              <Text style={styles.recapStatValue}>70 days</Text>
            </View>
            <View style={styles.recapStatRow}>
              <Text style={styles.recapStatLabel}>Missions completed</Text>
              <Text style={styles.recapStatValue}>{totalMissions} actions</Text>
            </View>
            <View style={styles.recapStatRow}>
              <Text style={styles.recapStatLabel}>Courage earned</Text>
              <Text
                style={[
                  styles.recapStatValue,
                  { color: "#B45309" },
                ]}
              >
                {dream.couragePoints} points
              </Text>
            </View>
          </View>

          <View style={styles.recapQuote}>
            <Text style={styles.quoteText}>
              "A month ago, this was just a dream. Today, it's your reality. You
              showed up, took action, and proved to yourself what you're capable of."
            </Text>
            <Text style={styles.quoteAuthor}>— Gabby</Text>
          </View>

          <View style={styles.recapButtonRow}>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share Victory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  recapContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 32,
    overflow: "hidden",
    position: "relative",
  },
  recapContent: {
    padding: 32,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 32,
    color: "#6B7280",
    fontWeight: "300",
  },
  recapHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  recapIcon: {
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
  },
  trophyIcon: {
    fontSize: 32,
  },
  recapTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  recapSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  recapStats: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recapStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  recapStatLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  recapStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  recapQuote: {
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#374151",
    lineHeight: 22,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "right",
  },
  recapButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
});
