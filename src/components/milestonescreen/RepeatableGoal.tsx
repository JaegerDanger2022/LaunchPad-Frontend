import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Color, getThemeColors } from "../../constants/GlobalStyles";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import { updateMilestoneStatus } from "../../config/api";
import { SuccessAnimationOverlay } from "../animations/SuccessAnimationOverlay";

interface RepeatableGoalProps {
  completedSteps: number;
  onPress: () => void;
  milestoneId?: string;
  threadId?: string;
  milestoneStatus?: string;
  onDreamComplete?: () => void;
}

export const RepeatableGoal: React.FC<RepeatableGoalProps> = ({
  completedSteps,
  onPress,
  milestoneId,
  threadId,
  milestoneStatus,
  onDreamComplete,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handlePress = async () => {
    // console.log("=== RepeatableGoal Button Pressed ===");
    // console.log("userId:", user?.uid);
    // console.log("milestoneId:", milestoneId);
    // console.log("completedSteps:", completedSteps);

    onPress();

    // Show immediate success animation when button is clicked
    setShowSuccessAnimation(true);

    // Call API if we have the necessary data
    if (user?.uid && milestoneId && threadId) {
      setIsLoading(true);
      const newCompletedSteps = completedSteps + 1;
      const status = newCompletedSteps === 3 ? "completed" : "in_progress";

      // console.log("Making API call with:", {
      //   userId: user.uid,
      //   threadId,
      //   milestoneId,
      //   status,
      //   newCompletedSteps,
      // });

      try {
        const response = await updateMilestoneStatus(
          user.uid,
          threadId,
          milestoneId,
          status,
        );
        // console.log("API Response:", response);
        // console.log("Milestone status updated successfully");

        // Update local state in Zustand
        if (response.success) {
          const { updateMilestoneStatusLocal, loadUserData } = useAuthStore.getState();
          updateMilestoneStatusLocal(threadId, milestoneId, status);

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
      // console.warn("Missing required data for API call");
      // console.warn("userId exists:", !!user?.uid);
      // console.warn("milestoneId exists:", !!milestoneId);
      // console.warn("threadId exists:", !!threadId);
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
        onPress={handlePress}
        disabled={isLoading || milestoneStatus === "completed"}
        activeOpacity={0.8}
        style={{
          width: "100%",
          height: 60,
          backgroundColor: milestoneStatus === "completed" ? "#CCCCCC" : "#00D4AA",
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
          opacity: isLoading || milestoneStatus === "completed" ? 0.6 : 1,
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
