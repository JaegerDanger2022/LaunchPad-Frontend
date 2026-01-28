import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Color, getThemeColors, EvidenceBoardColors } from "../constants/GlobalStyles";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>
      <LinearGradient
        colors={["#FDF2F8", "#F3E8FF", "#CCFBF1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        >
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>✨</Text>
              <Text style={{ fontSize: 32, fontWeight: "bold", color: EvidenceBoardColors.text.primary }}>
                Evidence Board
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: EvidenceBoardColors.text.light, lineHeight: 24 }}>
              Your proof that dreams become reality, one small action at a time.
            </Text>
          </View>

          {/* Dream Selector */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 32 }}>
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
          <View
            style={{
              backgroundColor: EvidenceBoardColors.white,
              borderRadius: 32,
              padding: 32,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            {/* Progress Overview */}
            <View style={{ marginBottom: 32, paddingBottom: 32, borderBottomWidth: 1, borderBottomColor: EvidenceBoardColors.gray300 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <View>
                  <Text style={{ fontSize: 28, fontWeight: "bold", color: EvidenceBoardColors.text.primary, marginBottom: 8 }}>
                    {activeDream.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 14, color: EvidenceBoardColors.text.secondary }}>
                      📅 Started {formatDate(activeDream.startDate)}
                    </Text>
                  </View>
                </View>
                {activeDream.status === "completed" && (
                  <TouchableOpacity
                    style={{ backgroundColor: "transparent", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }}
                    onPress={() => setShowRecap(true)}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: EvidenceBoardColors.text.primary }}>
                      🏆 View Journey Recap
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Progress Bar */}
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: EvidenceBoardColors.text.secondary }}>Progress</Text>
                  <Text style={{ fontSize: 12, fontWeight: "bold", color: EvidenceBoardColors.text.primary }}>
                    {completedMissions.length} of {totalMissions} missions
                  </Text>
                </View>
                <View
                  style={{
                    height: 12,
                    backgroundColor: EvidenceBoardColors.gray300,
                    borderRadius: 9999,
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={getCategoryGradient(activeDream.category)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: "100%", width: `${activeDream.progress}%`, borderRadius: 9999 }}
                  />
                </View>
              </View>

              {/* Stats */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <LinearGradient
                  colors={["#F3E8FF", "#DDD6FE"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, borderRadius: 12, padding: 16, justifyContent: "center", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 28, fontWeight: "bold", color: EvidenceBoardColors.text.primary, marginBottom: 4 }}>
                    {completedMissions.length}
                  </Text>
                  <Text style={{ fontSize: 12, color: EvidenceBoardColors.text.secondary }}>Actions Taken</Text>
                </LinearGradient>
                <LinearGradient
                  colors={["#FEF3C7", "#FED7AA"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, borderRadius: 12, padding: 16, justifyContent: "center", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 28, fontWeight: "bold", color: EvidenceBoardColors.text.primary, marginBottom: 4 }}>
                    {activeDream.couragePoints}
                  </Text>
                  <Text style={{ fontSize: 12, color: EvidenceBoardColors.text.secondary }}>Courage Points</Text>
                </LinearGradient>
                <LinearGradient
                  colors={["#CCFBF1", "#99F6E4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, borderRadius: 12, padding: 16, justifyContent: "center", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 28, fontWeight: "bold", color: EvidenceBoardColors.text.primary, marginBottom: 4 }}>
                    {activeDream.progress}%
                  </Text>
                  <Text style={{ fontSize: 12, color: EvidenceBoardColors.text.secondary }}>Complete</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Proof Points Timeline */}
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 8 }}>
                <Text style={{ fontSize: 24 }}>✨</Text>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: EvidenceBoardColors.text.primary }}>
                  Your Proof Points
                </Text>
              </View>

              <FlatList
                scrollEnabled={false}
                data={activeDream.proofPoints}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => <ProofPointItem point={item} index={index} />}
              />
            </View>

            {/* Next Mission CTA */}
            {activeDream.status !== "completed" && (
              <LinearGradient
                colors={["#14B8A6", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 24, padding: 24, marginBottom: 24 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: EvidenceBoardColors.white, marginBottom: 4 }}>
                      Ready for your next proof point?
                    </Text>
                    <Text style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.9)" }}>
                      Keep building your evidence. You're closer than you think.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: EvidenceBoardColors.white,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: EvidenceBoardColors.teal }}>Next Mission →</Text>
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
            style={{ borderRadius: 24, padding: 24, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 16,
                fontStyle: "italic",
                color: EvidenceBoardColors.text.light,
                textAlign: "center",
                marginBottom: 12,
                lineHeight: 24,
              }}
            >
              "Every single action is proof. Proof that you're not just dreaming anymore—you're doing."
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: EvidenceBoardColors.text.secondary }}>
              — Gabby Beckford
            </Text>
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

export default EvidenceBoardScreen;
