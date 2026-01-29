import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { HomeIcon, DreamsIcon, EvidenceIcon } from "./icons/SVGIcons";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";

interface BottomNavbarProps {
  onNavigate?: (screen: string) => void;
  activeTab?: "home" | "dreams" | "evidence" | "community";
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ onNavigate, activeTab = "home" }) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  // Adjust gap based on number of tabs (3 or 4)
  const tabCount = 4;
  const baseGap = 20;
  const adjustedGap = Math.max(8, baseGap - (tabCount - 3) * 3);

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
        gap: adjustedGap,
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

      {/* Evidence Board Icon */}
      <TouchableOpacity
        onPress={() => onNavigate?.("EvidenceBoard")}
        style={{
          backgroundColor: activeTab === "evidence" ? Color.colorOrangered : "transparent",
          height: 43,
          width: activeTab === "evidence" ? 117 : 43,
          alignItems: "center",
          justifyContent: "center",
          borderTopRightRadius: 40,
          borderTopLeftRadius: 40,
          borderBottomRightRadius: activeTab === "evidence" ? 35 : 21,
          borderBottomLeftRadius: activeTab === "evidence" ? 35 : 21,
          borderWidth: 1,
          borderColor: activeTab === "evidence" ? Color.colorWhite : "transparent",
          borderStyle: "solid",
          flexDirection: "row",
          gap: 8,
        }}>
        <EvidenceIcon size={31} color={activeTab === "evidence" ? Color.colorWhite : themeColors.text_secondary} />
        {activeTab === "evidence" && (
          <Text
            style={{
              color: Color.colorWhite,
              fontFamily: "InstrumentSans-Regular",
              fontSize: 20,
              textAlign: "center",
            }}>
            Evidence
          </Text>
        )}
      </TouchableOpacity>

      {/* Community Icon */}
      <TouchableOpacity
        onPress={() => onNavigate?.("Community")}
        style={{
          backgroundColor: activeTab === "community" ? Color.colorOrangered : "transparent",
          height: 43,
          width: activeTab === "community" ? 117 : 43,
          alignItems: "center",
          justifyContent: "center",
          borderTopRightRadius: 40,
          borderTopLeftRadius: 40,
          borderBottomRightRadius: activeTab === "community" ? 35 : 21,
          borderBottomLeftRadius: activeTab === "community" ? 35 : 21,
          borderWidth: 1,
          borderColor: activeTab === "community" ? Color.colorWhite : "transparent",
          borderStyle: "solid",
          flexDirection: "row",
          gap: 8,
        }}>
        <Text style={{
          fontSize: 28,
          color: activeTab === "community" ? Color.colorWhite : themeColors.text_secondary,
        }}>
          🏆
        </Text>
        {activeTab === "community" && (
          <Text
            style={{
              color: Color.colorWhite,
              fontFamily: "InstrumentSans-Regular",
              fontSize: 20,
              textAlign: "center",
            }}>
            Victory
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
