import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { Color } from "../../constants/GlobalStyles";

interface MilestoneCardProps {
  id: string;
  title: string;
  bgColor: string;
  tags: string[];
  duration: string;
  image: any;
  animation?: any;
  onPress: () => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  id,
  title,
  bgColor,
  tags,
  duration,
  image,
  animation,
  onPress,
}) => {
  return (
    <TouchableOpacity
      key={id}
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flex: 1,
        height: 280,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: bgColor,
      }}>
      {/* Image (without animation) */}
      <Image
        source={image}
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
        colors={[bgColor, bgColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>
        {/* Animation above title */}
        {animation && (
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <LottieView
              source={animation}
              autoPlay
              loop
              style={{
                width: 60,
                height: 60,
              }}
            />
          </View>
        )}

        {/* Title */}
        <Text
          style={{
            fontFamily: "InriaSans-Bold",
            fontSize: 15,
            color: Color.colorWhite,
            fontWeight: "700",
          }}>
          {title}
        </Text>

        {/* Tags and Duration */}
        <View style={{ gap: 8 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}>
            {tags.map((tag, index) => (
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
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
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
            {duration}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};
