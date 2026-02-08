import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  VictoryCard as VictoryCardType,
  ImpactLevel,
} from "../types/community";
import { VictoryCard } from "../components/community/VictoryCard";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../store/authStore";
import { useCommunityStore } from "../store/communityStore";
import { useThemeStore } from "../store/themeStore";
import { getThemeColors } from "../constants/GlobalStyles";
import { checkVictoryExists } from "../config/api";

interface ShareVictoryScreenProps {
  onNavigate: (screen: string) => void;
  victory: VictoryCardType;
}

const IMPACT_LEVELS: Array<{ label: string; value: ImpactLevel }> = [
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const ShareVictoryScreen: React.FC<ShareVictoryScreenProps> = ({
  onNavigate,
  victory,
}) => {
  console.log("[ShareVictoryScreen] Received victory:", victory);
  console.log("[ShareVictoryScreen] Victory milestoneTitle:", victory?.milestoneTitle);

  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const [evidenceSnippet, setEvidenceSnippet] = useState(
    victory?.evidenceSnippet || "",
  );
  const [selectedImpact, setSelectedImpact] = useState<ImpactLevel>(
    victory?.impactLevel || "high",
  );
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alreadyPosted, setAlreadyPosted] = useState(false);
  const [checkingVictory, setCheckingVictory] = useState(true);
  const { createVictoryCard } = useCommunityStore();
  const { updateCouragePoints, userData } = useAuthStore();

  // Check if victory already exists when component mounts
  useEffect(() => {
    const checkExistingVictory = async () => {
      if (!victory?.milestoneId || !userData?.user_id) {
        setCheckingVictory(false);
        return;
      }

      try {
        const exists = await checkVictoryExists(userData.user_id, victory.milestoneId);
        setAlreadyPosted(exists);
      } catch (error) {
        console.error("[ShareVictoryScreen] Error checking victory:", error);
        // If check fails, allow posting (fail gracefully)
        setAlreadyPosted(false);
      } finally {
        setCheckingVictory(false);
      }
    };

    checkExistingVictory();
  }, [victory?.milestoneId, userData?.user_id]);

  const handleShare = async () => {
    if (!victory) {
      console.error("[ShareVictoryScreen] No victory data available");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Victory data not found",
      });
      return;
    }

    if (alreadyPosted) {
      Toast.show({
        type: "info",
        text1: "Already Posted",
        text2: "You've already shared this milestone victory",
      });
      return;
    }

    try {
      setIsSaving(true);
      console.log("[ShareVictoryScreen] Creating victory card with milestoneId:", victory.milestoneId);
      await createVictoryCard(
        userData.user_id,
        victory.dreamId,
        victory.milestoneId,
        evidenceSnippet.trim(),
        isAnonymous,
        selectedImpact,
      );

      // Award courage points locally
      updateCouragePoints(5);

      Toast.show({
        type: "success",
        text1: "Victory Shared!",
        text2: "+5 Courage Points earned",
      });

      setIsSaving(false);

      // Navigate to Dreams screen after posting
      onNavigate("AllDreams");
    } catch (error: any) {
      console.error("Failed to share victory:", error);

      // Check if it's a duplicate error
      const errorMessage = error?.message || "";
      if (errorMessage.includes("already posted")) {
        setAlreadyPosted(true);
        Toast.show({
          type: "info",
          text1: "Already Posted",
          text2: "You've already shared this milestone victory",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to Share",
          text2: errorMessage || "Please try again",
        });
      }
      setIsSaving(false);
    }
  };

  // Provide default values to prevent undefined errors
  const previewVictory: VictoryCardType = {
    id: victory?.id || '',
    userId: victory?.userId || '',
    userDisplayName: isAnonymous ? "Anonymous" : (userData?.firstname || victory?.userDisplayName || 'User'),
    userLocation: isAnonymous ? undefined : (userData?.location || victory?.userLocation),
    userAge: isAnonymous ? undefined : (userData?.age || victory?.userAge),
    prefTimezone: isAnonymous ? (userData?.pref_timezone || victory?.prefTimezone) : undefined,
    milestoneId: victory?.milestoneId || '',
    milestoneTitle: victory?.milestoneTitle || '',
    challengeType: victory?.challengeType,
    dreamId: victory?.dreamId || '',
    dreamCategory: victory?.dreamCategory || 'achievement_goals',
    evidenceSnippet,
    confidenceBoost: victory?.confidenceBoost || 10,
    impactLevel: selectedImpact,
    completedDate: victory?.completedDate || new Date().toISOString(),
    createdAt: victory?.createdAt || new Date().toISOString(),
    courageBoosts: victory?.courageBoosts || 0,
    hasUserBoosted: victory?.hasUserBoosted || false,
    isAnonymous,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg_primary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: insets.top + 12,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.bg_secondary,
        }}>
        <TouchableOpacity
          onPress={() => onNavigate("Home")}
          disabled={isSaving}>
          <Text style={{ fontSize: 24, color: colors.text_secondary }}>✕</Text>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.text_primary,
          }}>
          Share Your Milestone
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Already Posted Banner */}
      {alreadyPosted && (
        <View
          style={{
            backgroundColor: isDark ? "rgba(255, 193, 7, 0.1)" : "rgba(255, 193, 7, 0.2)",
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "rgba(255, 193, 7, 0.3)" : "rgba(255, 193, 7, 0.5)",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: isDark ? "#FFC107" : "#F57C00",
              textAlign: "center",
            }}>
            ⚠️ You've already posted a victory for this milestone
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        scrollEnabled={true}
        bounces={false}>
        {/* Preview */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: colors.bg_secondary,
            marginTop: 12,
          }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.text_primary,
              marginBottom: 12,
            }}>
            Preview
          </Text>
          <VictoryCard victory={previewVictory} onBoost={() => {}} />
        </View>

        {/* Evidence Input */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: colors.bg_secondary,
            marginTop: 12,
          }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.text_primary,
              }}>
              Your Proof
            </Text>
            <Text style={{ fontSize: 11, color: colors.text_secondary }}>
              {evidenceSnippet.length}/200
            </Text>
          </View>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: colors.text_primary,
              minHeight: 80,
              textAlignVertical: "top",
              backgroundColor: isDark ? colors.bg_primary : "#FFFFFF",
            }}
            placeholder="Add proof of your victory (optional, max 200 chars)"
            value={evidenceSnippet}
            onChangeText={(text) => setEvidenceSnippet(text.slice(0, 200))}
            multiline
            maxLength={200}
            editable={!isSaving}
            placeholderTextColor={colors.text_secondary}
          />
        </View>

        {/* Impact Level */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: colors.bg_secondary,
            marginTop: 12,
          }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.text_primary,
              marginBottom: 8,
            }}>
            How much of an impact?
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {IMPACT_LEVELS.map((level) => {
              const isActive = selectedImpact === level.value;
              return (
                <TouchableOpacity
                  key={level.value}
                  style={{
                    flex: 1,
                    minWidth: "45%",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: isActive ? "#2D5BFF" : colors.border,
                    borderRadius: 8,
                    alignItems: "center",
                    backgroundColor: isActive
                      ? "#2D5BFF"
                      : isDark
                        ? colors.bg_primary
                        : "#FFFFFF",
                  }}
                  onPress={() => setSelectedImpact(level.value)}
                  disabled={isSaving}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: isActive ? "#FFFFFF" : colors.text_primary,
                    }}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Anonymous Toggle */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: colors.bg_secondary,
            marginTop: 12,
          }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.text_primary,
              }}>
              Share Anonymously
            </Text>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              disabled={isSaving}
            />
          </View>
          <Text
            style={{
              fontSize: 12,
              color: colors.text_secondary,
              fontStyle: "italic",
            }}>
            {isAnonymous
              ? 'Your victory will show as "Someone in {your timezone}"'
              : "Your name will be visible to the community"}
          </Text>
        </View>

        {/* Action Buttons */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            gap: 12,
            marginTop: 20,
          }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isDark ? colors.bg_primary : "#FFFFFF",
            }}
            onPress={() => onNavigate("Home")}
            disabled={isSaving}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text_primary,
              }}>
              Skip for Now
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: alreadyPosted ? colors.text_tertiary : "#2D5BFF",
              opacity: (isSaving || alreadyPosted) ? 0.6 : 1,
            }}
            onPress={handleShare}
            disabled={isSaving || alreadyPosted || checkingVictory}>
            {checkingVictory ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}>
                {alreadyPosted ? "Already Posted" : "Post to Victory Wall"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ShareVictoryScreen;
