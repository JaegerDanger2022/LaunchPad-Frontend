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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { ChevronLeft } from "lucide-react-native";
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
import { DreamCompleteVideoOverlay } from "../components/animations/DreamCompleteVideoOverlay";
import { UnlockMessageToast } from "../components/UnlockMessageToast";
import { fetchDreamDetails } from "../config/api";

const { height: screenHeight } = Dimensions.get("window");

// Challenge type animation mapping (using PNGs for all types)
const challengeTypeAnimations: Record<string, any> = {
  power_move: require("../assets/animations/PowerMove.png"),
  knowledge_quest: require("../assets/animations/KnowledgeQuest.png"),
  courage_check: require("../assets/animations/courageCheck.png"),
  skill_flex: require("../assets/animations/SkillFlex.png"),
  decision_point: require("../assets/animations/DecisionPoint.png"),
  celebration_moment: require("../assets/animations/Celebration Moment.png"),
  prep_ritual: require("../assets/animations/PrepRitual.png"),
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
  dreamThreadId,
}: {
  onNavigate: (screen: string, params?: any) => void;
  milestoneId?: string;
  dreamThreadId?: string;
}) => {
  const getMilestoneCompletions = useAppStore((state) => state.getMilestoneCompletions);
  const setMilestoneCompletions = useAppStore((state) => state.setMilestoneCompletions);
  const completedSteps = milestoneId ? getMilestoneCompletions(milestoneId) : 0;
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
  const [isLoadingMilestone, setIsLoadingMilestone] = React.useState(true);
  const [currentDream, setCurrentDream] = React.useState<any>(null);
  const user = useAuthStore((state) => state.user);

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

  // Skeleton loading animation
  React.useEffect(() => {
    if (isLoadingMilestone) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [isLoadingMilestone]);

  // Load full dream details and extract milestone data
  React.useEffect(() => {
    const loadDreamAndMilestone = async () => {
      if (!milestoneId || !dreamThreadId || !user?.uid) {
        setIsLoadingMilestone(false);
        return;
      }

      try {
        // Fetch full dream details to ensure milestones are loaded
        const dreamDetails = await fetchDreamDetails(user.uid, dreamThreadId);

        if (!dreamDetails || dreamDetails.thread_id !== dreamThreadId) {
          console.error('[MilestoneScreen] Dream details mismatch or not found');
          setIsLoadingMilestone(false);
          return;
        }

        // Find milestone ONLY in this dream
        const foundMilestone = dreamDetails.roadmap?.milestones?.find(
          (m: any) => m.id === milestoneId
        );

        if (foundMilestone) {
          // Add dream metadata to milestone for victory card creation
          const enhancedMilestone = {
            ...foundMilestone,
            dreamTitle: dreamDetails.dream || '',
            dreamCategory: dreamDetails.roadmap?.category || 'achievement_goals',
          };

          console.log('[MilestoneScreen] Loaded milestone from dream:', {
            milestoneId,
            dreamThreadId,
            dreamTitle: dreamDetails.dream,
            milestoneTitle: enhancedMilestone.title,
          });

          setMilestone(enhancedMilestone);
          setThreadId(dreamDetails.thread_id || "");
          setCurrentDream(dreamDetails);

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
        } else {
          console.error('[MilestoneScreen] Milestone not found in dream:', {
            milestoneId,
            dreamThreadId,
            availableMilestones: dreamDetails.roadmap?.milestones?.map((m: any) => m.id),
          });
        }
      } catch (error) {
        console.error('[MilestoneScreen] Error loading milestone:', error);
      } finally {
        setIsLoadingMilestone(false);
      }
    };

    loadDreamAndMilestone();
  }, [milestoneId, dreamThreadId, user?.uid]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        // Only activate pan responder if dragging vertically more than horizontally
        // and moving downward (dy > 0)
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 5;
      },
      onMoveShouldSetPanResponderCapture: () => false,
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
    if (completedSteps < 3 && milestoneId) {
      setMilestoneCompletions(milestoneId, completedSteps + 1);
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
        }}>
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
                paddingBottom: 20,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                transform: [{ scale: handleScaleAnim }],
              }}
              {...panResponder.panHandlers}>
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
                  width: 48,
                  height: 48,
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <ChevronLeft size={24} color={Color.colorWhite} strokeWidth={2.5} />
              </TouchableOpacity>
              <Text
                style={{
                  color: Color.colorBlack,
                  fontSize: 18,
                  fontWeight: "600",
                }}>
                Milestone
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingBottom: 20,
              }}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              bounces={true}>
              {/* Title */}
              <View
                style={{
                  alignItems: "center",
                  paddingHorizontal: 40,
                  marginTop: 10,
                  paddingBottom: 40,
                }}>
                {isLoadingMilestone ? (
                  // Loading Skeleton
                  <>
                    {/* Skeleton Animation Circle */}
                    <Animated.View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                        marginBottom: 20,
                        opacity: fadeAnim,
                      }}
                    />

                    {/* Skeleton Title */}
                    <Animated.View
                      style={{
                        width: "80%",
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                        marginBottom: 12,
                        opacity: fadeAnim,
                      }}
                    />

                    {/* Skeleton Description Lines */}
                    <Animated.View
                      style={{
                        width: "90%",
                        height: 18,
                        borderRadius: 4,
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        marginBottom: 8,
                        opacity: fadeAnim,
                      }}
                    />
                    <Animated.View
                      style={{
                        width: "85%",
                        height: 18,
                        borderRadius: 4,
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        marginBottom: 25,
                        opacity: fadeAnim,
                      }}
                    />

                    {/* Skeleton Divider */}
                    <View
                      style={{
                        width: 80,
                        height: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        marginBottom: 25,
                      }}
                    />

                    {/* Skeleton Motivation */}
                    <Animated.View
                      style={{
                        width: "70%",
                        height: 16,
                        borderRadius: 4,
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        opacity: fadeAnim,
                      }}
                    />
                  </>
                ) : (
                  // Actual Content
                  <>
                    {/* Challenge Type Animation - Above Title */}
                    {milestone?.challenge_type &&
                    challengeTypeAnimations[milestone.challenge_type] ? (
                      <View
                        style={{
                          alignItems: "center",
                          marginBottom: 8,
                        }}>
                        <Image
                          source={challengeTypeAnimations[milestone.challenge_type]}
                          style={{
                            width: 64,
                            height: 64,
                          }}
                          resizeMode="contain"
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

                    {/* Description */}
                    <Text
                      style={{
                        color: Color.colorBlack,
                        textAlign: "center",
                        fontSize: 14,
                        lineHeight: 24,
                        opacity: 0.95,
                        width: "100%",
                        marginBottom: 25,
                        paddingHorizontal: 8,
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
                  </>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>

        {/* Bottom Action Section */}
        {isLoadingMilestone ? (
          // Skeleton for bottom action section
          <View
            style={{
              flex: 3,
              backgroundColor: themeColors.bg_secondary,
              paddingHorizontal: 24,
              paddingTop: 30,
              paddingBottom: 20,
              justifyContent: "center",
              alignItems: "center",
            }}>
            {/* Skeleton Button */}
            <Animated.View
              style={{
                width: "90%",
                height: 56,
                borderRadius: 28,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                opacity: fadeAnim,
                marginBottom: 20,
              }}
            />
            {/* Skeleton Text Lines */}
            <Animated.View
              style={{
                width: "60%",
                height: 16,
                borderRadius: 4,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                opacity: fadeAnim,
                marginBottom: 10,
              }}
            />
            <Animated.View
              style={{
                width: "50%",
                height: 16,
                borderRadius: 4,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                opacity: fadeAnim,
              }}
            />
          </View>
        ) : milestone?.streak_eligible ? (
          <RepeatableGoal
            completedSteps={completedSteps}
            onPress={handlePress}
            milestoneId={milestoneId}
            threadId={threadId}
            milestoneStatus={milestone?.status}
            milestone={milestone}
            onDreamComplete={() => setShowDreamCompleteAnimation(true)}
            onNavigate={onNavigate}
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

        {/* Dream Complete Animation Modal - FinalCelebration.mp4 */}
        {showDreamCompleteAnimation && (
          <Modal
            visible={showDreamCompleteAnimation}
            transparent
            animationType="fade">
            <DreamCompleteVideoOverlay
              visible={showDreamCompleteAnimation}
              onComplete={() => setShowDreamCompleteAnimation(false)}
            />
          </Modal>
        )}
      </Animated.View>
    </View>
  );
};

export default MilestoneScreen;
