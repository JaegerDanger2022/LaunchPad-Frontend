import React from "react";
import { View, Text } from "react-native";
import { getThemeColors } from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";

export const NoRecentsState: React.FC = () => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  return (
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
        {/* Clock Icon */}
        <Text
          style={{
            fontSize: 60,
            opacity: 0.6,
          }}>
          ⏱️
        </Text>
      </View>

      {/* Main Text */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: themeColors.text_primary,
          fontFamily: "InstrumentSans-Bold",
          marginBottom: 12,
          textAlign: "center",
        }}>
        No Recents Yet
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontSize: 14,
          color: themeColors.text_secondary,
          fontFamily: "InstrumentSans-Regular",
          textAlign: "center",
          lineHeight: 20,
          marginBottom: 24,
        }}>
        Start exploring your dreams to build your recents list
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
  );
};
