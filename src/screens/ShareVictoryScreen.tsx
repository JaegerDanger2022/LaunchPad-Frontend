import React, { useState } from "react";
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
  const { createVictoryCard } = useCommunityStore();
  const { updateCouragePoints, userData } = useAuthStore();

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

    try {
      setIsSaving(true);
      console.log("[ShareVictoryScreen] Creating victory card with milestoneId:", victory.milestoneId);
      await createVictoryCard(
        victory.milestoneId,
        evidenceSnippet.trim(),
        isAnonymous,
        selectedImpact,
      );

      // Award courage points locally
      updateCouragePoints(5);

      setIsSaving(false);

      // Navigate to Evidence Board after posting to avoid seeing lingering toasts
      onNavigate("EvidenceBoard");
    } catch (error) {
      console.error("Failed to share victory:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Share",
        text2: "Please try again",
      });
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
    milestoneId: victory?.milestoneId || '',
    milestoneTitle: victory?.milestoneTitle || '',
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
          Share Your Victory
        </Text>
        <View style={{ width: 24 }} />
      </View>

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
              ? 'Your victory will show as "Someone"'
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
              backgroundColor: "#2D5BFF",
              opacity: isSaving ? 0.6 : 1,
            }}
            onPress={handleShare}
            disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}>
                Post to Victory Wall
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ShareVictoryScreen;
