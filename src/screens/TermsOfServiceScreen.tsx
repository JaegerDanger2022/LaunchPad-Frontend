import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useThemeStore } from "../store/themeStore";
import { getThemeColors } from "../constants/GlobalStyles";

interface TermsOfServiceScreenProps {
  onNavigate?: (screen: string) => void;
}

export const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({
  onNavigate,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

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
          Terms of Service
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text
          style={[styles.lastUpdated, { color: themeColors.text_secondary }]}>
          Last Updated: February 10, 2026
        </Text>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            1. Acceptance of Terms
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            Welcome to LaunchPad, a goal-tracking and dream-achievement platform
            powered by AI coaching. By creating an account or using our mobile
            application, you agree to be bound by these Terms of Service
            ("Terms"). If you do not agree to these Terms, please do not use the
            Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            2. Description of Service
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            LaunchPad provides a mobile application that enables users to:
            {"\n\n"}• <Text style={styles.bold}>Dream Creation:</Text> Set
            personal goals ("Dreams") either through AI-assisted chat with our
            Luna assistant or custom manual creation{"\n"}•{" "}
            <Text style={styles.bold}>Milestone Tracking:</Text> Break down
            dreams into actionable milestones with progress tracking{"\n"}•{" "}
            <Text style={styles.bold}>AI Coaching:</Text> Receive personalized
            guidance and milestone generation through AI-powered conversations
            {"\n"}• <Text style={styles.bold}>Evidence Board:</Text> Track
            completed milestones and collect proof of progress{"\n"}•{" "}
            <Text style={styles.bold}>Community Features:</Text> Share victories
            and journey recaps with other users{"\n"}•{" "}
            <Text style={styles.bold}>Streak & XP System:</Text> Maintain daily
            streaks and earn experience points for consistency{"\n"}•{" "}
            <Text style={styles.bold}>Analytics:</Text> View insights about your
            progress, completion rates, and challenge types
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            3. User Accounts & Eligibility
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>Age Requirement:</Text> You must be at
            least 13 years old to use LaunchPad. Users under 18 should have
            parental consent.{"\n\n"}
            <Text style={styles.bold}>Account Security:</Text> You are
            responsible for:{"\n"}• Maintaining the confidentiality of your
            password{"\n"}• All activities that occur under your account{"\n"}•
            Notifying us immediately of any unauthorized use{"\n\n"}
            <Text style={styles.bold}>Account Accuracy:</Text> You agree to
            provide accurate, current, and complete information during
            registration and to update it as needed.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            4. Subscription Plans & Billing
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>Free Tier:</Text>
            {"\n"}• Limited to 2 total dreams (active or completed combined)
            {"\n"}• Access to AI dream creation and basic features{"\n"}•
            Community access{"\n\n"}
            <Text style={styles.bold}>Pro Subscription:</Text>
            {"\n"}• Up to 3 active dreams at once{"\n"}• Unlimited completed
            dreams{"\n"}• Priority support{"\n"}• Advanced analytics{"\n\n"}
            <Text style={styles.bold}>Billing:</Text>
            {"\n"}• Subscriptions are managed through Apple App Store or Google
            Play Store{"\n"}• Billing occurs through your platform account, not
            directly through us{"\n"}• Subscriptions auto-renew unless canceled
            at least 24 hours before the end of the current period{"\n"}•
            Refunds are subject to Apple/Google's refund policies{"\n\n"}
            <Text style={styles.bold}>Changes to Pricing:</Text> We reserve the
            right to modify subscription prices with 30 days' notice to existing
            subscribers. Price changes will not affect your current billing
            period.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            5. Acceptable Use Policy
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>You agree NOT to:</Text>
            {"\n"}• Use the Service for any illegal purpose or in violation of
            any laws{"\n"}• Post offensive, harmful, threatening, or harassing
            content{"\n"}• Impersonate others or misrepresent your affiliation
            {"\n"}• Share sexually explicit, violent, or discriminatory content
            {"\n"}• Attempt to hack, disrupt, or gain unauthorized access to the
            Service{"\n"}• Scrape, data mine, or use automated tools to collect
            user data{"\n"}• Share your account credentials with others{"\n"}•
            Reverse engineer or attempt to extract source code{"\n\n"}
            <Text style={styles.bold}>Consequences:</Text> Violations may result
            in immediate account suspension or termination without refund.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            6. User-Generated Content
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>Your Content:</Text> You retain ownership
            of dreams, milestones, victory posts, and journey recaps you create
            ("User Content").{"\n\n"}
            <Text style={styles.bold}>License to Us:</Text> By posting content,
            you grant us a non-exclusive, worldwide, royalty-free license to:
            {"\n"}• Store, display, and distribute your content within the
            Service{"\n"}• Use aggregated/anonymized data for service
            improvement{"\n"}• Display community posts to other users as
            intended{"\n\n"}
            <Text style={styles.bold}>Content Moderation:</Text> We reserve the
            right to remove content that violates these Terms, without prior
            notice.{"\n\n"}
            <Text style={styles.bold}>Responsibility:</Text> You are solely
            responsible for your User Content. We do not endorse or verify
            user-submitted content.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            7. AI Features & Luna Assistant
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>AI Coaching:</Text> Luna is an AI
            assistant powered by AWS Bedrock (Claude AI) that helps you create
            dreams and generate milestones.{"\n\n"}
            <Text style={styles.bold}>No Professional Advice:</Text> Luna
            provides motivational guidance only and is NOT:{"\n"}• A substitute
            for professional medical, legal, or financial advice{"\n"}• A
            therapist or mental health professional{"\n"}• Capable of handling
            crisis situations{"\n\n"}
            <Text style={styles.bold}>Accuracy:</Text> While we strive for
            helpful responses, AI-generated content may be inaccurate or
            inappropriate. Use your own judgment.{"\n\n"}
            <Text style={styles.bold}>Conversations:</Text> Your conversations
            with Luna are processed by AWS Bedrock for the purpose of generating
            responses. These are not used to train AI models for other purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            8. Community Guidelines
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>Victory Wall & Journey Recaps:</Text> When
            sharing on the community wall:{"\n"}• Be respectful, encouraging,
            and authentic{"\n"}• Celebrate genuine progress and milestones{"\n"}
            • Avoid spam, self-promotion, or misleading content{"\n"}• Respect
            others' privacy — don't share personal information about others
            {"\n\n"}
            <Text style={styles.bold}>Reporting:</Text> If you see content that
            violates our guidelines, please report it to
            support@launchpadapp.click
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            9. Intellectual Property
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>Our Content:</Text> All app design, code,
            logos, "Luna" branding, animations, and original content are owned
            by LaunchPad and protected by copyright, trademark, and other
            intellectual property laws.{"\n\n"}
            <Text style={styles.bold}>Restrictions:</Text> You may not:{"\n"}•
            Copy, modify, or distribute our proprietary materials{"\n"}• Use our
            name, logo, or branding without written permission{"\n"}• Create
            derivative works based on the Service
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            10. Third-Party Services
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            LaunchPad integrates with third-party services:{"\n"}•{" "}
            <Text style={styles.bold}>Firebase:</Text> Authentication & database
            {"\n"}• <Text style={styles.bold}>AWS Bedrock:</Text> AI coaching
            {"\n"}• <Text style={styles.bold}>RevenueCat:</Text> Subscription
            management{"\n"}•{" "}
            <Text style={styles.bold}>Expo Push Notifications:</Text> Reminders
            {"\n\n"}
            These services have their own terms and privacy policies. We are not
            responsible for third-party service disruptions or data practices.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            11. Disclaimers & Limitations of Liability
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>AS-IS Service:</Text> LaunchPad is
            provided "AS IS" and "AS AVAILABLE" without warranties of any kind,
            express or implied.{"\n\n"}
            <Text style={styles.bold}>No Guarantees:</Text> We do not guarantee:
            {"\n"}• Uninterrupted or error-free service{"\n"}• That the Service
            will meet your specific requirements{"\n"}• Achievement of your
            personal goals{"\n"}• Data accuracy or AI response quality{"\n\n"}
            <Text style={styles.bold}>Limitation of Liability:</Text> To the
            maximum extent permitted by law, LaunchPad shall not be liable for:
            {"\n"}• Indirect, incidental, consequential, or punitive damages
            {"\n"}• Lost profits, data, or opportunities{"\n"}• Service
            interruptions or data loss{"\n\n"}
            <Text style={styles.bold}>Maximum Liability:</Text> Our total
            liability shall not exceed the amount you paid us in the 12 months
            prior to the claim.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            12. Indemnification
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            You agree to indemnify and hold harmless LaunchPad, its officers,
            directors, employees, and agents from any claims, damages, losses,
            or expenses (including legal fees) arising from:{"\n"}• Your use of
            the Service{"\n"}• Your User Content{"\n"}• Your violation of these
            Terms{"\n"}• Your violation of any rights of another party
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            13. Termination
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>By You:</Text> You may delete your account
            at any time through app settings. Account deletion is permanent and
            cannot be undone.{"\n\n"}
            <Text style={styles.bold}>By Us:</Text> We may suspend or terminate
            your account immediately if:{"\n"}• You violate these Terms{"\n"}•
            We suspect fraudulent or illegal activity{"\n"}• We discontinue the
            Service (with 30 days' notice){"\n\n"}
            <Text style={styles.bold}>Effect of Termination:</Text>
            {"\n"}• Your access to the Service will cease{"\n"}• Your data will
            be deleted per our Privacy Policy{"\n"}• Subscription fees are
            non-refundable unless required by law
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            14. Changes to Terms
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            We may modify these Terms at any time. We will notify you of
            material changes via:{"\n"}• In-app notification{"\n"}• Email to
            your registered address{"\n"}• Prominent notice on our website
            {"\n\n"}
            Continued use of the Service after changes constitutes acceptance of
            the updated Terms. If you disagree with changes, you may terminate
            your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            15. Dispute Resolution
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>Informal Resolution:</Text> Before filing
            a claim, please contact us at support@launchpadapp.click to attempt
            informal resolution.{"\n\n"}
            <Text style={styles.bold}>Arbitration:</Text> Any disputes shall be
            resolved through binding arbitration in accordance with the rules of
            the American Arbitration Association, rather than in court.{"\n\n"}
            <Text style={styles.bold}>Class Action Waiver:</Text> You agree to
            resolve disputes individually and waive the right to participate in
            class actions or representative proceedings.{"\n\n"}
            <Text style={styles.bold}>Exceptions:</Text> Either party may seek
            injunctive relief in court for intellectual property infringement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            16. Governing Law
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            These Terms are governed by the laws of the State of Delaware,
            United States, without regard to conflict of law principles.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            17. Miscellaneous
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            <Text style={styles.bold}>Entire Agreement:</Text> These Terms
            constitute the entire agreement between you and LaunchPad.{"\n\n"}
            <Text style={styles.bold}>Severability:</Text> If any provision is
            found unenforceable, the remaining provisions remain in effect.
            {"\n\n"}
            <Text style={styles.bold}>Waiver:</Text> Failure to enforce any
            provision does not waive our right to enforce it later.{"\n\n"}
            <Text style={styles.bold}>Assignment:</Text> You may not assign
            these Terms. We may assign them without notice.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
            18. Contact Information
          </Text>
          <Text
            style={[styles.paragraph, { color: themeColors.text_secondary }]}>
            For questions about these Terms of Service:{"\n\n"}
            Email: legal@launchpadapp.click{"\n"}
            Support: support@launchpadapp.click{"\n\n"}
            Company: LaunchPad{"\n"}
            Address: Accra, Ghana
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.consent, { color: themeColors.text_tertiary }]}>
            By creating an account and using LaunchPad, you acknowledge that you
            have read, understood, and agree to be bound by these Terms of
            Service.
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
