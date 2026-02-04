import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Lock } from "lucide-react-native";
import { ClockIcon, LightningIcon, ArrowRightIcon } from "../icons/SVGIcons";
import { Color, ChallengeTypeColors } from "../../constants/GlobalStyles";
import { useThemeStore } from "../../store/themeStore";

interface UpNextHeroCardProps {
  heroOpacity: Animated.AnimatedInterpolation<number>;
  heroScale: Animated.AnimatedInterpolation<number>;
  title: string;
  timeMinutes: number;
  xpPoints: number;
  challengeType?: string;
  isLocked?: boolean;
  onPress: () => void;
}

export const UpNextHeroCard: React.FC<UpNextHeroCardProps> = ({
  heroOpacity,
  heroScale,
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

  const bgColor = theme === "dark" ? "#2A2A2A" : "#E8E8E8";

  return (
    <Animated.View
      style={{
        marginHorizontal: 17,
        marginBottom: 20,
        borderRadius: 16,
        overflow: "hidden",
        height: 180,
        backgroundColor: bgColor,
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
      <View
        style={{
          flex: 1,
          padding: 20,
          justifyContent: "space-between",
        }}>
        {/* Up Next Badge */}
        <View
          style={{
            width: 80,
            height: 24,
            backgroundColor: cardColor,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Text
            style={{
              color: Color.colorWhite,
              fontFamily: "InstrumentSans-Bold",
              fontWeight: "700",
              fontSize: 12,
            }}>
            Up next
          </Text>
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 20,
            color: theme === "dark" ? Color.colorWhite : Color.colorBlack,
            fontFamily: "InstrumentSans-Bold",
            fontWeight: "700",
          }}
          numberOfLines={2}>
          {title}
        </Text>

        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
          }}>
          {/* Time Chip */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor:
                theme === "light" ? "#f0f0f0" : Color.colorDarkgray,
              borderRadius: 8,
              height: 32,
              paddingHorizontal: 10,
            }}>
            <ClockIcon
              size={16}
              color={theme === "light" ? "#666666" : "#a29f9b"}
            />
            <Text
              style={{
                color: theme === "light" ? Color.colorBlack : Color.colorWhite,
                fontSize: 14,
                fontFamily: "InstrumentSans-Bold",
                fontWeight: "700",
              }}>
              {timeMinutes} min
            </Text>
          </View>

          {/* XP Chip */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#bdf1cd",
              borderRadius: 8,
              height: 32,
              paddingHorizontal: 10,
            }}>
            <LightningIcon size={16} color="#ff9000" />
            <Text
              style={{
                color:
                  theme === "light"
                    ? Color.colorDarkorange
                    : Color.colorWhite,
                fontSize: 14,
                fontFamily: "InstrumentSans-Bold",
                fontWeight: "700",
              }}>
              +{xpPoints} XP
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={isLocked ? 1 : 0.8}
            disabled={isLocked}
            style={{ marginLeft: "auto" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                height: 32,
                borderRadius: 8,
                backgroundColor: cardColor,
                paddingHorizontal: 14,
                gap: 4,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  color: Color.colorWhite,
                  fontFamily: "InstrumentSans-Bold",
                  fontWeight: "700",
                }}>
                Go
              </Text>
              <ArrowRightIcon size={16} color={Color.colorWhite} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

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
            borderRadius: 16,
          }}>
          <Lock size={40} color={Color.colorWhite} strokeWidth={1.5} />
        </View>
      )}
    </Animated.View>
  );
};
