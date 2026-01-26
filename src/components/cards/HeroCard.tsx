import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ClockIcon,
  LightningIcon,
  ArrowRightIcon,
} from "./icons/SVGIcons";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";

interface HeroCardProps {
  heroOpacity: Animated.AnimatedInterpolation<number>;
  heroScale: Animated.AnimatedInterpolation<number>;
  badge: string;
  title: string;
  timeMinutes: number;
  xpPoints: number;
  onPress: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  heroOpacity,
  heroScale,
  badge,
  title,
  timeMinutes,
  xpPoints,
  onPress,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

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
        colors={[themeColors.bg_secondary, themeColors.bg_secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>
        {/* Task Title */}
        <Text
          style={{
            fontSize: 20,
            textAlign: "left",
            color: themeColors.text_primary,
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
                  color: Color.colorDarkorange,
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
  );
};
