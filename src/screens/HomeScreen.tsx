import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, Image, Animated, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color } from "../constants/GlobalStyles";
import {
  ClockIcon,
  LightningIcon,
  ArrowRightIcon,
  AvatarIcon,
} from "../components/icons/SVGIcons";
import { GoalCard, type GoalCardData } from "../components/GoalCard";
import { TopNavbar } from "../components/TopNavbar";
import { BottomNavbar } from "../components/BottomNavbar";
import { TabBar, type TabType } from "../components/TabBar";

const HomeScreen = ({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("recents");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const communityFadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade out and slide down
    fadeAnim.setValue(0);

    slideAnim.setValue(20);

    // Then fade in and slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab, fadeAnim, slideAnim]);

  useEffect(() => {
    // Animate community wins section on mount
    Animated.timing(communityFadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [communityFadeAnim]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false },
  );

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.5],
    extrapolate: "clamp",
  });

  const heroScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.95],
    extrapolate: "clamp",
  });

  const goalCardsData: GoalCardData[] = useMemo(
    () => [
      {
        title: "I want to start a podcast about tech careers",
        bgImage: require("../assets/images/goal-podcast.png"),
        bgColor: Color.colorBurlywood,
        progressColor: "#6B9BD1",
      },
      {
        title: "I want to visit the bahamas",
        bgImage: require("../assets/images/goal-bahamas.png"),
        bgColor: Color.colorCadetblue,
        progressColor: "#6dc0c3",
      },
    ],
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Color.colorSnow }}>
      <TopNavbar title="Ready to win, Kyla-Marie?" />
      <BottomNavbar />
      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            backgroundColor: Color.colorWhite,
            overflow: "hidden",
          }}>
          {/* Background gradient container */}
          <View
            style={{
              position: "absolute",
              top: -9,
              left: -3,
              backgroundColor: Color.colorSnow,
              width: 442,
              height: 941,
            }}
          />

          {/*  Hero Card Section */}
          <Animated.View
            style={{
              flexDirection: "column",
              marginHorizontal: 37,
              marginTop: 10,
              marginBottom: 20,
              borderRadius: 35,
              overflow: "hidden",
              zIndex: 10,
              opacity: heroOpacity,
              transform: [{ scale: heroScale }],
            }}>
            {/* Hero Background Image */}
            <Image
              source={require("../assets/images/hero-bg.png")}
              style={{
                width: "100%",
                height: 184,
                borderTopLeftRadius: 35,
                borderTopRightRadius: 35,
              }}
            />

            {/* Up Next Badge - Positioned absolutely over image */}
            <View
              style={{
                position: "absolute",
                top: 11,
                left: 20,
                height: 42,
                width: 159,
                zIndex: 5,
              }}>
              <LinearGradient
                style={{
                  backgroundColor: "transparent",
                  borderRadius: 35,
                  height: 42,
                  width: 159,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                locations={[0, 1]}
                colors={[Color.colorOrangered, "#f79971"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <Text
                  style={{
                    color: Color.colorWhite,
                    fontFamily: "InstrumentSans-Bold",
                    fontWeight: "700",
                    fontSize: 20,
                    textAlign: "center",
                  }}>
                  Up next
                </Text>
              </LinearGradient>
            </View>

            {/* Gradient Background for Bottom Section */}
            <LinearGradient
              style={{
                width: "100%",
                paddingHorizontal: 20,
                paddingVertical: 15,
                borderBottomLeftRadius: 35,
                borderBottomRightRadius: 35,
              }}
              locations={[0, 1]}
              colors={["#f9f0e4", "#f9f0e4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}>
              {/* Task Title */}
              <Text
                style={{
                  fontSize: 20,
                  textAlign: "left",
                  color: Color.colorBlack,
                  fontFamily: "InstrumentSans-Bold",
                  fontWeight: "700",
                  marginBottom: 12,
                }}>
                Seek feedback on pilot
              </Text>

              {/* Chips Row */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 15,
                  marginBottom: 15,
                }}>
                {/* ETA / Time Chip */}
                <View
                  style={{
                    backgroundColor: Color.colorDarkgray,
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 20,
                    height: 32,
                    width: 89,
                    paddingHorizontal: 8,
                  }}>
                  <View
                    style={{
                      width: "30%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    <ClockIcon size={20} color="#a29f9b" />
                  </View>
                  <View
                    style={{
                      width: "70%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    <Text
                      style={{
                        color: Color.colorWhite,
                        fontSize: 15,
                        fontFamily: "InstrumentSans-Bold",
                        fontWeight: "700",
                      }}>
                      20 min
                    </Text>
                  </View>
                </View>

                {/* XP Chip */}
                <LinearGradient
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 20,
                    height: 32,
                    width: 89,
                    paddingHorizontal: 8,
                  }}
                  locations={[0.11, 1]}
                  colors={["#bdf1cd", "#bdf1cd"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}>
                  <View
                    style={{
                      width: "30%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    <LightningIcon size={20} color="#ff9000" />
                  </View>
                  <View
                    style={{
                      width: "70%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    <Text
                      style={{
                        color: Color.colorDarkorange,
                        fontSize: 15,
                        fontFamily: "InstrumentSans-Bold",
                        fontWeight: "700",
                        textAlign: "center",
                      }}>
                      +65 XP
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={() => onNavigate("Milestone")}
                activeOpacity={0.8}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: 50,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}>
                  <LinearGradient
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                    }}
                    locations={[0.38, 1]}
                    colors={[Color.colorOrangered, "rgba(247, 153, 113, 0.86)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  <View
                    style={{
                      flex: 0.7,
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: Color.colorWhite,
                        fontFamily: "InstrumentSans-Bold",
                        fontWeight: "700",
                        textAlign: "center",
                      }}>
                      LET'S GOOO!
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.3,
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                    }}>
                    <ArrowRightIcon size={20} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Recents and Favorites Section */}
          <View
            style={{
              flexDirection: "column",
              marginHorizontal: 17,
              marginTop: 20,
              marginBottom: 20,
              zIndex: 10,
            }}>
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}>
              {activeTab === "recents" ? (
                /* Goal Cards Row */
                <View
                  style={{
                    flexDirection: "row",
                    gap: 14,
                  }}>
                  {goalCardsData.map((card, index) => (
                    <GoalCard
                      key={index}
                      data={card}
                      onPress={() => onNavigate("Dream")}
                    />
                  ))}
                </View>
              ) : (
                /* No Inspiration Yet Placeholder */
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 60,
                    paddingHorizontal: 40,
                  }}>
                  {/* Decorative Circle Background */}
                  <View
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      backgroundColor: "#F0F0F0",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 24,
                    }}>
                    {/* Lightbulb Icon */}
                    <Text
                      style={{
                        fontSize: 60,
                        opacity: 0.6,
                      }}>
                      💡
                    </Text>
                  </View>

                  {/* Main Text */}
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: Color.colorBlack,
                      fontFamily: "InstrumentSans-Bold",
                      marginBottom: 12,
                      textAlign: "center",
                    }}>
                    No Inspiration Yet
                  </Text>

                  {/* Subtitle */}
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#A0A0A0",
                      fontFamily: "InstrumentSans-Regular",
                      textAlign: "center",
                      lineHeight: 20,
                      marginBottom: 24,
                    }}>
                    Discover inspiring goals and ideas from our community to get started on your journey
                  </Text>

                  {/* Decorative Dots */}
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 6,
                      marginTop: 12,
                    }}>
                    {[1, 2, 3].map((dot) => (
                      <View
                        key={dot}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: dot === 2 ? "#00D4AA" : "#E0E0E0",
                        }}
                      />
                    ))}
                  </View>
                </View>
              )}
            </Animated.View>
          </View>

          {/* Community Wins Section */}
          <Animated.View
            style={{
              flexDirection: "column",
              marginHorizontal: 17,
              marginTop: 20,
              marginBottom: 20,
              zIndex: 10,
              opacity: communityFadeAnim,
              transform: [
                {
                  translateY: communityFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}>
            {/* Title */}
            <Text
              style={{
                fontSize: 20,
                textAlign: "left",
                color: Color.colorBlack,
                fontFamily: "InstrumentSans-Bold",
                fontWeight: "700",
                marginBottom: 12,
              }}>
              Community Wins
            </Text>

            {/* Card Content */}
            <View
              style={{
                backgroundColor: Color.colorLavender,
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}>
              {/* Avatar */}
              <View
                style={{
                  marginTop: 5,
                }}>
                <AvatarIcon size={36} color={Color.colorLightsteelblue} />
              </View>

              {/* Text Content */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  gap: 4,
                }}>
                <Text
                  style={{
                    color: Color.colorBlack,
                    fontFamily: "InstrumentSans-Medium",
                    fontWeight: "500",
                    fontSize: 20,
                    textAlign: "left",
                  }}>
                  Jessica M.
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: "left",
                    color: Color.colorBlack,
                  }}>
                  Just booked my solo {"\n"}trip to Tokyo!
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
