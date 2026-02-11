import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { ChevronLeft, X } from "lucide-react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { SettingRow } from "../components/settings/SettingRow";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { getThemeColors } from "../constants/GlobalStyles";
import {
  fetchUserPersonalData,
  requestDataExport,
  exportDreamsData,
  deleteUserAccount,
  PersonalDataResponse,
} from "../config/api";
import { cancelAllScheduledNotifications } from "../services/notificationService";
import Toast from "react-native-toast-message";

interface DataScreenProps {
  onNavigate?: (screen: string) => void;
}

export const DataScreen: React.FC<DataScreenProps> = ({ onNavigate }) => {
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const isDark = theme === "dark";

  const [loading, setLoading] = useState<string | null>(null);
  const [personalDataModalVisible, setPersonalDataModalVisible] =
    useState(false);
  const [personalData, setPersonalData] =
    useState<PersonalDataResponse | null>(null);

  // ---- View Personal Data ----
  const handleViewPersonalData = useCallback(async () => {
    if (!user?.uid) return;
    setLoading("viewData");
    try {
      const data = await fetchUserPersonalData(user.uid);
      setPersonalData(data);
      setPersonalDataModalVisible(true);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Load Data",
        text2: error.message || "Please try again",
        visibilityTime: 2500,
      });
    } finally {
      setLoading(null);
    }
  }, [user?.uid]);

  // ---- Request Data Copy ----
  const handleRequestDataCopy = useCallback(async () => {
    if (!user?.uid) return;
    setLoading("exportCopy");
    try {
      const result = await requestDataExport(user.uid, "json");
      const fileUri = `${FileSystem.cacheDirectory}launchpad-data-export.json`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(result.data, null, 2),
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Your LaunchPad Data Export",
        });
      } else {
        Toast.show({
          type: "info",
          text1: "Sharing Not Available",
          text2: "Sharing is not available on this device",
          visibilityTime: 2500,
        });
      }

      Toast.show({
        type: "success",
        text1: "Data Export Ready",
        text2: "Your data has been prepared for download",
        visibilityTime: 2000,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Export Failed",
        text2: error.message || "Please try again",
        visibilityTime: 2500,
      });
    } finally {
      setLoading(null);
    }
  }, [user?.uid]);

  // ---- Export Dreams Data ----
  const handleExportDreams = useCallback(async () => {
    if (!user?.uid) return;
    setLoading("exportDreams");
    try {
      const result = await exportDreamsData(user.uid);
      const fileUri = `${FileSystem.cacheDirectory}launchpad-dreams-export.json`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(result, null, 2),
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Your Dreams & Progress Data",
        });
      }

      Toast.show({
        type: "success",
        text1: "Dreams Exported",
        text2: `${result.dreams.length} dreams exported successfully`,
        visibilityTime: 2000,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Export Failed",
        text2: error.message || "Please try again",
        visibilityTime: 2500,
      });
    } finally {
      setLoading(null);
    }
  }, [user?.uid]);

  // ---- Delete Account ----
  const executeAccountDeletion = useCallback(async () => {
    if (!user?.uid) return;
    setLoading("deleteAccount");
    try {
      await deleteUserAccount(user.uid);
      await cancelAllScheduledNotifications();
      try {
        await logout();
      } catch {
        // Logout may fail if Firebase user was already deleted server-side
      }
      Toast.show({
        type: "success",
        text1: "Account Deleted",
        text2: "Your account and data have been permanently deleted",
        visibilityTime: 3000,
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Deletion Failed",
        text2: error.message || "Please try again or contact support",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(null);
    }
  }, [user?.uid, logout]);

  const handleDeleteAccount = useCallback(() => {
    if (!user?.uid) return;

    Alert.alert(
      "Delete Account",
      "This will permanently delete your account, all dreams, milestones, progress, and community posts. This action CANNOT be undone.\n\nAre you sure you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete Everything",
          style: "destructive",
          onPress: () => {
            if (Platform.OS === "ios") {
              Alert.prompt(
                "Confirm Deletion",
                'To confirm, type "DELETE" below:',
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete Forever",
                    style: "destructive",
                    onPress: (typedText) => {
                      if (typedText?.trim().toUpperCase() !== "DELETE") {
                        Toast.show({
                          type: "error",
                          text1: "Confirmation Failed",
                          text2: 'You must type "DELETE" to confirm',
                          visibilityTime: 2500,
                        });
                        return;
                      }
                      executeAccountDeletion();
                    },
                  },
                ],
                "plain-text",
                "",
                "default",
              );
            } else {
              // Android fallback (Alert.prompt is iOS-only)
              Alert.alert(
                "Final Confirmation",
                "This is your last chance. All data will be permanently deleted.\n\nDo you want to proceed?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "DELETE MY ACCOUNT",
                    style: "destructive",
                    onPress: () => executeAccountDeletion(),
                  },
                ],
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [user?.uid, executeAccountDeletion]);

  // ---- Notification Opt-out ----
  const handleNotificationOptOut = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  // ---- Personal Data Modal ----
  const renderPersonalDataModal = () => (
    <Modal
      visible={personalDataModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setPersonalDataModalVisible(false)}>
      <SafeAreaView
        style={[
          styles.modalContainer,
          { backgroundColor: themeColors.bg_primary },
        ]}>
        <View style={styles.modalHeader}>
          <Text
            style={[styles.modalTitle, { color: themeColors.text_primary }]}>
            Your Personal Data
          </Text>
          <TouchableOpacity
            onPress={() => setPersonalDataModalVisible(false)}
            style={styles.modalCloseButton}>
            <X size={24} color={themeColors.text_primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}>
          {personalData && (
            <>
              {/* Account Info */}
              <View style={styles.dataSection}>
                <Text
                  style={[
                    styles.dataSectionTitle,
                    { color: themeColors.text_primary },
                  ]}>
                  Account Information
                </Text>
                <DataRow
                  label="Name"
                  value={`${personalData.firstname} ${personalData.lastname}`}
                  themeColors={themeColors}
                  isDark={isDark}
                />
                <DataRow
                  label="Email"
                  value={personalData.email}
                  themeColors={themeColors}
                  isDark={isDark}
                />
                <DataRow
                  label="User ID"
                  value={personalData.user_id}
                  themeColors={themeColors}
                  isDark={isDark}
                />
                <DataRow
                  label="Account Created"
                  value={
                    personalData.created_at
                      ? new Date(personalData.created_at).toLocaleDateString()
                      : "N/A"
                  }
                  themeColors={themeColors}
                  isDark={isDark}
                />
              </View>

              {/* Preferences */}
              <View style={styles.dataSection}>
                <Text
                  style={[
                    styles.dataSectionTitle,
                    { color: themeColors.text_primary },
                  ]}>
                  Preferences
                </Text>
                <DataRow
                  label="Timezone"
                  value={personalData.pref_timezone || "Not set"}
                  themeColors={themeColors}
                  isDark={isDark}
                />
                <DataRow
                  label="Notification Time"
                  value={personalData.pref_notification_time || "Disabled"}
                  themeColors={themeColors}
                  isDark={isDark}
                />
                <DataRow
                  label="Push Notifications"
                  value={
                    personalData.push_token_registered
                      ? "Registered"
                      : "Not registered"
                  }
                  themeColors={themeColors}
                  isDark={isDark}
                />
              </View>

              {/* Activity Summary */}
              <View style={styles.dataSection}>
                <Text
                  style={[
                    styles.dataSectionTitle,
                    { color: themeColors.text_primary },
                  ]}>
                  Activity Summary
                </Text>
                <DataRow
                  label="Total Dreams"
                  value={String(personalData.dreams_count)}
                  themeColors={themeColors}
                  isDark={isDark}
                />
                <DataRow
                  label="Completed Milestones"
                  value={String(personalData.completed_milestones_count)}
                  themeColors={themeColors}
                  isDark={isDark}
                />
                <DataRow
                  label="Total Milestones"
                  value={String(personalData.total_milestones_count)}
                  themeColors={themeColors}
                  isDark={isDark}
                />
                <DataRow
                  label="Community Posts"
                  value={String(personalData.community_posts_count)}
                  themeColors={themeColors}
                  isDark={isDark}
                />
                {personalData.streak && (
                  <>
                    <DataRow
                      label="Current Streak"
                      value={`${personalData.streak.current_streak} days`}
                      themeColors={themeColors}
                      isDark={isDark}
                    />
                    <DataRow
                      label="Longest Streak"
                      value={`${personalData.streak.longest_streak} days`}
                      themeColors={themeColors}
                      isDark={isDark}
                    />
                  </>
                )}
                <DataRow
                  label="Last Activity"
                  value={
                    personalData.last_activity
                      ? new Date(personalData.last_activity).toLocaleString()
                      : "N/A"
                  }
                  themeColors={themeColors}
                  isDark={isDark}
                />
              </View>
            </>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

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
        <Text
          style={[styles.headerTitle, { color: themeColors.text_primary }]}>
          Your Data
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View
          style={[
            styles.infoBanner,
            {
              backgroundColor: isDark
                ? "rgba(168, 85, 247, 0.15)"
                : "rgba(168, 85, 247, 0.1)",
              borderColor: "rgba(168, 85, 247, 0.3)",
            },
          ]}>
          <Text
            style={[
              styles.infoBannerText,
              { color: themeColors.text_primary },
            ]}>
            You have the right to access, export, and delete your personal data
            at any time.
          </Text>
        </View>

        {/* Access Your Data Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: themeColors.text_primary },
            ]}>
            Access Your Data
          </Text>
          <View
            style={[
              styles.card,
              {
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}>
            <BlurView
              intensity={60}
              tint={isDark ? "dark" : "light"}
              style={{
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              }}>
              <SettingRow
                icon="👤"
                label="View Personal Data"
                value={
                  loading === "viewData"
                    ? "Loading..."
                    : "See all data we have"
                }
                showArrow
                onPress={handleViewPersonalData}
              />
              <SettingRow
                icon="📦"
                label="Request Data Copy"
                value={
                  loading === "exportCopy"
                    ? "Preparing..."
                    : "Download in portable format"
                }
                showArrow
                onPress={handleRequestDataCopy}
              />
              <SettingRow
                icon="🌟"
                label="Export Dreams & Progress"
                value={
                  loading === "exportDreams"
                    ? "Exporting..."
                    : "Dreams, milestones, streaks"
                }
                showArrow
                onPress={handleExportDreams}
              />
            </BlurView>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: themeColors.text_primary },
            ]}>
            Notifications
          </Text>
          <View
            style={[
              styles.card,
              {
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(0, 0, 0, 0.1)",
              },
            ]}>
            <BlurView
              intensity={60}
              tint={isDark ? "dark" : "light"}
              style={{
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              }}>
              <SettingRow
                icon="🔕"
                label="Manage Push Notifications"
                value="Open device settings"
                showArrow
                onPress={handleNotificationOptOut}
              />
            </BlurView>
          </View>
        </View>

        {/* Danger Zone Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: "#FF4444" }]}>
            Danger Zone
          </Text>
          <View
            style={[
              styles.card,
              {
                borderColor: "rgba(255, 68, 68, 0.3)",
              },
            ]}>
            <BlurView
              intensity={60}
              tint={isDark ? "dark" : "light"}
              style={{
                backgroundColor: isDark
                  ? "rgba(255, 68, 68, 0.08)"
                  : "rgba(255, 68, 68, 0.05)",
              }}>
              <SettingRow
                icon="🗑️"
                label="Delete Account"
                value={
                  loading === "deleteAccount"
                    ? "Processing..."
                    : "Permanently delete everything"
                }
                showArrow
                onPress={handleDeleteAccount}
              />
            </BlurView>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {renderPersonalDataModal()}
    </SafeAreaView>
  );
};

// Helper component for data display rows in the personal data modal
const DataRow = ({
  label,
  value,
  themeColors,
  isDark,
}: {
  label: string;
  value: string;
  themeColors: any;
  isDark: boolean;
}) => (
  <View
    style={[
      dataRowStyles.row,
      {
        backgroundColor: isDark ? "#2B2D56" : "#f8f9fa",
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      },
    ]}>
    <Text
      style={[dataRowStyles.label, { color: themeColors.text_secondary }]}>
      {label}
    </Text>
    <Text
      style={[dataRowStyles.value, { color: themeColors.text_primary }]}
      numberOfLines={2}>
      {value}
    </Text>
  </View>
);

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
  infoBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoBannerText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "InstrumentSans-Regular",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "InstrumentSans-Bold",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dataSection: {
    marginBottom: 24,
  },
  dataSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "InstrumentSans-Bold",
    marginBottom: 12,
  },
});

const dataRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "InstrumentSans-Medium",
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontFamily: "InstrumentSans-Regular",
    flex: 1,
    textAlign: "right",
  },
});
