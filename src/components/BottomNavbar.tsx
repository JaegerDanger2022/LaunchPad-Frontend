import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeBlurView } from "./SafeBlurView";
import { HomeIcon, EvidenceIcon } from "./icons/SVGIcons";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { Goal, Users, BarChart2 } from "lucide-react-native";

interface BottomNavbarProps {
  onNavigate?: (screen: string) => void;
  activeTab?: "home" | "dreams" | "evidence" | "community" | "analytics";
}

export const BottomNavbar: React.FC<BottomNavbarProps> = React.memo(({
  onNavigate,
  activeTab = "home",
}) => {
  const { theme } = useThemeStore();
  const { isPremium } = useAuthStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();

  // Darken unselected tab color in light mode for better visibility
  const unselectedColor = theme === "dark" ? themeColors.text_secondary : "#6B7280";

  const tabs = [
    { id: "home", icon: HomeIcon, label: "Home", screen: "Home" },
    { id: "dreams", icon: Goal, label: "Dreams", screen: "AllDreams" },
    {
      id: "evidence",
      icon: EvidenceIcon,
      label: "Evidence",
      screen: "EvidenceBoard",
    },
    { id: "community", icon: Users, label: "Community", screen: "Community" },
    { id: "analytics", icon: BarChart2, label: "Analytics", screen: "Analytics" },
  ];

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom > 0 ? insets.bottom + 4 : 12 }]}>
      <SafeBlurView
        intensity={60}
        tint={theme === "dark" ? "dark" : "light"}
        style={[
          styles.container,
          {
            paddingBottom: 4,
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
                    isActive ? Color.colorOrangered : unselectedColor
                  }
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {/* Premium badge for Analytics tab */}
                {tab.id === "analytics" && !isPremium && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -8,
                      backgroundColor: Color.colorOrangered,
                      borderRadius: 8,
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                    }}>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 8,
                        fontWeight: "700",
                        fontFamily: "InstrumentSans-Bold",
                      }}>
                      PRO
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive
                      ? Color.colorOrangered
                      : unselectedColor,
                    fontWeight: isActive ? "600" : "400",
                  },
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </SafeBlurView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
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
    backgroundColor: "rgba(255, 255, 255, 0.25)",
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
