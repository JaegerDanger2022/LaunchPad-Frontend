import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";
import { BottomNavbar } from "../components/BottomNavbar";
import {
  DreamCard,
  ProofPointItem,
  JourneyRecapModal,
  Dream,
  formatDate,
  getCategoryGradient,
} from "../components/evidenceboard";

const EvidenceBoardScreen = ({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const { width } = useWindowDimensions();

  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [showRecap, setShowRecap] = useState(false);

  // Sample dream data - in production this would come from your backend
  const dreams: Dream[] = [
    {
      id: 1,
      title: "Solo Trip to Bali",
      category: "travel",
      status: "in-progress",
      progress: 65,
      startDate: "2025-01-15",
      targetDate: "2025-04-01",
      couragePoints: 340,
      proofPoints: [
        {
          id: 1,
          date: "2025-01-15",
          mission: "Research Bali neighborhoods",
          completed: true,
          impact: "high",
        },
        {
          id: 2,
          date: "2025-01-17",
          mission: "Set travel budget",
          completed: true,
          impact: "high",
        },
        {
          id: 3,
          date: "2025-01-20",
          mission: "Read 3 solo travel blogs",
          completed: true,
          impact: "medium",
        },
        {
          id: 4,
          date: "2025-01-23",
          mission: "Check passport expiration",
          completed: true,
          impact: "high",
        },
        {
          id: 5,
          date: "2025-01-25",
          mission: "Join solo female travelers group",
          completed: true,
          impact: "medium",
        },
        {
          id: 6,
          date: "2025-01-28",
          mission: "Book refundable flight",
          completed: true,
          impact: "critical",
        },
        {
          id: 7,
          date: "2025-02-01",
          mission: "Research accommodations in Ubud",
          completed: false,
          impact: "high",
        },
        {
          id: 8,
          date: "2025-02-05",
          mission: "Get travel insurance quote",
          completed: false,
          impact: "medium",
        },
        {
          id: 9,
          date: "2025-02-10",
          mission: "Plan first 3 days itinerary",
          completed: false,
          impact: "medium",
        },
      ],
    },
    {
      id: 2,
      title: "Negotiate $120K Salary",
      category: "career",
      status: "completed",
      progress: 100,
      startDate: "2024-11-01",
      completedDate: "2025-01-10",
      couragePoints: 580,
      proofPoints: [
        {
          id: 1,
          date: "2024-11-01",
          mission: "Research market salary rates",
          completed: true,
          impact: "high",
        },
        {
          id: 2,
          date: "2024-11-05",
          mission: "Document my achievements (2024)",
          completed: true,
          impact: "critical",
        },
        {
          id: 3,
          date: "2024-11-10",
          mission: "Practice negotiation script",
          completed: true,
          impact: "high",
        },
        {
          id: 4,
          date: "2024-11-15",
          mission: "Schedule 1:1 with manager",
          completed: true,
          impact: "critical",
        },
        {
          id: 5,
          date: "2024-11-20",
          mission: "Prepare counter-offer strategy",
          completed: true,
          impact: "high",
        },
        {
          id: 6,
          date: "2024-12-01",
          mission: "Have the conversation",
          completed: true,
          impact: "critical",
        },
        {
          id: 7,
          date: "2025-01-10",
          mission: "Sign new contract!",
          completed: true,
          impact: "critical",
        },
      ],
    },
  ];

  const activeDream = selectedDream || dreams[0];
  const completedMissions = activeDream.proofPoints.filter((p) => p.completed);
  const totalMissions = activeDream.proofPoints.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={["#FDF2F8", "#F3E8FF", "#CCFBF1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Text style={styles.headerIcon}>✨</Text>
              <Text style={styles.headerText}>Evidence Board</Text>
            </View>
            <Text style={styles.headerSubtext}>
              Your proof that dreams become reality, one small action at a time.
            </Text>
          </View>

          {/* Dream Selector */}
          <View style={styles.dreamGrid}>
            {dreams.map((dream) => (
              <View key={dream.id} style={{ width: width > 800 ? "48%" : "100%", marginBottom: 16 }}>
                <DreamCard
                  dream={dream}
                  isSelected={activeDream.id === dream.id}
                  onPress={() => setSelectedDream(dream)}
                />
              </View>
            ))}
          </View>

          {/* Main Evidence Board */}
          <View style={styles.mainBoard}>
            {/* Progress Overview */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.dreamName}>{activeDream.title}</Text>
                  <View style={styles.startDate}>
                    <Text style={styles.startDateText}>
                      📅 Started {formatDate(activeDream.startDate)}
                    </Text>
                  </View>
                </View>
                {activeDream.status === "completed" && (
                  <TouchableOpacity
                    style={styles.recapButton}
                    onPress={() => setShowRecap(true)}
                  >
                    <Text style={styles.recapButtonText}>🏆 View Journey Recap</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarLabel}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressCount}>
                    {completedMissions.length} of {totalMissions} missions
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={getCategoryGradient(activeDream.category)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressFill,
                      { width: `${activeDream.progress}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsGrid}>
                <LinearGradient
                  colors={["#F3E8FF", "#DDD6FE"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}
                >
                  <Text style={styles.statValue}>{completedMissions.length}</Text>
                  <Text style={styles.statLabel}>Actions Taken</Text>
                </LinearGradient>
                <LinearGradient
                  colors={["#FEF3C7", "#FED7AA"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}
                >
                  <Text style={styles.statValue}>{activeDream.couragePoints}</Text>
                  <Text style={styles.statLabel}>Courage Points</Text>
                </LinearGradient>
                <LinearGradient
                  colors={["#CCFBF1", "#99F6E4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}
                >
                  <Text style={styles.statValue}>{activeDream.progress}%</Text>
                  <Text style={styles.statLabel}>Complete</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Proof Points Timeline */}
            <View style={styles.proofPointsSection}>
              <View style={styles.proofPointsHeader}>
                <Text style={styles.proofPointsIcon}>✨</Text>
                <Text style={styles.proofPointsTitle}>Your Proof Points</Text>
              </View>

              <FlatList
                scrollEnabled={false}
                data={activeDream.proofPoints}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                  <ProofPointItem point={item} index={index} />
                )}
              />
            </View>

            {/* Next Mission CTA */}
            {activeDream.status !== "completed" && (
              <LinearGradient
                colors={["#14B8A6", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaContainer}
              >
                <View style={styles.ctaContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ctaTitle}>
                      Ready for your next proof point?
                    </Text>
                    <Text style={styles.ctaSubtitle}>
                      Keep building your evidence. You're closer than you think.
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.ctaButton}>
                    <Text style={styles.ctaButtonText}>Next Mission →</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            )}
          </View>

          {/* Motivational Footer */}
          <LinearGradient
            colors={["#F3E8FF", "#FCE7F3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.footer}
          >
            <Text style={styles.footerQuote}>
              "Every single action is proof. Proof that you're not just dreaming
              anymore—you're doing."
            </Text>
            <Text style={styles.footerAuthor}>— Gabby Beckford</Text>
          </LinearGradient>
        </ScrollView>
      </LinearGradient>

      {/* Bottom Navigation */}
      <BottomNavbar onNavigate={onNavigate} activeTab="evidence" />

      {/* Journey Recap Modal */}
      <JourneyRecapModal
        visible={showRecap}
        dream={activeDream}
        totalMissions={totalMissions}
        onClose={() => setShowRecap(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtext: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  dreamGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  mainBoard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 32,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  progressSection: {
    marginBottom: 32,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  dreamName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  startDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  startDateText: {
    fontSize: 14,
    color: "#6B7280",
  },
  recapButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  recapButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBarLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  progressCount: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1F2937",
  },
  progressBar: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 9999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 9999,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  proofPointsSection: {
    marginBottom: 24,
  },
  proofPointsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  proofPointsIcon: {
    fontSize: 24,
  },
  proofPointsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  ctaContainer: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
  },
  ctaButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#14B8A6",
  },
  footer: {
    borderRadius: 24,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  footerQuote: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
  },
  footerAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
});

export default EvidenceBoardScreen;
