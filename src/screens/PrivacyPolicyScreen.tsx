import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useThemeStore } from "../store/themeStore";
import { getThemeColors } from "../constants/GlobalStyles";

interface PrivacyPolicyScreenProps {
  onNavigate?: (screen: string) => void;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onNavigate }) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const isDark = theme === "dark";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg_primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate?.("Settings")}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={themeColors.text_primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text_primary }]}>
          Privacy Policy
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, { color: themeColors.text_secondary }]}>
          Last Updated: February 10, 2026
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Introduction
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            Welcome to LaunchPad ("we," "our," or "us"). We are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your personal information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Information We Collect
          </Text>
          <Text style={[styles.subsectionTitle, { color: themeColors.text_primary }]}>
            Personal Information You Provide:
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            • Account Information: First name, last name, email address, and encrypted password{'\n'}
            • Profile Preferences: Timezone and notification time preferences{'\n'}
            • Goal Data: Dreams, milestones, progress tracking, and completion status{'\n'}
            • Community Posts: Victory posts and journey recaps you choose to share
          </Text>

          <Text style={[styles.subsectionTitle, { color: themeColors.text_primary }]}>
            Information Automatically Collected:
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            • Device Information: Device type, OS version, unique identifiers{'\n'}
            • Usage Data: Features used, session duration, in-app navigation{'\n'}
            • Performance Data: Crash reports to improve app stability{'\n'}
            • Notification Tokens: For sending reminders and updates
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            How We Use Your Information
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>Core App Functionality:</Text>{'\n'}
            • Create and manage your account and sync data across devices{'\n'}
            • Track your progress, streaks, and XP points{'\n'}
            • Send personalized notifications and reminders{'\n\n'}

            <Text style={styles.bold}>AI Features:</Text>{'\n'}
            • Provide AI-powered dream coaching through Luna{'\n'}
            • Generate personalized milestones based on your goals{'\n'}
            • Analyze your progress to provide insights and recommendations{'\n\n'}

            <Text style={styles.bold}>Community Features:</Text>{'\n'}
            • Enable sharing of victories and journey recaps{'\n'}
            • Display community statistics{'\n\n'}

            <Text style={styles.bold}>Service Improvement:</Text>{'\n'}
            • Analyze usage patterns to improve features{'\n'}
            • Identify and fix technical issues
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Data Sharing and Third-Party Services
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>Firebase (Google Cloud):</Text> Authentication, database storage{'\n'}
            <Text style={styles.bold}>AWS Bedrock (Claude AI):</Text> AI dream coaching and milestone generation through Luna assistant{'\n'}
            <Text style={styles.bold}>RevenueCat:</Text> Subscription management{'\n'}
            <Text style={styles.bold}>Expo Push Notifications:</Text> Milestone reminders{'\n\n'}

            <Text style={styles.bold}>We Do NOT:</Text>{'\n'}
            • Sell your personal data to third parties{'\n'}
            • Share your data with advertisers{'\n'}
            • Use your data to train AI models for other purposes{'\n'}
            • Share your conversations or dreams with third parties beyond the AI service provider
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Data Security
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            • All passwords are encrypted using industry-standard hashing{'\n'}
            • Data transmission is encrypted using HTTPS/TLS{'\n'}
            • Access to user data is restricted to authorized personnel only{'\n'}
            • We conduct regular security audits and updates
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Your Privacy Rights
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>You can:</Text>{'\n'}
            • Access and export all your personal data{'\n'}
            • Update your profile information in app settings{'\n'}
            • Delete specific dreams or milestones{'\n'}
            • Delete your entire account and all data{'\n'}
            • Opt-out of push notifications{'\n'}
            • Control community visibility settings{'\n\n'}

            To exercise your rights, use the in-app settings or contact us at privacy@launchpad.app
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Children's Privacy
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            LaunchPad is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe your child has provided us with personal information, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Data Retention
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            • Account Data: Retained while your account is active{'\n'}
            • Deleted Accounts: Permanently deleted within 30 days{'\n'}
            • Backup Data: Removed from backups within 90 days
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Changes to This Policy
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            We may update this Privacy Policy from time to time. We will notify you of significant changes through in-app notification or email. Continued use of the app after changes indicates acceptance of the updated policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            If you have questions or concerns about this Privacy Policy:{'\n\n'}
            Email: privacy@launchpad.app{'\n'}
            Support: support@launchpad.app
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.consent, { color: themeColors.text_tertiary }]}>
            By using LaunchPad, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and sharing of your information as described herein.
          </Text>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lastUpdated: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "InstrumentSans-Bold",
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "InstrumentSans-SemiBold",
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "InstrumentSans-Regular",
  },
  bold: {
    fontWeight: "700",
    fontFamily: "InstrumentSans-Bold",
  },
  consent: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
    marginTop: 12,
  },
});
