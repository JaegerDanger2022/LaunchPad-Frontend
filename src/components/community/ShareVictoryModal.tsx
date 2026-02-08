import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Switch,
} from "react-native";
import {
  VictoryCard as VictoryCardType,
  ImpactLevel,
} from "../../types/community";
import { VictoryCard } from "./VictoryCard";
import Toast from "react-native-toast-message";
import { useThemeStore } from "../../store/themeStore";
import { getThemeColors } from "../../constants/GlobalStyles";

interface ShareVictoryModalProps {
  visible: boolean;
  victory: VictoryCardType | null;
  onClose: () => void;
  onShare: (
    evidenceSnippet: string,
    isAnonymous: boolean,
    impact: ImpactLevel,
  ) => Promise<void>;
  loading?: boolean;
}

const IMPACT_LEVELS: Array<{ label: string; value: ImpactLevel }> = [
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export const ShareVictoryModal: React.FC<ShareVictoryModalProps> = ({
  visible,
  victory,
  onClose,
  onShare,
  loading = false,
}) => {
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";

  const [evidenceSnippet, setEvidenceSnippet] = useState(
    victory?.evidenceSnippet || "",
  );
  const [selectedImpact, setSelectedImpact] = useState<ImpactLevel>(
    victory?.impactLevel || "high",
  );
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (victory) {
      setEvidenceSnippet(victory.evidenceSnippet);
      setSelectedImpact(victory.impactLevel);
      setIsAnonymous(false);
    }
  }, [victory, visible]);

  const handleShare = async () => {
    try {
      setIsSaving(true);
      await onShare(evidenceSnippet.trim(), isAnonymous, selectedImpact);
      setIsSaving(false);
      onClose();
    } catch (error) {
      setIsSaving(false);
      // Error toast is handled by parent
    }
  };

  if (!victory) return null;

  const previewVictory: VictoryCardType = {
    ...victory,
    evidenceSnippet,
    impactLevel: selectedImpact,
    isAnonymous,
    userDisplayName: isAnonymous ? "Anonymous" : victory.userDisplayName,
    userLocation: isAnonymous ? undefined : victory.userLocation,
    userAge: isAnonymous ? undefined : victory.userAge,
    prefTimezone: isAnonymous ? victory.prefTimezone : undefined,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => {}}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg_primary }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          scrollEnabled={true}
          bounces={false}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.bg_secondary,
            }}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSaving}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 4, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            >
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
              onPress={onClose}
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
      </SafeAreaView>
    </Modal>
  );
};
