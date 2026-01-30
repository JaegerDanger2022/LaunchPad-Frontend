import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import Svg, { Line } from "react-native-svg";
import { Color, getThemeColors } from "../../constants/GlobalStyles";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import { updateMilestoneStatus, updateStreak } from "../../config/api";
import { SuccessAnimationOverlay } from "../animations/SuccessAnimationOverlay";
import { StreakToastNotification } from "../streak/StreakToastNotification";
import { StreakAchievementModal } from "../streak/StreakAchievementModal";
import { ImpactLevel } from "../../types/community";

interface OneTimeGoalProps {
  isCompleted: boolean;
  onPress: () => void;
  milestoneId?: string;
  threadId?: string;
  milestone?: any;
  onDreamComplete?: () => void;
  onNavigate?: (screen: string, params?: any) => void;
}

export const OneTimeGoal: React.FC<OneTimeGoalProps> = ({
  isCompleted,
  onPress,
  milestoneId,
  threadId,
  milestone,
  onDreamComplete,
  onNavigate,
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

  // Victory Wall share flow
  const [showShareButton, setShowShareButton] = useState(false);
  const [shareButtonOpacity] = useState(new Animated.Value(0));
  const { userData } = useAuthStore();

  // Journey Recap flow (when dream is completed)
  const [isDreamCompleted, setIsDreamCompleted] = useState(false);
  const [dreamStats, setDreamStats] = useState<any>(null);

  // Debug: Log when share button state changes
  React.useEffect(() => {
    console.log("[OneTimeGoal] showShareButton changed to:", showShareButton);
  }, [showShareButton]);

  const handlePress = async () => {
    // Prevent multiple clicks
    if (isLoading || showSuccessAnimation) {
      return;
    }

    // console.log("=== OneTimeGoal Button Pressed ===");
    // console.log("userId:", user?.uid);
    // console.log("milestoneId:", milestoneId);
    // console.log("threadId:", threadId);

    onPress();

    // Show immediate success animation when button is clicked
    console.log("[OneTimeGoal] Setting showSuccessAnimation to true");
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

          // 2. Check if dream is complete (new Journey Recap flow)
          if (response.dreamCompleted) {
            console.log("Dream complete! dreamCompleted:", response.dreamCompleted);
            console.log("Dream stats:", response.dreamStats);
            setIsDreamCompleted(true);
            setDreamStats(response.dreamStats);

            // Trigger dream complete animation in MilestoneScreen
            onDreamComplete?.();
          }
          // Fallback to old isComplete flag if dreamCompleted not present
          else if (response.isComplete) {
            console.log("Dream complete! isComplete:", response.isComplete);
            onDreamComplete?.();
          }

          // 3. Refetch user data from backend and wait for completion
          await loadUserData(user.uid).catch((error: any) => {
            console.error("Failed to refetch user data:", error.message);
          });

          // 4. Trigger up_next recalculation after fresh data is in store
          updateUpNext();

          // 5. Update streak for all milestone completions
          console.log("[OneTimeGoal] Updating streak for milestone:", milestoneId);
          const streakResponse = await updateStreak(user.uid, {
            milestone_id: milestoneId,
            completion_date: new Date().toISOString(),
            is_streak_eligible: true,
          });

          console.log("[OneTimeGoal] Streak response:", streakResponse);

          if (streakResponse.success && streakResponse.streak_data) {
            const { updateStreakData } = useAuthStore.getState();
            updateStreakData(streakResponse.streak_data);
            console.log("[OneTimeGoal] Updated streak in store");

            // Show streak notifications
            if (streakResponse.streak_increased) {
              setCurrentStreak(streakResponse.streak_data.current_streak);
              setShowStreakToast(true);
              console.log("[OneTimeGoal] Showing streak toast:", streakResponse.streak_data.current_streak);
            }

            // Show achievement modal if milestone reached
            if (streakResponse.milestone_achieved) {
              setAchievementType(streakResponse.milestone_achieved);
              setShowAchievementModal(true);
              console.log("[OneTimeGoal] Showing achievement modal:", streakResponse.milestone_achieved);
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
          onComplete={() => {
            console.log("[OneTimeGoal] Success animation completed");
            setShowSuccessAnimation(false);

            // Show journey complete toast if dream is complete
            if (isDreamCompleted) {
              const Toast = require('react-native-toast-message').default;
              Toast.show({
                type: 'success',
                text1: '🎉 Dream Complete!',
                text2: 'Share your journey with the community',
                visibilityTime: 4000,
              });
            }

            // Show share button after animation completes
            setTimeout(() => {
              console.log("[OneTimeGoal] Showing share button");
              setShowShareButton(true);
              Animated.timing(shareButtonOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start();
            }, 500);
          }}
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

      {/* Share Victory Button */}
      {showShareButton && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 80,
            left: 0,
            right: 0,
            alignItems: 'center',
            opacity: shareButtonOpacity,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#2D5BFF',
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 8,
            }}
            onPress={() => {
              if (onNavigate && milestone) {
                // Dismiss any active toasts before navigating
                const Toast = require('react-native-toast-message').default;
                Toast.hide();

                // If dream is completed, navigate to ShareJourneyRecap instead
                if (isDreamCompleted && dreamStats) {
                  console.log('[OneTimeGoal] Dream completed - Navigating to ShareJourneyRecap');
                  onNavigate('ShareJourneyRecap', {
                    journeyRecap: {
                      id: '',
                      userId: user?.uid || '',
                      userDisplayName: userData?.firstname || 'User',
                      userLocation: userData?.communityProfile?.location,
                      userAge: userData?.communityProfile?.age,
                      dreamId: threadId || '',
                      dreamTitle: milestone?.dreamTitle || '',
                      dreamCategory: milestone?.dreamCategory || 'achievement_goals',
                      journeyStory: '',
                      totalMilestones: dreamStats.totalMilestones || 0,
                      durationDays: dreamStats.durationDays || 0,
                      keyMoment: '',
                      completedDate: dreamStats.dreamCompletedDate || new Date().toISOString(),
                      createdAt: new Date().toISOString(),
                      courageBoosts: 0,
                      hasUserBoosted: false,
                      permissionsCount: 0,
                      meTooCount: 0,
                      hasUserMeTooed: false,
                      isAnonymous: false,
                    },
                  });
                } else {
                  // Regular milestone - navigate to ShareVictory
                  console.log('[OneTimeGoal] Navigating to ShareVictory with milestone:', milestone);
                  onNavigate('ShareVictory', {
                    victory: {
                      id: '',
                      userId: user?.uid || '',
                      userDisplayName: userData?.firstname || 'User',
                      userLocation: userData?.communityProfile?.location,
                      userAge: userData?.communityProfile?.age,
                      milestoneId: milestoneId || '',
                      milestoneTitle: milestone?.title || milestone?.name || '',
                      dreamId: threadId || '',
                      dreamTitle: milestone?.dreamTitle || '',
                      dreamCategory: milestone?.dreamCategory || 'achievement_goals',
                      evidenceSnippet: milestone?.evidence || '',
                      confidenceBoost: milestone?.xp_points || 10,
                      impactLevel: (milestone?.impact as ImpactLevel) || 'high',
                      completedDate: new Date().toISOString(),
                      createdAt: new Date().toISOString(),
                      courageBoosts: 0,
                      hasUserBoosted: false,
                      permissionsCount: 0,
                      meTooCount: 0,
                      hasUserMeTooed: false,
                      isAnonymous: false,
                    },
                  });
                }
              }
            }}
          >
            <Text style={{ fontSize: 20 }}>{isDreamCompleted ? '⭐' : '🏆'}</Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              {isDreamCompleted ? 'Share your journey?' : 'Share your victory?'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginTop: 12,
              paddingVertical: 8,
              paddingHorizontal: 16,
            }}
            onPress={() => {
              setShowShareButton(false);
              shareButtonOpacity.setValue(0);
            }}
          >
            <Text style={{ color: themeColors.text_secondary, fontSize: 14 }}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};
