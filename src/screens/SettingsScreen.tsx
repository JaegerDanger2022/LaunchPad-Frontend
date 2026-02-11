import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafeBlurView } from "../components/SafeBlurView";
import { ChevronLeft } from "lucide-react-native";
import { ProfileHeader } from "../components/settings/ProfileHeader";
import { SettingRow } from "../components/settings/SettingRow";
import { StatsRings } from "../components/settings/StatsRings";
import { TimezonePickerModal } from "../components/settings/TimezonePickerModal";
import { NotificationTimePickerModal } from "../components/settings/NotificationTimePickerModal";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { getThemeColors } from "../constants/GlobalStyles";
import { showManageSubscriptions } from "../config/revenuecat";
import {
  updateUserTimezone,
  updateUserNotificationPreferences,
} from "../config/api";
import Toast from "react-native-toast-message";

interface SettingsScreenProps {
  onNavigate?: (screen: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
}) => {
  const { user, userData, logout, isPremium, loadUserData } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Calculate user stats
  const dreamCount = userData?.dreams?.length || 0;
  const currentStreak = userData?.streak?.current_streak || 0;
  // const couragePoints = userData?.couragePoints || 0; // Muted - may be re-enabled later

  // Count completed milestones — use _metadata counts from summary, fall back to iterating if full data available
  const completedMilestones =
    userData?.dreams?.reduce((total: number, dream: any) => {
      if (dream._metadata?.completed_milestones_count != null) {
        return total + dream._metadata.completed_milestones_count;
      }
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

  const handleUpgradeToPremium = () => {
    onNavigate?.("Paywall");
  };

  const handleManageSubscription = async () => {
    const opened = await showManageSubscriptions();
    if (!opened) {
      Toast.show({
        type: "error",
        text1: "Unavailable",
        text2: "Subscription management is not available right now",
        visibilityTime: 2000,
      });
    }
  };

  const handleOpenLink = (linkType: string) => {
    if (linkType === "Privacy Policy") {
      onNavigate?.("PrivacyPolicy");
    } else if (linkType === "Terms of Service") {
      onNavigate?.("TermsOfService");
    } else if (linkType === "Help & Support") {
      onNavigate?.("HelpSupport");
    } else {
      Toast.show({
        type: "info",
        text1: "Coming Soon",
        text2: `${linkType} will be available soon`,
        visibilityTime: 2000,
      });
    }
  };

  const handleTimezoneChange = async (timezone: string) => {
    if (!user?.uid) return;

    try {
      await updateUserTimezone(user.uid, timezone);

      // Reload user data to get updated timezone
      await loadUserData(user.uid);

      Toast.show({
        type: "success",
        text1: "Timezone Updated",
        text2: `Your timezone has been set to ${getTimezoneLabel(timezone)}`,
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Could not update timezone. Please try again.",
        visibilityTime: 2000,
      });
    }
  };

  const handleNotificationChange = async (
    time: string | null,
    enabled: boolean,
  ) => {
    if (!user?.uid) return;

    try {
      await updateUserNotificationPreferences(user.uid, time);

      // Reload user data to get updated preferences
      await loadUserData(user.uid);

      Toast.show({
        type: "success",
        text1: enabled ? "Notifications Enabled" : "Notifications Disabled",
        text2:
          enabled && time
            ? `Daily reminder set for ${getNotificationTimeLabel(time)}`
            : "You won't receive daily reminders",
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Could not update notification preferences. Please try again.",
        visibilityTime: 2000,
      });
    }
  };

  const getNotificationTimeLabel = (time: string | null): string => {
    if (!time) return "Off";

    // Convert 24-hour time to 12-hour format
    const timeMap: Record<string, string> = {
      "06:00": "6:00 AM",
      "07:00": "7:00 AM",
      "08:00": "8:00 AM",
      "09:00": "9:00 AM",
      "10:00": "10:00 AM",
      "12:00": "12:00 PM",
      "13:00": "1:00 PM",
      "14:00": "2:00 PM",
      "15:00": "3:00 PM",
      "16:00": "4:00 PM",
      "17:00": "5:00 PM",
      "18:00": "6:00 PM",
      "19:00": "7:00 PM",
      "20:00": "8:00 PM",
      "21:00": "9:00 PM",
    };

    return timeMap[time] || time;
  };

  const getTimezoneLabel = (timezone: string | null): string => {
    if (!timezone) return "Not Set";

    // Extract readable label from timezone value
    const timezoneMap: Record<string, string> = {
      "America/New_York": "Eastern Time (ET)",
      "America/Chicago": "Central Time (CT)",
      "America/Denver": "Mountain Time (MT)",
      "America/Los_Angeles": "Pacific Time (PT)",
      "America/Anchorage": "Alaska Time (AKT)",
      "Pacific/Honolulu": "Hawaii Time (HT)",
      "Europe/London": "London (GMT/BST)",
      "Europe/Paris": "Paris (CET/CEST)",
      "Europe/Berlin": "Berlin (CET/CEST)",
      "Europe/Athens": "Athens (EET/EEST)",
      "Europe/Moscow": "Moscow (MSK)",
      "Asia/Dubai": "Dubai (GST)",
      "Asia/Kolkata": "Mumbai (IST)",
      "Asia/Bangkok": "Bangkok (ICT)",
      "Asia/Singapore": "Singapore (SGT)",
      "Asia/Hong_Kong": "Hong Kong (HKT)",
      "Asia/Tokyo": "Tokyo (JST)",
      "Asia/Seoul": "Seoul (KST)",
      "Australia/Sydney": "Sydney (AEDT/AEST)",
      "Australia/Melbourne": "Melbourne (AEDT/AEST)",
      "Australia/Brisbane": "Brisbane (AEST)",
      "Pacific/Auckland": "Auckland (NZDT/NZST)",
      "America/Sao_Paulo": "São Paulo (BRT)",
      "America/Argentina/Buenos_Aires": "Buenos Aires (ART)",
      "America/Santiago": "Santiago (CLT)",
      "Africa/Cairo": "Cairo (EET)",
      "Africa/Johannesburg": "Johannesburg (SAST)",
      "Africa/Lagos": "Lagos (WAT)",
    };

    return timezoneMap[timezone] || timezone;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.bg_primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate?.("Settings")}
          style={styles.backButton}>
          <ChevronLeft size={24} color={themeColors.text_primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text_primary }]}>
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}
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
        {/* <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Your Stats
          </Text>
          <View
            style={[
              styles.card,
              {
                borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
              },
            ]}>
            <SafeBlurView
              intensity={60}
              tint={theme === "dark" ? "dark" : "light"}
              style={{
                backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
              }}>
              <StatsRings
                currentStreak={currentStreak}
                dreamCount={dreamCount}
                completedMilestones={completedMilestones}
              />
            </SafeBlurView>
          </View>
        </View> */}

        {/* Premium Section */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Premium
          </Text>
          <View
            style={[
              styles.card,
              {
                borderColor:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.1)",
              },
            ]}>
            <SafeBlurView
              intensity={60}
              tint={theme === "dark" ? "dark" : "light"}
              style={{
                backgroundColor:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
              }}>
              {isPremium ? (
                <>
                  <SettingRow icon="⭐" label="Subscription" value="Pro" />
                  <SettingRow
                    icon="⚙️"
                    label="Manage Subscription"
                    showArrow
                    onPress={handleManageSubscription}
                  />
                </>
              ) : (
                <SettingRow
                  icon="⭐"
                  label="Upgrade to Pro"
                  showArrow
                  onPress={handleUpgradeToPremium}
                />
              )}
            </SafeBlurView>
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
                borderColor:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.1)",
              },
            ]}>
            <SafeBlurView
              intensity={60}
              tint={theme === "dark" ? "dark" : "light"}
              style={{
                backgroundColor:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
              }}>
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
              <SettingRow
                icon="🌍"
                label="Timezone"
                value={getTimezoneLabel(userData?.pref_timezone || null)}
                showArrow
                onPress={() => setShowTimezoneModal(true)}
              />
              <SettingRow
                icon="🔔"
                label="Daily Reminders"
                value={getNotificationTimeLabel(
                  userData?.pref_notification_time || null,
                )}
                showArrow
                onPress={() => setShowNotificationModal(true)}
              />
            </SafeBlurView>
          </View>
        </View>

        {/* Timezone Picker Modal */}
        <TimezonePickerModal
          visible={showTimezoneModal}
          currentTimezone={userData?.pref_timezone || null}
          onSelect={handleTimezoneChange}
          onClose={() => setShowTimezoneModal(false)}
          theme={theme}
        />

        {/* Notification Time Picker Modal */}
        <NotificationTimePickerModal
          visible={showNotificationModal}
          currentTime={userData?.pref_notification_time || null}
          currentEnabled={!!userData?.pref_notification_time}
          onSelect={handleNotificationChange}
          onClose={() => setShowNotificationModal(false)}
          theme={theme}
        />

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
                borderColor:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.1)",
              },
            ]}>
            <SafeBlurView
              intensity={60}
              tint={theme === "dark" ? "dark" : "light"}
              style={{
                backgroundColor:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
              }}>
              <SettingRow icon="ℹ️" label="App Version" value="0.11" />
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
            </SafeBlurView>
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
                borderColor:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.1)",
              },
            ]}>
            <SafeBlurView
              intensity={60}
              tint={theme === "dark" ? "dark" : "light"}
              style={{
                backgroundColor:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
              }}>
              <SettingRow
                icon="🔑"
                label="Change Password"
                showArrow
                onPress={handleChangePassword}
              />
              <SettingRow
                icon="📊"
                label="Your Data"
                value="View, export, or delete"
                showArrow
                onPress={() => onNavigate?.("DataScreen")}
              />
              <SettingRow
                icon="🚪"
                label="Logout"
                showArrow
                onPress={handleLogout}
              />
            </SafeBlurView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "InstrumentSans-Bold",
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
