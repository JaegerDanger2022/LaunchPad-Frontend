import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { Lock } from "lucide-react-native";
import { ClockIcon, LightningIcon, ArrowRightIcon } from "../icons/SVGIcons";
import { Color, ChallengeTypeColors } from "../../constants/GlobalStyles";
import { useThemeStore } from "../../store/themeStore";

// Challenge type animation mapping
const challengeTypeAnimations: Record<string, any> = {
  power_move: require("../../assets/animations/power_move.json"),
  knowledge_quest: require("../../assets/animations/knowledge_quest.json"),
};

// Helper function to generate gradient colors from a hex color
const generateGradientColors = (hexColor: string): [string, string] => {
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

interface HeroCardProps {
  heroOpacity: Animated.AnimatedInterpolation<number>;
  heroScale: Animated.AnimatedInterpolation<number>;
  badge: string;
  title: string;
  timeMinutes: number;
  xpPoints: number;
  challengeType?: string;
  isLocked?: boolean;
  onPress: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  heroOpacity,
  heroScale,
  badge,
  title,
  timeMinutes,
  xpPoints,
  challengeType,
  isLocked = false,
  onPress,
}) => {
  const { theme } = useThemeStore();
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const cardColor =
    challengeType &&
    ChallengeTypeColors[challengeType as keyof typeof ChallengeTypeColors]
      ? ChallengeTypeColors[challengeType as keyof typeof ChallengeTypeColors]
      : Color.colorOrangered;

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  return (
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
        transform: [
          { scale: Animated.multiply(heroScale, isLocked ? 1 : pulseScale) },
        ],
        shadowColor: cardColor,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        shadowOpacity: isLocked ? 0.3 : 0.6,
        elevation: 10,
      }}>
      {/* Hero Background - Challenge Type Animation or fallback */}
      <View
        style={{
          width: "100%",
          height: 184,
          borderTopLeftRadius: 35,
          borderTopRightRadius: 35,
          backgroundColor: cardColor,
          justifyContent: "center",
          alignItems: "center",
        }}>
        {challengeType && challengeTypeAnimations[challengeType] && (
          <LottieView
            source={challengeTypeAnimations[challengeType]}
            autoPlay
            loop={false}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        )}
      </View>

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
            width: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
          locations={[0, 1]}
          colors={generateGradientColors(cardColor)}
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
            {badge}
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
        colors={generateGradientColors(cardColor)}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>
        {/* Task Title */}
        <Text
          style={{
            fontSize: 20,
            textAlign: "left",
            color: Color.colorWhite,
            fontFamily: "InstrumentSans-Bold",
            fontWeight: "700",
            marginBottom: 12,
          }}>
          {title}
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
              backgroundColor:
                theme === "light" ? "#f0f0f0" : Color.colorDarkgray,
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
              <ClockIcon
                size={20}
                color={theme === "light" ? "#666666" : "#a29f9b"}
              />
            </View>
            <View
              style={{
                width: "70%",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Text
                style={{
                  color:
                    theme === "light" ? Color.colorBlack : Color.colorWhite,
                  fontSize: 15,
                  fontFamily: "InstrumentSans-Bold",
                  fontWeight: "700",
                }}>
                {timeMinutes} min
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
                  color:
                    theme === "light"
                      ? Color.colorDarkorange
                      : Color.colorWhite,
                  fontSize: 15,
                  fontFamily: "InstrumentSans-Bold",
                  fontWeight: "700",
                  textAlign: "center",
                }}>
                +{xpPoints} XP
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={isLocked ? 1 : 0.8}
          disabled={isLocked}>
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

      {/* Locked Overlay */}
      {isLocked && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 35,
          }}>
          <Lock size={56} color={Color.colorWhite} strokeWidth={1.5} />
        </View>
      )}
    </Animated.View>
  );
};
