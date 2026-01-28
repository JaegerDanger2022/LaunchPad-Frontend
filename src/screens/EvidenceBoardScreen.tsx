import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Color,
  getThemeColors,
  EvidenceBoardColors,
} from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { BottomNavbar } from "../components/BottomNavbar";
import {
  DreamCard,
  ProofPointItem,
  JourneyRecapModal,
  Dream,
  ProofPoint,
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
  const { userData } = useAuthStore();

  const [expandedDreamId, setExpandedDreamId] = useState<number | null>(null);
  const [showRecap, setShowRecap] = useState(false);

  // Animation values for expand/collapse
  const expandAnim = useRef(new Animated.Value(0)).current;

  // Trigger animation when dream is expanded
  useEffect(() => {
    if (expandedDreamId !== null) {
      Animated.timing(expandAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // Layout changes require this to be false
      }).start();
    } else {
      Animated.timing(expandAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [expandedDreamId, expandAnim]);

  // Map userData.dreams to Dream format
  const dreams: Dream[] = useMemo(() => {
    if (!userData?.dreams || !Array.isArray(userData.dreams)) {
      return [];
    }

    return userData.dreams.map((dreamData: any) => {
      // Extract proof points from roadmap milestones
      const proofPoints: ProofPoint[] = [];
      if (
        dreamData.roadmap?.milestones &&
        Array.isArray(dreamData.roadmap.milestones)
      ) {
        proofPoints.push(
          ...dreamData.roadmap.milestones.map((milestone: any) => ({
            id: milestone.id,
            date: "",
            mission: milestone.title,
            completed: milestone.status === "completed",
            impact: "high" as const,
          })),
        );
      }

      // Calculate progress from metadata
      const totalXp = dreamData.metadata?.total_xp || 1;
      const currentScore = dreamData.metadata?.score || 0;
      const progress = Math.min(
        100,
        Math.round((currentScore / totalXp) * 100),
      );

      return {
        id: dreamData.thread_id,
        title: dreamData.dream,
        category: "" as unknown as "travel" | "career" | "financial" | "other",
        status: dreamData.status as "in-progress" | "completed",
        progress,
        startDate: dreamData.created_at || new Date().toISOString(),
        targetDate: "",
        couragePoints: currentScore,
        proofPoints,
        dream_card_bg: dreamData.dream_card_bg,
      };
    });
  }, [userData]);

  // Use real data if available, otherwise use fallback
  const displayDreams =
    dreams.length > 0
      ? dreams
      : // Fallback sample data if no userData
        ([] as Dream[]);

  const activeDream =
    displayDreams.find((d) => d.id === expandedDreamId) || null;
  const completedMissions =
    activeDream?.proofPoints.filter((p: ProofPoint) => p.completed) || [];
  const totalMissions = activeDream?.proofPoints.length || 0;

  // For Journey Recap Modal - use activeDream if available
  const recapDream = activeDream;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>
      <LinearGradient
        colors={["#FDF2F8", "#F3E8FF", "#CCFBF1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>✨</Text>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: EvidenceBoardColors.text.primary,
                }}>
                Evidence Board
              </Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                color: EvidenceBoardColors.text.light,
                lineHeight: 24,
              }}>
              Your proof that dreams become reality, one small action at a time.
            </Text>
          </View>

          {displayDreams.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 40,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: EvidenceBoardColors.text.secondary,
                  textAlign: "center",
                }}>
                No dreams yet. Create one to get started!
              </Text>
            </View>
          ) : (
            <>
              {/* Dream Cards with Expandable Evidence Board */}
              <View
                style={{
                  width: "100%",
                  marginBottom: 32,
                }}>
                {displayDreams.map((dream) => {
                  const isExpanded = expandedDreamId === dream.id;
                  const completedMissions = dream.proofPoints.filter(
                    (p: ProofPoint) => p.completed,
                  );

                  return (
                    <Animated.View
                      key={dream.id}
                      style={{
                        marginBottom: 16,
                        opacity: expandAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1],
                        }),
                      }}>
                      {/* Dream Card Container - Expands to show evidence board */}
                      <View
                        style={{
                          backgroundColor: isExpanded
                            ? EvidenceBoardColors.white
                            : dream.dream_card_bg ||
                              EvidenceBoardColors.dream_card_bg,
                          borderRadius: 24,
                          padding: isExpanded ? 32 : 0,
                          shadowColor: isExpanded ? "#000" : "transparent",
                          shadowOffset: isExpanded
                            ? { width: 0, height: 10 }
                            : { width: 0, height: 0 },
                          shadowOpacity: isExpanded ? 0.1 : 0,
                          shadowRadius: isExpanded ? 20 : 0,
                          elevation: isExpanded ? 8 : 0,
                        }}>
                        {/* Dream Card Header */}
                        <TouchableOpacity
                          onPress={() =>
                            setExpandedDreamId(
                              expandedDreamId === dream.id ? null : dream.id,
                            )
                          }
                          activeOpacity={0.7}>
                          <DreamCard
                            dream={dream}
                            isSelected={isExpanded}
                            onPress={() =>
                              setExpandedDreamId(
                                expandedDreamId === dream.id ? null : dream.id,
                              )
                            }
                          />
                        </TouchableOpacity>

                        {/* Expanded Evidence Board Content - Inside the card */}
                        {isExpanded && (
                          <View
                            style={{
                              marginTop: 24,
                              paddingTop: 24,
                              borderTopWidth: 1,
                              borderTopColor: EvidenceBoardColors.gray300,
                            }}>
                            {/* Progress Overview */}
                            <View
                              style={{
                                marginBottom: 32,
                                paddingBottom: 32,
                                borderBottomWidth: 1,
                                borderBottomColor: EvidenceBoardColors.gray300,
                              }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  marginBottom: 24,
                                }}>
                                <View style={{ flex: 1 }}>
                                  <Text
                                    style={{
                                      fontSize: 20,
                                      fontWeight: "bold",
                                      color: EvidenceBoardColors.text.primary,
                                      marginBottom: 8,
                                    }}>
                                    Journey Details
                                  </Text>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      gap: 8,
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        color:
                                          EvidenceBoardColors.text.secondary,
                                      }}>
                                      📅 Started {formatDate(dream.startDate)}
                                    </Text>
                                  </View>
                                </View>
                                <View style={{ flexDirection: "row", gap: 8 }}>
                                  {dream.status === "completed" && (
                                    <TouchableOpacity
                                      style={{
                                        backgroundColor: "transparent",
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        borderRadius: 12,
                                      }}
                                      onPress={() => setShowRecap(true)}>
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          fontWeight: "600",
                                          color:
                                            EvidenceBoardColors.text.primary,
                                        }}>
                                        🏆 View Journey Recap
                                      </Text>
                                    </TouchableOpacity>
                                  )}
                                  <TouchableOpacity
                                    style={{
                                      backgroundColor: "transparent",
                                      paddingHorizontal: 12,
                                      paddingVertical: 12,
                                      borderRadius: 12,
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                    onPress={() => setExpandedDreamId(null)}>
                                    <Text
                                      style={{
                                        fontSize: 20,
                                        color:
                                          EvidenceBoardColors.text.secondary,
                                      }}>
                                      ↓
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>

                              {/* Progress Bar */}
                              <View style={{ marginBottom: 24 }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginBottom: 8,
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      fontWeight: "600",
                                      color: EvidenceBoardColors.text.secondary,
                                    }}>
                                    Progress
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      fontWeight: "bold",
                                      color: EvidenceBoardColors.text.primary,
                                    }}>
                                    {completedMissions.length} of{" "}
                                    {dream.proofPoints.length} missions
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    height: 12,
                                    backgroundColor:
                                      EvidenceBoardColors.gray300,
                                    borderRadius: 9999,
                                    overflow: "hidden",
                                  }}>
                                  <LinearGradient
                                    colors={getCategoryGradient(dream.category)}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                      height: "100%",
                                      width: `${dream.progress}%`,
                                      borderRadius: 9999,
                                    }}
                                  />
                                </View>
                              </View>

                              {/* Stats */}
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  gap: 12,
                                }}>
                                <LinearGradient
                                  colors={["#F3E8FF", "#DDD6FE"]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={{
                                    flex: 1,
                                    borderRadius: 12,
                                    padding: 16,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 28,
                                      fontWeight: "bold",
                                      color: EvidenceBoardColors.text.primary,
                                      marginBottom: 4,
                                    }}>
                                    {completedMissions.length}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      color: EvidenceBoardColors.text.secondary,
                                    }}>
                                    Actions Taken
                                  </Text>
                                </LinearGradient>
                                <LinearGradient
                                  colors={["#FEF3C7", "#FED7AA"]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={{
                                    flex: 1,
                                    borderRadius: 12,
                                    padding: 16,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 28,
                                      fontWeight: "bold",
                                      color: EvidenceBoardColors.text.primary,
                                      marginBottom: 4,
                                    }}>
                                    {dream.couragePoints}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      color: EvidenceBoardColors.text.secondary,
                                    }}>
                                    Courage Points
                                  </Text>
                                </LinearGradient>
                                <LinearGradient
                                  colors={["#CCFBF1", "#99F6E4"]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={{
                                    flex: 1,
                                    borderRadius: 12,
                                    padding: 16,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 28,
                                      fontWeight: "bold",
                                      color: EvidenceBoardColors.text.primary,
                                      marginBottom: 4,
                                    }}>
                                    {dream.progress}%
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      color: EvidenceBoardColors.text.secondary,
                                    }}>
                                    Complete
                                  </Text>
                                </LinearGradient>
                              </View>
                            </View>

                            {/* Proof Points Timeline */}
                            <View style={{ marginBottom: 24, marginTop: 24 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginBottom: 24,
                                  gap: 8,
                                }}>
                                <Text style={{ fontSize: 24 }}>✨</Text>
                                <Text
                                  style={{
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    color: EvidenceBoardColors.text.primary,
                                  }}>
                                  Your Proof Points
                                </Text>
                              </View>

                              <FlatList
                                scrollEnabled={false}
                                data={dream.proofPoints}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item, index }) => (
                                  <ProofPointItem point={item} index={index} />
                                )}
                              />
                            </View>

                            {/* Next Mission CTA */}
                            {dream.status !== "completed" && (
                              <LinearGradient
                                colors={["#14B8A6", "#06B6D4"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                  borderRadius: 24,
                                  padding: 24,
                                  marginTop: 24,
                                }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 16,
                                  }}>
                                  <View style={{ flex: 1 }}>
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        fontWeight: "bold",
                                        color: EvidenceBoardColors.white,
                                        marginBottom: 4,
                                      }}>
                                      Ready for your next proof point?
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 13,
                                        color: "rgba(255, 255, 255, 0.9)",
                                      }}>
                                      Keep building your evidence. You're closer
                                      than you think.
                                    </Text>
                                  </View>
                                  <TouchableOpacity
                                    style={{
                                      backgroundColor:
                                        EvidenceBoardColors.white,
                                      paddingHorizontal: 16,
                                      paddingVertical: 12,
                                      borderRadius: 12,
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        fontWeight: "600",
                                        color: EvidenceBoardColors.teal,
                                      }}>
                                      Next Mission →
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </LinearGradient>
                            )}

                            {/* Motivational Footer */}
                            <LinearGradient
                              colors={["#F3E8FF", "#FCE7F3"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={{
                                borderRadius: 24,
                                padding: 24,
                                marginTop: 24,
                                justifyContent: "center",
                                alignItems: "center",
                              }}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontStyle: "italic",
                                  color: EvidenceBoardColors.text.light,
                                  textAlign: "center",
                                  marginBottom: 12,
                                  lineHeight: 24,
                                }}>
                                "Every single action is proof. Proof that you're
                                not just dreaming anymore—you're doing."
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "600",
                                  color: EvidenceBoardColors.text.secondary,
                                }}>
                                — Gabby Beckford
                              </Text>
                            </LinearGradient>
                          </View>
                        )}
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            </>
          )}
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
