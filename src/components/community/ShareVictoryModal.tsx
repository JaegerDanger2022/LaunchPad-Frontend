import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
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
    if (!evidenceSnippet.trim()) {
      Toast.show({
        type: "error",
        text1: "Evidence Required",
        text2: "Please add proof of your victory",
      });
      return;
    }

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
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => {}}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={true}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} disabled={isSaving}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Share Your Victory</Text>
            <View style={styles.spacer} />
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <VictoryCard victory={previewVictory} onBoost={() => {}} />
          </View>

          {/* Evidence Input */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Your Proof</Text>
              <Text style={styles.charCounter}>
                {evidenceSnippet.length}/200
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="What's your proof? (max 200 chars)"
              value={evidenceSnippet}
              onChangeText={(text) => setEvidenceSnippet(text.slice(0, 200))}
              multiline
              maxLength={200}
              editable={!isSaving}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Impact Level */}
          <View style={styles.section}>
            <Text style={styles.label}>How much of an impact?</Text>
            <View style={styles.impactGrid}>
              {IMPACT_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.impactButton,
                    selectedImpact === level.value && styles.impactButtonActive,
                  ]}
                  onPress={() => setSelectedImpact(level.value)}
                  disabled={isSaving}>
                  <Text
                    style={[
                      styles.impactButtonText,
                      selectedImpact === level.value &&
                        styles.impactButtonTextActive,
                    ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Anonymous Toggle */}
          <View style={styles.section}>
            <View style={styles.anonymousRow}>
              <Text style={styles.label}>Share Anonymously</Text>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                disabled={isSaving}
              />
            </View>
            <Text style={styles.helperText}>
              {isAnonymous
                ? 'Your victory will show as "Someone"'
                : "Your name will be visible to the community"}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={onClose}
              disabled={isSaving}>
              <Text style={styles.buttonSecondaryText}>Skip for Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonPrimary, isSaving && styles.buttonDisabled]}
              onPress={handleShare}
              disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonPrimaryText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  closeButton: {
    fontSize: 24,
    color: "#6B7280",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  spacer: {
    width: 24,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    minHeight: 80,
    textAlignVertical: "top",
  },
  impactGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  impactButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  impactButtonActive: {
    backgroundColor: "#2D5BFF",
    borderColor: "#2D5BFF",
  },
  impactButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  impactButtonTextActive: {
    color: "#FFFFFF",
  },
  anonymousRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  buttonSecondary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  buttonPrimary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2D5BFF",
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
