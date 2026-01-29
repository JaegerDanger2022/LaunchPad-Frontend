import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import LottieView from "lottie-react-native";
import {
  Color,
  getThemeColors,
  ChallengeTypeColors,
} from "../constants/GlobalStyles";
import { useAppStore } from "../store/appStore";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { RepeatableGoal } from "../components/milestonescreen/RepeatableGoal";
import { OneTimeGoal } from "../components/milestonescreen/OneTimeGoal";
import { SuccessAnimationOverlay } from "../components/animations/SuccessAnimationOverlay";
import { FireworksAnimationOverlay } from "../components/animations/FireworksAnimationOverlay";
import { UnlockMessageToast } from "../components/UnlockMessageToast";

const { height: screenHeight } = Dimensions.get("window");

// Challenge type animation mapping
const challengeTypeAnimations: Record<string, any> = {
  power_move: require("../assets/animations/power_move.json"),
  knowledge_quest: require("../assets/animations/knowledge_quest.json"),
  // Add other animations as they become available
};

// Helper function to generate gradient colors from a hex color
const generateGradientColors = (hexColor: string): [string, string] => {
  // Lighten the color for the second gradient stop
  const lighten = (color: string, percent: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };

  return [hexColor, lighten(hexColor, 15)];
};

const MilestoneScreen = ({
  onNavigate,
  milestoneId,
}: {
  onNavigate: (screen: string) => void;
  milestoneId?: string;
}) => {
  const completedSteps = useAppStore((state) => state.completedSteps);
  const setCompletedSteps = useAppStore((state) => state.setCompletedSteps);
  const { userData } = useAuthStore();
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const dragAmount = useRef(0).current;
  const handleScaleAnim = useRef(new Animated.Value(1)).current;
  const [milestone, setMilestone] = React.useState<any>(null);
  const [threadId, setThreadId] = React.useState<string>("");
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [showDreamCompleteAnimation, setShowDreamCompleteAnimation] =
    React.useState(false);
  const [showUnlockToast, setShowUnlockToast] = React.useState(false);
  const [unlockMessage, setUnlockMessage] = React.useState<string>("");

  // Drag handle hover animation
  const startHandleHover = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(handleScaleAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(handleScaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  React.useEffect(() => {
    startHandleHover();
  }, []);

  // Extract milestone data by milestone ID
  React.useEffect(() => {
    if (milestoneId && userData?.dreams) {
      // Search through all dreams and milestones to find the one with matching ID
      for (const dream of userData.dreams) {
        if (dream.roadmap?.milestones) {
          const foundMilestone = dream.roadmap.milestones.find(
            (m: any) => m.id === milestoneId,
          );
          if (foundMilestone) {
            // Add dream metadata to milestone for victory card creation
            setMilestone({
              ...foundMilestone,
              dreamTitle: dream.dream || '',
              dreamCategory: dream.category || 'achievement_goals',
            });
            setThreadId(dream?.thread_id || "");

            // Show unlock message toast if available (after 2 second delay)
            if (foundMilestone.unlock_message) {
              const messages = Array.isArray(foundMilestone.unlock_message)
                ? foundMilestone.unlock_message
                : [foundMilestone.unlock_message];

              if (messages.length > 0) {
                // Delay showing the toast by 2 seconds
                const timer = setTimeout(() => {
                  // Pick a random message
                  const randomMessage =
                    messages[Math.floor(Math.random() * messages.length)];
                  setUnlockMessage(randomMessage);
                  setShowUnlockToast(true);
                }, 2000);

                return () => clearTimeout(timer);
              }
            }
            break;
          }
        }
      }
    }
  }, [milestoneId, userData]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt, gestureState) => {
        if (gestureState.dy > 0) {
          // Only allow downward drag
          const newDrag = Math.min(gestureState.dy, 100);
          dragY.setValue(newDrag);
        }
      },
      onPanResponderRelease: (_evt, gestureState) => {
        // If dragged more than 50px down, close the screen
        if (gestureState.dy > 50) {
          handleClose();
        } else {
          // Spring back
          Animated.spring(dragY, {
            toValue: 0,
            tension: 40,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    // Slide up animation + fade in on mount
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const handleClose = () => {
    // Slide down animation + fade out before closing
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onNavigate("Home");
    });
  };

  const handlePress = () => {
    if (completedSteps < 3) {
      setCompletedSteps(completedSteps + 1);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      {/* Toast - positioned at root level to avoid layout shift */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 9999,
        }}>
        <UnlockMessageToast
          visible={showUnlockToast}
          message={unlockMessage}
          onComplete={() => setShowUnlockToast(false)}
        />
      </View>

      {/* Modal sliding from bottom */}
      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }, { translateY: dragY }],
          backgroundColor: themeColors.bg_primary,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          overflow: "hidden",
          flex: 1,
        }}
        {...panResponder.panHandlers}>
        {/* Top Section with Gradient */}
        <LinearGradient
          colors={generateGradientColors(
            ChallengeTypeColors[
              milestone?.challenge_type as keyof typeof ChallengeTypeColors
            ] || "#4FA9DB",
          )}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            flex: 2,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          }}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Drag Handle */}
            <Animated.View
              style={{
                alignItems: "center",
                paddingTop: 40,
                paddingBottom: 0,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                transform: [{ scale: handleScaleAnim }],
              }}>
              <Svg width="40" height="4" viewBox="0 0 40 4">
                <Path
                  d="M 0 2 L 40 2"
                  stroke={Color.colorBlack}
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </Svg>
            </Animated.View>

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 24,
                paddingTop: 50,
              }}>
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <Text style={{ color: Color.colorBlack, fontSize: 20 }}>←</Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: Color.colorBlack,
                  fontSize: 18,
                  fontWeight: "600",
                }}>
                Goal
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "flex-start",
              }}
              showsVerticalScrollIndicator={false}>
              {/* Title */}
              <View
                style={{
                  alignItems: "center",
                  paddingHorizontal: 40,
                  marginTop: 10,
                  paddingBottom: 40,
                }}>
                {/* Challenge Type Animation - Above Title */}
                {milestone?.challenge_type &&
                challengeTypeAnimations[milestone.challenge_type] ? (
                  <View
                    style={{
                      alignItems: "center",
                      marginBottom: 8,
                    }}>
                    <LottieView
                      source={challengeTypeAnimations[milestone.challenge_type]}
                      autoPlay
                      loop={false}
                      style={{
                        width: 80,
                        height: 80,
                      }}
                    />
                  </View>
                ) : null}

                <Text
                  style={{
                    color: Color.colorBlack,
                    fontSize: 30,
                    fontWeight: "700",
                    marginBottom: 12,
                    textAlign: "center",
                  }}>
                  {milestone?.title || milestone?.name || "Untitled Milestone"}
                </Text>

                <Text
                  style={{
                    color: Color.colorBlack,
                    textAlign: "center",
                    fontSize: 14,
                    lineHeight: 24,
                    opacity: 0.95,
                    marginBottom: 25,
                  }}>
                  {milestone?.description || "No description available"}
                </Text>

                <View
                  style={{
                    width: 80,
                    height: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    marginBottom: 25,
                  }}
                />

                <Text
                  style={{
                    color: Color.colorBlack,
                    textAlign: "center",
                    fontSize: 14,
                    lineHeight: 20,
                  }}>
                  {milestone?.motivation_hook ||
                    "Mark it as complete to progress!"}
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>

        {/* Bottom Action Section */}
        {milestone?.streak_eligible ? (
          <RepeatableGoal
            completedSteps={completedSteps}
            onPress={handlePress}
            milestoneId={milestoneId}
            threadId={threadId}
            milestoneStatus={milestone?.status}
            milestone={milestone}
            onDreamComplete={() => setShowDreamCompleteAnimation(true)}
          />
        ) : (
          <OneTimeGoal
            isCompleted={isCompleted || milestone?.status === "completed"}
            onPress={() => setIsCompleted(true)}
            milestoneId={milestoneId}
            threadId={threadId}
            milestone={milestone}
            onDreamComplete={() => setShowDreamCompleteAnimation(true)}
            onNavigate={onNavigate}
          />
        )}

        {/* Dream Complete Animation Modal - Fireworks for 4 seconds */}
        {showDreamCompleteAnimation && (
          <Modal
            visible={showDreamCompleteAnimation}
            transparent
            animationType="fade">
            <FireworksAnimationOverlay
              visible={showDreamCompleteAnimation}
              onComplete={() => setShowDreamCompleteAnimation(false)}
              duration={4000}
            />
          </Modal>
        )}
      </Animated.View>
    </View>
  );
};

export default MilestoneScreen;
