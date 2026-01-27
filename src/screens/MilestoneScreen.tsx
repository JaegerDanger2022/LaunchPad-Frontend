import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { useAppStore } from "../store/appStore";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { RepeatableGoal } from "../components/milestonescreen/RepeatableGoal";
import { OneTimeGoal } from "../components/milestonescreen/OneTimeGoal";

const { height: screenHeight } = Dimensions.get("window");

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
  const [isCompleted, setIsCompleted] = React.useState(false);

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

  // Extract milestone data from userId
  React.useEffect(() => {
    if (milestoneId && userData?.dreams) {
      const [dreamIndex, milestoneIndex] = milestoneId.split("-").map(Number);
      const dream = userData.dreams[dreamIndex];
      const milestoneData = dream?.roadmap?.milestones?.[milestoneIndex];
      if (milestoneData) {
        setMilestone(milestoneData);
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

      {/* Modal sliding from bottom */}
      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }, { translateY: dragY }],
          backgroundColor: themeColors.bg_primary,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          overflow: "hidden",
          flex: 8,
        }}
        {...panResponder.panHandlers}>
        {/* Top Section with Gradient */}
        <LinearGradient
          colors={["#4FA9DB", "#5CB8E8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            flex: 1.6,
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
                  stroke={Color.colorWhite}
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
                <Text style={{ color: Color.colorWhite, fontSize: 20 }}>←</Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: Color.colorWhite,
                  fontSize: 18,
                  fontWeight: "600",
                }}>
                Goal
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Icon & Description */}

            {/* Title */}
            <View
              style={{
                alignItems: "center",
                paddingHorizontal: 40,
                marginTop: 40,
              }}>
              <Text
                style={{
                  color: Color.colorWhite,
                  fontSize: 30,
                  fontWeight: "700",
                  marginBottom: 12,
                  textAlign: "center",
                }}>
                {milestone?.title || milestone?.name || "Untitled Milestone"}
              </Text>

              <Text
                style={{
                  color: Color.colorWhite,
                  textAlign: "center",
                  fontSize: 16,
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
                  color: Color.colorWhite,
                  textAlign: "center",
                  fontSize: 14,
                  lineHeight: 20,
                }}>
                {milestone?.motivation_hook ||
                  "Mark it as complete to progress!"}
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Bottom Action Section */}
        {milestone?.streak_eligible ? (
          <RepeatableGoal completedSteps={completedSteps} onPress={handlePress} />
        ) : (
          <OneTimeGoal isCompleted={isCompleted} onPress={() => setIsCompleted(true)} />
        )}
      </Animated.View>
    </View>
  );
};

export default MilestoneScreen;
