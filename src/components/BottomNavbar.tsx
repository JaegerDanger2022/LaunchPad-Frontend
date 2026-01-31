import React from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeIcon, DreamsIcon, EvidenceIcon } from "./icons/SVGIcons";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";
import { Users, Settings } from "lucide-react-native";

interface BottomNavbarProps {
  onNavigate?: (screen: string) => void;
  activeTab?: "home" | "dreams" | "evidence" | "community" | "settings";
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ onNavigate, activeTab = "home" }) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: "home", icon: HomeIcon, label: "Home", screen: "Home" },
    { id: "dreams", icon: DreamsIcon, label: "Dreams", screen: "AllDreams" },
    { id: "evidence", icon: EvidenceIcon, label: "Evidence", screen: "EvidenceBoard" },
    { id: "community", icon: Users, label: "Community", screen: "Community" },
    { id: "settings", icon: Settings, label: "Settings", screen: "Settings" },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme === 'dark'
            ? 'rgba(28, 28, 30, 0.98)' // iOS dark blur background
            : 'rgba(255, 255, 255, 0.98)', // iOS light blur background
          borderTopColor: theme === 'dark'
            ? 'rgba(84, 84, 88, 0.3)' // iOS dark separator
            : 'rgba(0, 0, 0, 0.1)', // iOS light separator
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 8),
        }
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
                color={isActive ? Color.colorOrangered : themeColors.text_secondary}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? Color.colorOrangered : themeColors.text_secondary,
                  fontWeight: isActive ? '600' : '400',
                }
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 0.5,
    // iOS-style backdrop blur effect simulation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  iconContainer: {
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontFamily: "InstrumentSans-Regular",
    textAlign: "center",
    letterSpacing: 0.1,
  },
});
