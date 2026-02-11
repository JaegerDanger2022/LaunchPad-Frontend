import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Mail,
  MessageCircle,
  ExternalLink,
} from "lucide-react-native";
import { useThemeStore } from "../store/themeStore";
import { getThemeColors } from "../constants/GlobalStyles";
import Toast from "react-native-toast-message";

interface HelpSupportScreenProps {
  onNavigate?: (screen: string) => void;
}

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
  onNavigate,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const isDark = theme === "dark";

  const handleEmailSupport = () => {
    const email = "support@launchpadapp.click";
    const subject = "LaunchPad Support Request";
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.openURL(mailtoUrl).catch(() => {
      Toast.show({
        type: "error",
        text1: "Unable to Open Email",
        text2: "Please email us at support@launchpadapp.click",
        visibilityTime: 3000,
      });
    });
  };

  const handleOpenLink = (url: string, label: string) => {
    Linking.openURL(url).catch(() => {
      Toast.show({
        type: "error",
        text1: "Unable to Open Link",
        text2: `Could not open ${label}`,
        visibilityTime: 2000,
      });
    });
  };

  const FAQItem = ({
    question,
    answer,
  }: {
    question: string;
    answer: string;
  }) => (
    <View
      style={[
        styles.faqCard,
        {
          backgroundColor: isDark ? "#2B2D56" : "#f8f9fa",
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        },
      ]}>
      <Text style={[styles.faqQuestion, { color: themeColors.text_primary }]}>
        {question}
      </Text>
      <Text style={[styles.faqAnswer, { color: themeColors.text_secondary }]}>
        {answer}
      </Text>
    </View>
  );

  const SupportButton = ({ icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity
      style={[
        styles.supportButton,
        {
          backgroundColor: isDark ? "#2B2D56" : "#f8f9fa",
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        },
      ]}
      onPress={onPress}>
      <View style={styles.supportButtonContent}>
        {icon}
        <View style={styles.supportButtonText}>
          <Text
            style={[
              styles.supportButtonTitle,
              { color: themeColors.text_primary },
            ]}>
            {title}
          </Text>
          <Text
            style={[
              styles.supportButtonSubtitle,
              { color: themeColors.text_secondary },
            ]}>
            {subtitle}
          </Text>
        </View>
      </View>
      <ExternalLink size={20} color={themeColors.text_tertiary} />
    </TouchableOpacity>
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
        <Text style={[styles.headerTitle, { color: themeColors.text_primary }]}>
          Help & Support
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Contact Support Section */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Get in Touch
          </Text>

          <SupportButton
            icon={<Mail size={24} color="#A855F7" />}
            title="Email Support"
            subtitle="support@launchpadapp.click"
            onPress={handleEmailSupport}
          />
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Frequently Asked Questions
          </Text>

          <FAQItem
            question="How do I create a dream?"
            answer="Tap the '+' button on your Home or Dreams tab. You can either chat with Luna (our AI assistant) to generate a personalized dream, or use 'DIY' mode to create a custom dream with your own milestones."
          />

          <FAQItem
            question="What's the difference between Free and Pro?"
            answer="Free users can have up to 2 total dreams (active or completed combined). Pro users can have 3 active dreams at once with unlimited completed dreams, plus advanced analytics and priority support."
          />

          <FAQItem
            question="How do streaks work?"
            answer="Complete at least one milestone each day to maintain your streak. Your streak resets if you miss a day. Streaks are tracked in your local timezone. Custom (DIY) dreams don't count toward streaks by default."
          />

          <FAQItem
            question="What are the different challenge types?"
            answer="LaunchPad has 7 challenge types: Power Move (bold action), Knowledge Quest (learning), Prep Ritual (preparation), Courage Check (facing fears), Skill Flex (practice), Decision Point (choices), and Celebration Moment (milestones)."
          />

          <FAQItem
            question="Can I edit or delete a milestone?"
            answer="Dreams created with Luna have AI-generated milestones that can't be edited individually. You can archive completed dreams or create custom DIY dreams with full control. To delete a dream, go to the Dream page and use the options menu."
          />

          <FAQItem
            question="How does the Evidence Board work?"
            answer="As you complete milestones, they appear on your Evidence Board as 'proof points.' You can view all your progress, see completed dreams, and share victories with the community from here."
          />

          <FAQItem
            question="What is XP and how do I earn it?"
            answer="XP (experience points) are earned by completing milestones. Each milestone typically awards 10 XP. Your total XP is displayed in your analytics and represents your overall progress across all dreams."
          />

          <FAQItem
            question="Can I share my progress?"
            answer="Yes! You can share 'Victories' (completed milestones) and 'Journey Recaps' (completed dreams) to the Community tab. Other users can see and celebrate your achievements."
          />

          <FAQItem
            question="How do I change my notification time?"
            answer="Go to Settings → Daily Reminders. You can choose a specific time for daily reminders or turn them off completely. Notifications respect your selected timezone."
          />

          <FAQItem
            question="What happens to my data if I delete my account?"
            answer="Account deletion is permanent and cannot be undone. All your dreams, milestones, progress, and community posts will be permanently deleted within 30 days. Export any data you want to keep before deletion."
          />

          <FAQItem
            question="How do I cancel my Pro subscription?"
            answer="Subscriptions are managed through your Apple App Store or Google Play Store account. Go to Settings → Manage Subscription, or cancel directly through your platform's subscription settings."
          />

          <FAQItem
            question="Who is Luna?"
            answer="Luna is our AI coaching assistant powered by AWS Bedrock (Claude AI). She helps you brainstorm dreams, generate personalized milestones, and provides motivational guidance. Luna is not a substitute for professional advice."
          />

          <FAQItem
            question="Is my data private and secure?"
            answer="Yes. All data is encrypted in transit and at rest. We use Firebase for authentication and storage. Your conversations with Luna are processed by AWS Bedrock but are not used to train AI models for other purposes. See our Privacy Policy for full details."
          />

          <FAQItem
            question="Why did my dream get archived?"
            answer="Dreams may be automatically archived if marked as completed or if you manually archive them. Free users who exceed the 2-dream limit may see older dreams archived when creating new ones."
          />

          <FAQItem
            question="Can I use LaunchPad offline?"
            answer="Some features like viewing your existing dreams and milestones work offline. However, creating new dreams, syncing data, and using Luna require an internet connection."
          />

          <FAQItem
            question="What devices are supported?"
            answer="LaunchPad is available on iOS (iPhone and iPad) and Android devices. We recommend keeping your OS updated to the latest version for the best experience."
          />
        </View>

        {/* Troubleshooting Section */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Troubleshooting
          </Text>

          <View
            style={[
              styles.troubleshootCard,
              {
                backgroundColor: isDark ? "#2B2D56" : "#f8f9fa",
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              },
            ]}>
            <Text
              style={[
                styles.troubleshootTitle,
                { color: themeColors.text_primary },
              ]}>
              App Not Loading or Crashing
            </Text>
            <Text
              style={[
                styles.troubleshootText,
                { color: themeColors.text_secondary },
              ]}>
              • Force quit the app and restart it{"\n"}• Check for app updates
              in your app store{"\n"}• Ensure you have a stable internet
              connection{"\n"}• Restart your device{"\n"}• Reinstall the app
              (your data is cloud-synced)
            </Text>
          </View>

          <View
            style={[
              styles.troubleshootCard,
              {
                backgroundColor: isDark ? "#2B2D56" : "#f8f9fa",
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              },
            ]}>
            <Text
              style={[
                styles.troubleshootTitle,
                { color: themeColors.text_primary },
              ]}>
              Not Receiving Notifications
            </Text>
            <Text
              style={[
                styles.troubleshootText,
                { color: themeColors.text_secondary },
              ]}>
              • Check Settings → Daily Reminders is enabled{"\n"}• Verify
              notification permissions in device settings{"\n"}• Ensure Do Not
              Disturb mode is off{"\n"}• Check your notification time is set
              correctly for your timezone
            </Text>
          </View>

          <View
            style={[
              styles.troubleshootCard,
              {
                backgroundColor: isDark ? "#2B2D56" : "#f8f9fa",
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              },
            ]}>
            <Text
              style={[
                styles.troubleshootTitle,
                { color: themeColors.text_primary },
              ]}>
              Luna Not Responding
            </Text>
            <Text
              style={[
                styles.troubleshootText,
                { color: themeColors.text_secondary },
              ]}>
              • Wait a few seconds — Luna may be processing{"\n"}• Check your
              internet connection{"\n"}• Try closing and reopening the dream
              creation modal{"\n"}• If the issue persists, contact support
            </Text>
          </View>

          <View
            style={[
              styles.troubleshootCard,
              {
                backgroundColor: isDark ? "#2B2D56" : "#f8f9fa",
                borderColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
              },
            ]}>
            <Text
              style={[
                styles.troubleshootTitle,
                { color: themeColors.text_primary },
              ]}>
              Subscription Issues
            </Text>
            <Text
              style={[
                styles.troubleshootText,
                { color: themeColors.text_secondary },
              ]}>
              • Allow up to 5 minutes for subscription changes to sync{"\n"}•
              Log out and log back in to refresh your subscription status{"\n"}•
              Check your App Store/Play Store purchase history{"\n"}• Contact
              support with your receipt/order number
            </Text>
          </View>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            Additional Resources
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            • <Text style={styles.bold}>Privacy Policy:</Text> Learn how we
            protect your data{"\n"}•{" "}
            <Text style={styles.bold}>Terms of Service:</Text> Understand your
            rights and responsibilities{"\n"}•{" "}
            <Text style={styles.bold}>App Version:</Text> 0.10 (check Settings
            for updates){"\n\n"}
            For feature requests, bug reports, or general inquiries, email us at
            support@launchpadapp.click — we typically respond within 24-48
            hours.
          </Text>
        </View>

        {/* Contact Card */}
        <View
          style={[
            styles.contactCard,
            {
              backgroundColor: isDark
                ? "rgba(168, 85, 247, 0.15)"
                : "rgba(168, 85, 247, 0.1)",
              borderColor: "rgba(168, 85, 247, 0.3)",
            },
          ]}>
          <MessageCircle
            size={32}
            color="#A855F7"
            style={{ marginBottom: 12 }}
          />
          <Text
            style={[styles.contactTitle, { color: themeColors.text_primary }]}>
            Still Need Help?
          </Text>
          <Text
            style={[styles.contactText, { color: themeColors.text_secondary }]}>
            Our support team is here to help you achieve your dreams. Reach out
            anytime!
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleEmailSupport}>
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "InstrumentSans-Bold",
    marginBottom: 16,
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
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  supportButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  supportButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  supportButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "InstrumentSans-SemiBold",
    marginBottom: 2,
  },
  supportButtonSubtitle: {
    fontSize: 13,
    fontFamily: "InstrumentSans-Regular",
  },
  faqCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "InstrumentSans-SemiBold",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "InstrumentSans-Regular",
  },
  troubleshootCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  troubleshootTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "InstrumentSans-SemiBold",
    marginBottom: 8,
  },
  troubleshootText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "InstrumentSans-Regular",
  },
  contactCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 8,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "InstrumentSans-Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  contactText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "InstrumentSans-Regular",
    textAlign: "center",
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: "#A855F7",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "InstrumentSans-SemiBold",
  },
});
