import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { HomeIcon, DreamsIcon, EvidenceIcon } from "./icons/SVGIcons";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";
import { Users, Settings } from "lucide-react-native";

interface BottomNavbarProps {
  onNavigate?: (screen: string) => void;
  activeTab?: "home" | "dreams" | "evidence" | "community" | "settings";
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  onNavigate,
  activeTab = "home",
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: "home", icon: HomeIcon, label: "Home", screen: "Home" },
    { id: "dreams", icon: DreamsIcon, label: "Dreams", screen: "AllDreams" },
    {
      id: "evidence",
      icon: EvidenceIcon,
      label: "Evidence",
      screen: "EvidenceBoard",
    },
    { id: "community", icon: Users, label: "Community", screen: "Community" },
    { id: "settings", icon: Settings, label: "Settings", screen: "Settings" },
  ];

  return (
    <View style={styles.wrapper}>
      <BlurView
        intensity={80}
        tint={theme === "dark" ? "dark" : "light"}
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom : 4,
            borderWidth: 1,
            borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
          },
        ]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onNavigate?.(tab.screen)}
              style={styles.tabButton}
              activeOpacity={0.6}>
              <View style={styles.iconContainer}>
                <IconComponent
                  size={24}
                  color={
                    isActive ? Color.colorOrangered : themeColors.text_secondary
                  }
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive
                      ? Color.colorOrangered
                      : themeColors.text_secondary,
                    fontWeight: isActive ? "600" : "400",
                  },
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 4,
    paddingHorizontal: 8,
    borderRadius: 32,
    overflow: "hidden",
    // Liquid glass effect - borders handled in component
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    alignSelf: "stretch",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  iconContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 11,
    fontFamily: "InstrumentSans-Regular",
    textAlign: "center",
    letterSpacing: 0.1,
  },
});
