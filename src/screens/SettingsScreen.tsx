import React from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../components/BottomNavbar";
import { ProfileHeader } from "../components/settings/ProfileHeader";
import { SettingRow } from "../components/settings/SettingRow";
import { StatsRings } from "../components/settings/StatsRings";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { getThemeColors } from "../constants/GlobalStyles";
import Toast from "react-native-toast-message";

interface SettingsScreenProps {
  onNavigate?: (screen: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
}) => {
  const { user, userData, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  // Calculate user stats
  const dreamCount = userData?.dreams?.length || 0;
  const currentStreak = userData?.streak?.current_streak || 0;
  // const couragePoints = userData?.couragePoints || 0; // Muted - may be re-enabled later

  // Count completed milestones
  const completedMilestones =
    userData?.dreams?.reduce((total: number, dream: any) => {
      const completed =
        dream.roadmap?.milestones?.filter((m: any) => m.status === "completed")
          .length || 0;
      return total + completed;
    }, 0) || 0;

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              Toast.show({
                type: "success",
                text1: "Logged Out",
                text2: "See you soon!",
                visibilityTime: 2000,
              });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Logout Failed",
                text2: "Please try again",
                visibilityTime: 2000,
              });
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleChangePassword = () => {
    onNavigate?.("ChangePassword");
  };

  const handleOpenLink = (linkType: string) => {
    Toast.show({
      type: "info",
      text1: "Coming Soon",
      text2: `${linkType} will be available soon`,
      visibilityTime: 2000,
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.bg_primary }]}>
      <BottomNavbar onNavigate={onNavigate} activeTab="settings" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        {userData && (
          <ProfileHeader
            firstname={userData.firstname || "User"}
            lastname={userData.lastname || ""}
            email={userData.email || user?.email || ""}
            createdAt={userData.created_at}
          />
        )}

        {/* Stats Section */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Your Stats
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: themeColors.bg_secondary,
                borderColor: themeColors.border,
              },
            ]}>
            <StatsRings
              currentStreak={currentStreak}
              dreamCount={dreamCount}
              completedMilestones={completedMilestones}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Preferences
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: themeColors.bg_secondary,
                borderColor: themeColors.border,
              },
            ]}>
            <SettingRow
              icon="🎨"
              label="Theme"
              value={theme === "light" ? "Light" : "Dark"}
              isSwitch
              switchValue={theme === "dark"}
              onSwitchChange={(value) => {
                toggleTheme();
                Toast.show({
                  type: "success",
                  text1: `${value ? "Dark" : "Light"} Mode Enabled`,
                  visibilityTime: 1500,
                });
              }}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            About
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: themeColors.bg_secondary,
                borderColor: themeColors.border,
              },
            ]}>
            <SettingRow icon="ℹ️" label="App Version" value="0.10" />
            <SettingRow
              icon="📄"
              label="Terms of Service"
              showArrow
              onPress={() => handleOpenLink("Terms of Service")}
            />
            <SettingRow
              icon="🔒"
              label="Privacy Policy"
              showArrow
              onPress={() => handleOpenLink("Privacy Policy")}
            />
            <SettingRow
              icon="❓"
              label="Help & Support"
              showArrow
              onPress={() => handleOpenLink("Help & Support")}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Account
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: themeColors.bg_secondary,
                borderColor: themeColors.border,
              },
            ]}>
            <SettingRow
              icon="🔑"
              label="Change Password"
              showArrow
              onPress={handleChangePassword}
            />
            <SettingRow
              icon="🚪"
              label="Logout"
              showArrow
              onPress={handleLogout}
            />
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "InstrumentSans-Bold",
    marginBottom: 12,
    marginHorizontal: 20,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
});
