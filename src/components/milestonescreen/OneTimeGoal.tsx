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
import { updateMilestoneStatus, updateStreak } from "../../config/api";
import { SuccessAnimationOverlay } from "../animations/SuccessAnimationOverlay";
import { StreakToastNotification } from "../streak/StreakToastNotification";
import { StreakAchievementModal } from "../streak/StreakAchievementModal";

interface OneTimeGoalProps {
  isCompleted: boolean;
  onPress: () => void;
  milestoneId?: string;
  threadId?: string;
  milestone?: any;
  onDreamComplete?: () => void;
}

export const OneTimeGoal: React.FC<OneTimeGoalProps> = ({
  isCompleted,
  onPress,
  milestoneId,
  threadId,
  milestone,
  onDreamComplete,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showStreakToast, setShowStreakToast] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achievementType, setAchievementType] = useState<'3_day' | '7_day' | '30_day' | null>(null);

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
      // console.log("Making API call with:", {
      //   userId: user.uid,
      //   threadId,
      //   milestoneId,
      //   status: "completed",
      // });
      try {
        const response = await updateMilestoneStatus(
          user.uid,
          threadId,
          milestoneId,
          "completed",
        );
        // console.log("API Response:", response);
        // console.log("Milestone status updated successfully");

        // Update local state in Zustand
        if (response.success) {
          const { updateMilestoneStatusLocal, loadUserData, updateUpNext } = useAuthStore.getState();

          // 1. Update milestone status immediately (no flash, instant UI update)
          updateMilestoneStatusLocal(threadId, milestoneId, "completed");

          // 2. Show dream complete animation if dream is complete
          if (response.isComplete) {
            console.log("Dream complete! isComplete:", response.isComplete);
            onDreamComplete?.();
          }

          // 3. Refetch user data from backend and wait for completion
          await loadUserData(user.uid).catch((error: any) => {
            console.error("Failed to refetch user data:", error.message);
          });

          // 4. Trigger up_next recalculation after fresh data is in store
          updateUpNext();

          // 5. Update streak if milestone is streak-eligible
          if (milestone?.streak_eligible) {
            const streakResponse = await updateStreak(user.uid, {
              milestone_id: milestoneId,
              completion_date: new Date().toISOString(),
              is_streak_eligible: true,
            });

            if (streakResponse.success && streakResponse.streak_data) {
              const { updateStreakData } = useAuthStore.getState();
              updateStreakData(streakResponse.streak_data);

              // Show streak notifications
              if (streakResponse.streak_increased) {
                setCurrentStreak(streakResponse.streak_data.current_streak);
                setShowStreakToast(true);
              }

              // Show achievement modal if milestone reached
              if (streakResponse.milestone_achieved) {
                setAchievementType(streakResponse.milestone_achieved);
                setShowAchievementModal(true);
              }
            }
          }
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

      {/* Streak Toast Notification */}
      {showStreakToast && (
        <StreakToastNotification
          visible={showStreakToast}
          streakCount={currentStreak}
          onComplete={() => setShowStreakToast(false)}
          duration={3000}
        />
      )}

      {/* Streak Achievement Modal */}
      {showAchievementModal && (
        <StreakAchievementModal
          visible={showAchievementModal}
          achievementType={achievementType}
          streakCount={currentStreak}
          onClose={() => setShowAchievementModal(false)}
        />
      )}
    </View>
  );
};
