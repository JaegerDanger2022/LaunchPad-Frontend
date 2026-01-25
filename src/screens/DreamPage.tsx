import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Color } from "../constants/GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ChevronLeft } from "lucide-react-native";
import { Badge } from "../components/common/Badge";

const { width: screenWidth } = Dimensions.get("window");

interface SubtaskCard {
  id: string;
  title: string;
  bgColor: string;
  tags: string[];
  duration: string;
  image: any;
}

const DreamPage = ({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) => {
  // Animated values for elastic header and scroll
  const dragY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [dragAmount, setDragAmount] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Handle scroll animation
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false },
  );

  // Listen to scroll position and update state
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setScrollPosition(value);
    });
    return () => scrollY.removeListener(listener);
  }, [scrollY]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt, gestureState) => {
        if (gestureState.dy > 0) {
          // Only allow downward drag
          const newDrag = Math.min(gestureState.dy, 100);
          dragY.setValue(newDrag);
          setDragAmount(newDrag);
        }
      },
      onPanResponderRelease: (_evt, gestureState) => {
        // If dragged more than 50px down, refresh the page
        if (gestureState.dy > 50) {
          handleRefresh();
        }
        // Always spring back
        Animated.spring(dragY, {
          toValue: 0,
          tension: 40,
          friction: 10,
          useNativeDriver: false,
        }).start();
        setDragAmount(0);
      },
    }),
  ).current;

  // Calculate curve depth: full curve at top (200px), straight line when scrolled (0px)
  const baseCurveDepth = Math.max(0, 200 - scrollPosition * 2);
  const curveDepth = baseCurveDepth + dragAmount;

  // Calculate SVG path: combines scroll animation (curve straightens) + drag animation (curve extends)
  const elasticPath = `M 0 0 L ${screenWidth} 0 L ${screenWidth} ${curveDepth} Q ${screenWidth / 2} ${curveDepth + 50} 0 ${curveDepth} Z`;

  const subtasks: SubtaskCard[] = [
    {
      id: "1",
      title: "Find & book flights",
      bgColor: "#537787",
      tags: ["Planning", "Decision"],
      duration: "60 mins",
      image: require("../assets/images/placeholder-flights.png"),
    },
    {
      id: "2",
      title: "Book lodging",
      bgColor: "#E6BD6E",
      tags: ["Planning", "Decision"],
      duration: "60 mins",
      image: require("../assets/images/placeholder-lodging.png"),
    },
    {
      id: "3",
      title: "Share plans and get feedback",
      bgColor: "#206A77",
      tags: ["Planning", "Decision"],
      duration: "60 mins",
      image: require("../assets/images/placeholder-feedback.png"),
    },
    {
      id: "1",
      title: "Find & book flights",
      bgColor: "#537787",
      tags: ["Planning", "Decision"],
      duration: "60 mins",
      image: require("../assets/images/placeholder-flights.png"),
    },
    {
      id: "2",
      title: "Book lodging",
      bgColor: "#E6BD6E",
      tags: ["Planning", "Decision"],
      duration: "60 mins",
      image: require("../assets/images/placeholder-lodging.png"),
    },
    {
      id: "3",
      title: "Share plans and get feedback",
      bgColor: "#206A77",
      tags: ["Planning", "Decision"],
      duration: "60 mins",
      image: require("../assets/images/placeholder-feedback.png"),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1a2e" }}>
      {/* Back Button - Fixed Position with Semi-transparent Background */}
      <View
        style={{
          position: "absolute",
          top: 16,
          left: 22,
          zIndex: 10,
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <TouchableOpacity
          onPress={() => onNavigate("Home")}
          style={{
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
          }}>
          <ChevronLeft size={24} color={Color.colorWhite} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        {/* Blue Curved Header Background with Content */}

        {/* SVG Curve at bottom */}
        <Svg
          width={screenWidth}
          height={320}
          style={{ position: "absolute", top: 0 }}>
          <Path d={elasticPath} fill="#4FA9DB" stroke="none" />
        </Svg>

        {/* Header Content */}
        <View style={{ paddingHorizontal: 22, paddingTop: 75, zIndex: 2 }}>
          {/* Collection Badge */}
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              marginBottom: 20,
            }}>
            <Text
              style={{
                color: Color.colorWhite,
                fontSize: 12,
                fontWeight: "600",
                fontFamily: "InstrumentSans-Medium",
              }}>
              Collection
            </Text>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: Color.colorWhite,
              fontFamily: "InstrumentSans-Bold",
              marginBottom: 8,
            }}>
            Take 5
          </Text>

          {/* Subtitle */}
          <Text
            style={{
              fontSize: 16,
              color: Color.colorWhite,
              fontFamily: "InstrumentSans-Regular",
              fontWeight: "400",
              opacity: 0.9,
            }}>
            5 minutes a day is all it takes to feel your best.
          </Text>
        </View>

        <Animated.ScrollView>
          {/* Do not delete */}
          {/*  onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          scrollEnabled={dragAmount < 10} */}
          <View
            style={{
              paddingHorizontal: 22,
              paddingTop: 20,
              paddingBottom: 40,
            }}>
            {/* Subtasks Grid - 2 Items Per Row */}
            <View style={{ gap: 16 }}>
              {Array.from({ length: Math.ceil(subtasks.length / 2) }).map(
                (_, rowIndex) => {
                  const rowItems = subtasks.slice(
                    rowIndex * 2,
                    rowIndex * 2 + 2,
                  );
                  return (
                    <View
                      key={rowIndex}
                      style={{ flexDirection: "row", gap: 16 }}>
                      {rowItems.map((subtask) => (
                        <TouchableOpacity
                          key={subtask.id}
                          onPress={() => onNavigate("Milestone")}
                          activeOpacity={0.8}
                          style={{
                            flex: 1,
                            height: 280,
                            borderRadius: 10,
                            overflow: "hidden",
                            backgroundColor: subtask.bgColor,
                          }}>
                          {/* Image */}
                          <Image
                            source={subtask.image}
                            style={{
                              width: "100%",
                              height: 160,
                            }}
                          />

                          {/* Card Content with Gradient */}
                          <LinearGradient
                            style={{
                              flex: 1,
                              paddingHorizontal: 15,
                              paddingVertical: 15,
                              borderBottomLeftRadius: 10,
                              borderBottomRightRadius: 10,
                              justifyContent: "space-between",
                            }}
                            colors={[subtask.bgColor, subtask.bgColor]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}>
                            {/* Title */}
                            <Text
                              style={{
                                fontFamily: "InriaSans-Bold",
                                fontSize: 15,
                                color: Color.colorWhite,
                                fontWeight: "700",
                              }}>
                              {subtask.title}
                            </Text>

                            {/* Tags and Duration */}
                            <View style={{ gap: 8 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  gap: 12,
                                }}>
                                {subtask.tags.map((tag, index) => (
                                  <View
                                    key={index}
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      gap: 6,
                                    }}>
                                    <View
                                      style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: 1,
                                        backgroundColor:
                                          "rgba(255, 255, 255, 0.6)",
                                      }}
                                    />
                                    <Text
                                      style={{
                                        color: Color.colorWhite,
                                        fontSize: 12,
                                        fontWeight: "400",
                                        fontFamily: "InriaSans-Regular",
                                      }}>
                                      {tag}
                                    </Text>
                                  </View>
                                ))}
                              </View>

                              {/* Duration */}
                              <Text
                                style={{
                                  color: Color.colorWhite,
                                  fontSize: 15,
                                  fontFamily: "InriaSans-Regular",
                                  fontWeight: "300",
                                }}>
                                {subtask.duration}
                              </Text>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}

                      {/* Spacer for odd-numbered rows */}
                      {rowItems.length === 1 && <View style={{ flex: 1 }} />}
                    </View>
                  );
                },
              )}
            </View>
          </View>
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default DreamPage;
