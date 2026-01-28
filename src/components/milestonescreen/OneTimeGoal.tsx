import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import Svg, { Line } from "react-native-svg";
import { Color, getThemeColors } from "../../constants/GlobalStyles";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import { updateMilestoneStatus } from "../../config/api";
import { SuccessAnimationOverlay } from "../animations/SuccessAnimationOverlay";

interface OneTimeGoalProps {
  isCompleted: boolean;
  onPress: () => void;
  milestoneId?: string;
  threadId?: string;
  onDreamComplete?: () => void;
}

export const OneTimeGoal: React.FC<OneTimeGoalProps> = ({
  isCompleted,
  onPress,
  milestoneId,
  threadId,
  onDreamComplete,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handlePress = async () => {
    // console.log("=== OneTimeGoal Button Pressed ===");
    // console.log("userId:", user?.uid);
    // console.log("milestoneId:", milestoneId);
    // console.log("threadId:", threadId);

    onPress();

    // Show immediate success animation when button is clicked
    setShowSuccessAnimation(true);

    // Call API if we have the necessary data
    if (user?.uid && milestoneId && threadId) {
      setIsLoading(true);
      console.log("Making API call with:", {
        userId: user.uid,
        threadId,
        milestoneId,
        status: "completed",
      });
      try {
        const response = await updateMilestoneStatus(
          user.uid,
          threadId,
          milestoneId,
          "completed",
        );
        console.log("API Response:", response);
        console.log("Milestone status updated successfully");

        // Update local state in Zustand
        if (response.success) {
          const { updateMilestoneStatusLocal, loadUserData } = useAuthStore.getState();
          updateMilestoneStatusLocal(threadId, milestoneId, "completed");

          // Show dream complete animation for 4 seconds if dream is complete
          if (response.isComplete) {
            console.log("Dream complete! isComplete:", response.isComplete);
            onDreamComplete?.();
          }

          // Refetch user data to get fresh values from backend
          await loadUserData(user.uid).catch((error: any) => {
            console.error("Failed to refetch user data:", error.message);
          });
        }
      } catch (error: any) {
        console.error("Failed to update milestone status:", error.message);
        console.error("Full error:", error);
        Alert.alert("Error", "Failed to update milestone. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      console.warn("Missing required data for API call");
      console.warn("userId exists:", !!user?.uid);
      console.warn("milestoneId exists:", !!milestoneId);
      console.warn("threadId exists:", !!threadId);
    }
  };

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
          <Line
            x1="0"
            y1="2"
            x2="40"
            y2="2"
            stroke={themeColors.text_secondary}
            strokeWidth="4"
            strokeLinecap="round"
          />
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
        onPress={handlePress}
        disabled={isLoading || isCompleted}
        activeOpacity={0.8}
        style={{
          width: "100%",
          height: 60,
          backgroundColor: isCompleted ? "#CCCCCC" : "#00D4AA",
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
          opacity: isLoading || isCompleted ? 0.6 : 1,
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

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <SuccessAnimationOverlay
          visible={showSuccessAnimation}
          onComplete={() => setShowSuccessAnimation(false)}
          duration={2000}
        />
      )}
    </View>
  );
};
