import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Color } from "../constants/GlobalStyles";

const MilestoneScreen = ({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) => {
  const [completedSteps, setCompletedSteps] = useState(0);
  const slideAnim = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    // Slide up animation on mount
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleClose = () => {
    // Slide down animation before closing
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onNavigate("Home");
    });
  };

  const handlePress = () => {
    if (completedSteps < 3) {
      setCompletedSteps((prev) => prev + 1);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <StatusBar barStyle="light-content" />

      {/* Pressable overlay to close modal */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        style={{ flex: 1 }}
      />

      {/* Modal sliding from bottom */}
      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }],
          backgroundColor: Color.colorWhite,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          overflow: "hidden",
          flex: 8,
        }}>
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
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 24,
                paddingTop: 10,
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
            <View
              style={{
                alignItems: "center",
                paddingHorizontal: 40,
                marginTop: 40,
              }}>
              <View style={{ marginBottom: 25 }}>
                <Svg width="64" height="80" viewBox="0 0 64 80">
                  <Path
                    d="M32 0C32 0 12 25 12 45C12 58.807 21.193 70 32 70C42.807 70 52 58.807 52 45C52 25 32 0 32 0Z"
                    fill={Color.colorWhite}
                  />
                </Svg>
              </View>

              <Text
                style={{
                  color: Color.colorWhite,
                  fontSize: 30,
                  fontWeight: "700",
                  marginBottom: 12,
                }}>
                Drink Water
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
                This week, drink water as soon as you wake up. You're hydrating
                your body and, just as importantly, you're demonstrating
                follow-through.
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
                <Text style={{ fontWeight: "bold" }}>Drink Water</Text> has been
                added to your{" "}
                <Text style={{ fontWeight: "bold" }}>Morning Routine</Text>.
                Mark it as complete to progress!
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Bottom Action Section */}
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
              color: Color.colorBlack,
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
                    num <= completedSteps ? "#00D4AA" : Color.colorWhite,
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
                    color: num <= completedSteps ? Color.colorWhite : "#A0A0A0",
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
            activeOpacity={0.8}
            style={{
              width: "100%",
              height: 60,
              backgroundColor: "#00D4AA",
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}>
            <Text
              style={{
                color: Color.colorWhite,
                fontSize: 18,
                fontWeight: "700",
              }}>
              {completedSteps === 3
                ? "Goal Completed!"
                : "I have done this today!"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ width: "100%", paddingVertical: 10 }}>
            <Text
              style={{
                color: "#8E8E93",
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
        </View>
      </Animated.View>
    </View>
  );
};

export default MilestoneScreen;
