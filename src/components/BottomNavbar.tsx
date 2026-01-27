import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { HomeIcon, DreamsIcon } from "./icons/SVGIcons";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";

interface BottomNavbarProps {
  onNavigate?: (screen: string) => void;
  activeTab?: "home" | "dreams";
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ onNavigate, activeTab = "home" }) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        backgroundColor: themeColors.bg_primary,
        borderWidth: 1,
        borderColor: themeColors.bg_primary,
        borderStyle: "solid",
        gap: 20,
        zIndex: 20,
      }}>
      {/* Active Home Tab */}
      <TouchableOpacity
        onPress={() => onNavigate?.("Home")}
        style={{
          backgroundColor: activeTab === "home" ? Color.colorOrangered : "transparent",
          height: 43,
          width: activeTab === "home" ? 117 : 43,
          alignItems: "center",
          justifyContent: "center",
          borderTopRightRadius: 40,
          borderTopLeftRadius: 40,
          borderBottomRightRadius: activeTab === "home" ? 35 : 21,
          borderBottomLeftRadius: activeTab === "home" ? 35 : 21,
          borderWidth: 1,
          borderColor: activeTab === "home" ? Color.colorWhite : "transparent",
          borderStyle: "solid",
          flexDirection: "row",
          gap: 8,
        }}>
        <HomeIcon size={31} color={activeTab === "home" ? Color.colorWhite : themeColors.text_secondary} />
        {activeTab === "home" && (
          <Text
            style={{
              color: Color.colorWhite,
              fontFamily: "InstrumentSans-Regular",
              fontSize: 20,
              textAlign: "center",
            }}>
            Home
          </Text>
        )}
      </TouchableOpacity>

      {/* Dreams Icon */}
      <TouchableOpacity
        onPress={() => onNavigate?.("AllDreams")}
        style={{
          backgroundColor: activeTab === "dreams" ? Color.colorOrangered : "transparent",
          height: 43,
          width: activeTab === "dreams" ? 117 : 43,
          alignItems: "center",
          justifyContent: "center",
          borderTopRightRadius: 40,
          borderTopLeftRadius: 40,
          borderBottomRightRadius: activeTab === "dreams" ? 35 : 21,
          borderBottomLeftRadius: activeTab === "dreams" ? 35 : 21,
          borderWidth: 1,
          borderColor: activeTab === "dreams" ? Color.colorWhite : "transparent",
          borderStyle: "solid",
          flexDirection: "row",
          gap: 8,
        }}>
        <DreamsIcon size={31} color={activeTab === "dreams" ? Color.colorWhite : themeColors.text_secondary} />
        {activeTab === "dreams" && (
          <Text
            style={{
              color: Color.colorWhite,
              fontFamily: "InstrumentSans-Regular",
              fontSize: 20,
              textAlign: "center",
            }}>
            Dreams
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
