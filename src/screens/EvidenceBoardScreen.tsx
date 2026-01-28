import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";
import { BottomNavbar } from "../components/BottomNavbar";

type DreamCategory = "travel" | "career" | "financial" | "other";
type DreamStatus = "in-progress" | "completed";
type ImpactLevel = "critical" | "high" | "medium" | "low";

interface ProofPoint {
  id: number;
  date: string;
  mission: string;
  completed: boolean;
  impact: ImpactLevel;
}

interface Dream {
  id: number;
  title: string;
  category: DreamCategory;
  status: DreamStatus;
  progress: number;
  startDate: string;
  targetDate?: string;
  completedDate?: string;
  couragePoints: number;
  proofPoints: ProofPoint[];
}

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

  const getImpactColor = (impact: ImpactLevel) => {
    switch (impact) {
      case "critical":
        return "#FBBF24"; // amber-400
      case "high":
        return "#FB7185"; // rose-400
      case "medium":
        return "#A855F7"; // purple-400
      default:
        return "#14B8A6"; // teal-400
    }
  };

  const getCategoryGradient = (
    category: DreamCategory
  ): [string, string, ...string[]] => {
    switch (category) {
      case "travel":
        return ["#14B8A6", "#06B6D4"]; // teal to cyan
      case "career":
        return ["#F43F5E", "#EC4899"]; // rose to pink
      case "financial":
        return ["#F59E0B", "#F97316"]; // amber to orange
      default:
        return ["#A855F7", "#6366F1"]; // purple to indigo
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const DreamCard = ({
    dream,
    isSelected,
  }: {
    dream: Dream;
    isSelected: boolean;
  }) => (
    <TouchableOpacity
      onPress={() => setSelectedDream(dream)}
      style={[
        styles.dreamCard,
        {
          backgroundColor: isSelected ? "#FFFFFF" : "#FFFFFF",
          borderWidth: isSelected ? 2 : 0,
          borderColor: isSelected ? "#14B8A6" : "transparent",
          opacity: isSelected ? 1 : 0.8,
        },
      ]}
    >
      <View style={styles.dreamCardHeader}>
        <LinearGradient
          colors={getCategoryGradient(dream.category)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryIcon}
        >
          <Text style={{ fontSize: 20 }}>
            {dream.category === "travel"
              ? "✈️"
              : dream.category === "career"
                ? "💼"
                : "💰"}
          </Text>
        </LinearGradient>
        {dream.status === "completed" && (
          <View
            style={[
              styles.completedBadge,
              { backgroundColor: "rgba(34, 197, 94, 0.2)" },
            ]}
          >
            <Text style={styles.completedBadgeText}>Completed!</Text>
          </View>
        )}
      </View>
      <Text style={styles.dreamTitle}>{dream.title}</Text>
      <View style={styles.couragePoints}>
        <Text style={styles.couragePointsText}>
          🏆 {dream.couragePoints} courage points
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ProofPointItem = ({ point, index }: { point: ProofPoint; index: number }) => (
    <View style={styles.proofPointContainer}>
      <View
        style={[
          styles.timelineDot,
          {
            backgroundColor: point.completed ? getImpactColor(point.impact) : "#E5E7EB",
          },
        ]}
      >
        {point.completed ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : (
          <View style={styles.pendingDot} />
        )}
      </View>

      <View
        style={[
          styles.missionCard,
          {
            backgroundColor: point.completed ? "#FFFFFF" : "#F9FAFB",
            opacity: point.completed ? 1 : 0.7,
          },
        ]}
      >
        <View style={styles.missionHeader}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.missionTitle,
                { color: point.completed ? "#1F2937" : "#9CA3AF" },
              ]}
            >
              {point.mission}
            </Text>
            <Text style={styles.missionDate}>{formatDateShort(point.date)}</Text>
          </View>
          {point.impact === "critical" && point.completed && (
            <View style={styles.bigWinBadge}>
              <Text style={styles.bigWinText}>✨ Big Win</Text>
            </View>
          )}
        </View>

        {point.completed && (
          <View style={styles.couragePointsBadge}>
            <Text style={styles.couragePointsSmallText}>
              +
              {point.impact === "critical"
                ? 100
                : point.impact === "high"
                  ? 50
                  : 25}{" "}
              courage points
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const JourneyRecap = () => (
    <Modal
      visible={showRecap}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRecap(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.recapContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowRecap(false)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={["#FEE2E2", "#FEF3C7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.recapContent}
          >
            <View style={styles.recapHeader}>
              <LinearGradient
                colors={["#FBBF24", "#FB7185"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.recapIcon}
              >
                <Text style={styles.trophyIcon}>🏆</Text>
              </LinearGradient>
              <Text style={styles.recapTitle}>You Did It!</Text>
              <Text style={styles.recapSubtitle}>Journey Complete</Text>
            </View>

            <View style={styles.recapStats}>
              <View style={styles.recapStatRow}>
                <Text style={styles.recapStatLabel}>Time taken</Text>
                <Text style={styles.recapStatValue}>70 days</Text>
              </View>
              <View style={styles.recapStatRow}>
                <Text style={styles.recapStatLabel}>Missions completed</Text>
                <Text style={styles.recapStatValue}>{totalMissions} actions</Text>
              </View>
              <View style={styles.recapStatRow}>
                <Text style={styles.recapStatLabel}>Courage earned</Text>
                <Text
                  style={[
                    styles.recapStatValue,
                    { color: "#B45309" },
                  ]}
                >
                  {activeDream.couragePoints} points
                </Text>
              </View>
            </View>

            <View style={styles.recapQuote}>
              <Text style={styles.quoteText}>
                "A month ago, this was just a dream. Today, it's your reality. You
                showed up, took action, and proved to yourself what you're capable of."
              </Text>
              <Text style={styles.quoteAuthor}>— Gabby</Text>
            </View>

            <View style={styles.recapButtonRow}>
              <TouchableOpacity style={styles.shareButton}>
                <Text style={styles.shareButtonText}>Share Victory</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

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
      <JourneyRecap />
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
  dreamCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dreamCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  completedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#15803D",
  },
  dreamTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  couragePoints: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  couragePointsText: {
    fontSize: 14,
    color: "#6B7280",
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
  proofPointContainer: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    flexShrink: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkmark: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  pendingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  missionCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  missionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  missionDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  bigWinBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bigWinText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#B45309",
  },
  couragePointsBadge: {
    marginTop: 8,
  },
  couragePointsSmallText: {
    fontSize: 11,
    color: "#6B7280",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  recapContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 32,
    overflow: "hidden",
    position: "relative",
  },
  recapContent: {
    padding: 32,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 32,
    color: "#6B7280",
    fontWeight: "300",
  },
  recapHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  recapIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  trophyIcon: {
    fontSize: 32,
  },
  recapTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  recapSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  recapStats: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recapStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  recapStatLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  recapStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  recapQuote: {
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#374151",
    lineHeight: 22,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "right",
  },
  recapButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
});

export default EvidenceBoardScreen;
