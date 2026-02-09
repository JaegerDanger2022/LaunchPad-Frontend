import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { X, Plus, Trash2, CheckCircle2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import {
  getThemeColors,
  ChallengeTypeColors,
  ChallengeTypeName,
} from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { createCustomDream } from "../config/api";

interface DIYDreamModalProps {
  visible: boolean;
  onClose: () => void;
  onDreamCreating?: () => void;
}

type ChallengeType =
  | "power_move"
  | "knowledge_quest"
  | "prep_ritual"
  | "courage_check"
  | "skill_flex"
  | "decision_point"
  | "celebration_moment";

interface CustomMilestone {
  id: string;
  title: string;
  description: string;
  challengeType: ChallengeType;
}

const CHALLENGE_TYPES: Array<{
  value: ChallengeType;
  label: string;
  gif: any;
  gifDark: any; // For light mode backgrounds
}> = [
  {
    value: "power_move",
    label: "Power Move",
    gif: require("../assets/animations/PowerMove.png"),
    gifDark: require("../assets/animations/PowerMove_dark.png"),
  },
  {
    value: "knowledge_quest",
    label: "Knowledge Quest",
    gif: require("../assets/animations/KnowledgeQuest.png"),
    gifDark: require("../assets/animations/KnowledgeQuest_dark.png"),
  },
  {
    value: "prep_ritual",
    label: "Prep Ritual",
    gif: require("../assets/animations/PrepRitual.png"),
    gifDark: require("../assets/animations/PrepRitual_dark.png"),
  },
  {
    value: "courage_check",
    label: "Courage Check",
    gif: require("../assets/animations/courageCheck.png"),
    gifDark: require("../assets/animations/courageCheck_dark.png"),
  },
  {
    value: "skill_flex",
    label: "Skill Flex",
    gif: require("../assets/animations/SkillFlex.png"),
    gifDark: require("../assets/animations/SkillFlex_dark.png"),
  },
  {
    value: "decision_point",
    label: "Decision Point",
    gif: require("../assets/animations/DecisionPoint.png"),
    gifDark: require("../assets/animations/DecisionPoint_dark.png"),
  },
  {
    value: "celebration_moment",
    label: "Celebration",
    gif: require("../assets/animations/Celebration Moment.png"),
    gifDark: require("../assets/animations/CelebrationMoment_dark.png"),
  },
];

const CARD_COLORS = [
  { value: "#A855F7", label: "Purple", lightBg: "#F3E8FF" },
  { value: "#14B8A6", label: "Teal", lightBg: "#CCFBF1" },
  { value: "#F43F5E", label: "Rose", lightBg: "#FFE4E6" },
  { value: "#F59E0B", label: "Amber", lightBg: "#FEF3C7" },
  { value: "#6366F1", label: "Indigo", lightBg: "#E0E7FF" },
  { value: "#EC4899", label: "Pink", lightBg: "#FCE7F3" },
  { value: "#06B6D4", label: "Cyan", lightBg: "#CFFAFE" },
  { value: "#F97316", label: "Orange", lightBg: "#FFEDD5" },
];

export const DIYDreamModal: React.FC<DIYDreamModalProps> = ({
  visible,
  onClose,
  onDreamCreating,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const { user, refreshDreamsFromCrud } = useAuthStore();
  const isDark = theme === "dark";

  const [dreamTitle, setDreamTitle] = useState("");
  const [cardColor, setCardColor] = useState(CARD_COLORS[0].value);
  const [milestones, setMilestones] = useState<CustomMilestone[]>([
    { id: "1", title: "", description: "", challengeType: "power_move" },
  ]);
  const [creating, setCreating] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(
    "1",
  );

  const handleAddMilestone = () => {
    const newId = Date.now().toString();
    setMilestones([
      ...milestones,
      { id: newId, title: "", description: "", challengeType: "power_move" },
    ]);
    setExpandedMilestone(newId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRemoveMilestone = (id: string) => {
    if (milestones.length === 1) {
      Alert.alert("Cannot Remove", "You need at least one milestone.");
      return;
    }
    setMilestones(milestones.filter((m) => m.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUpdateMilestone = (
    id: string,
    field: keyof CustomMilestone,
    value: string,
  ) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const handleToggleExpand = (id: string) => {
    setExpandedMilestone(expandedMilestone === id ? null : id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCreate = async () => {
    // Validation
    if (!dreamTitle.trim()) {
      Alert.alert("Missing Title", "Please enter a title for your dream.");
      return;
    }

    const validMilestones = milestones.filter((m) => m.title.trim());
    if (validMilestones.length === 0) {
      Alert.alert(
        "Missing Milestones",
        "Please add at least one milestone with a title.",
      );
      return;
    }

    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    setCreating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await createCustomDream(
        user.uid,
        dreamTitle.trim(),
        validMilestones,
        cardColor,
      );

      // Refresh dreams list immediately (no loading card needed)
      await refreshDreamsFromCrud(user.uid);

      // Close modal
      handleClose();

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error("[DIYDreamModal] Failed to create custom dream:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to create dream. Please try again.",
      );
      setCreating(false);
    }
  };

  const handleClose = () => {
    setDreamTitle("");
    setCardColor(CARD_COLORS[0].value);
    setMilestones([
      { id: "1", title: "", description: "", challengeType: "power_move" },
    ]);
    setExpandedMilestone("1");
    setCreating(false);
    onClose();
  };

  const canCreate = dreamTitle.trim() && milestones.some((m) => m.title.trim());

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: themeColors.bg_primary,
              paddingTop: Math.max(insets.top + 16, 16),
              paddingBottom: Math.max(insets.bottom + 16, 16),
            },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={themeColors.text_primary} />
            </TouchableOpacity>
            <Text
              style={[styles.headerTitle, { color: themeColors.text_primary }]}>
              Create Your Dream
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}>
            {/* Dream Title Input */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: themeColors.text_primary },
                ]}>
                Dream Title
              </Text>
              <TextInput
                style={[
                  styles.dreamTitleInput,
                  {
                    backgroundColor: themeColors.bg_secondary,
                    borderColor: themeColors.border,
                    color: themeColors.text_primary,
                  },
                ]}
                placeholder="What do you want to achieve?"
                placeholderTextColor={themeColors.text_secondary}
                value={dreamTitle}
                onChangeText={setDreamTitle}
                editable={!creating}
                maxLength={100}
              />
            </View>

            {/* Card Color Picker */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: themeColors.text_primary },
                ]}>
                Card Color
              </Text>
              <View style={styles.colorGrid}>
                {CARD_COLORS.map((color) => {
                  const isSelected = cardColor === color.value;
                  return (
                    <TouchableOpacity
                      key={color.value}
                      onPress={() => {
                        setCardColor(color.value);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      disabled={creating}
                      activeOpacity={0.7}
                      style={[
                        styles.colorButton,
                        {
                          backgroundColor: isDark ? color.value : color.lightBg,
                          borderColor: isSelected
                            ? color.value
                            : themeColors.border,
                          borderWidth: isSelected ? 3 : 1,
                        },
                      ]}>
                      {isSelected && (
                        <View
                          style={[
                            styles.colorCheckmark,
                            {
                              backgroundColor: isDark ? "#fff" : color.value,
                            },
                          ]}>
                          <Text style={styles.checkmarkIcon}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Milestones Section */}
            <View style={styles.section}>
              <View style={styles.milestonesHeader}>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: themeColors.text_primary },
                  ]}>
                  Milestones ({milestones.length})
                </Text>
                <TouchableOpacity
                  onPress={handleAddMilestone}
                  disabled={creating}
                  activeOpacity={0.7}
                  style={[
                    styles.addMilestoneButton,
                    { opacity: creating ? 0.5 : 1 },
                  ]}>
                  <Plus size={18} color="#fb6322" strokeWidth={2.5} />
                  <Text style={styles.addMilestoneText}>Add</Text>
                </TouchableOpacity>
              </View>

              {milestones.map((milestone, index) => {
                const isExpanded = expandedMilestone === milestone.id;
                const hasTitle = milestone.title.trim();

                return (
                  <View
                    key={milestone.id}
                    style={[
                      styles.milestoneCard,
                      {
                        backgroundColor: themeColors.bg_secondary,
                        borderColor: themeColors.border,
                      },
                    ]}>
                    {/* Milestone Header (Always Visible) */}
                    <TouchableOpacity
                      onPress={() => handleToggleExpand(milestone.id)}
                      activeOpacity={0.7}
                      disabled={creating}
                      style={styles.milestoneHeader}>
                      <View style={styles.milestoneHeaderLeft}>
                        <View
                          style={[
                            styles.milestoneNumber,
                            {
                              backgroundColor: isDark
                                ? "rgba(168, 85, 247, 0.2)"
                                : "rgba(168, 85, 247, 0.15)",
                            },
                          ]}>
                          <Text style={styles.milestoneNumberText}>
                            {index + 1}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.milestoneHeaderTitle,
                            { color: themeColors.text_primary },
                          ]}
                          numberOfLines={1}>
                          {hasTitle ? milestone.title : "Untitled Milestone"}
                        </Text>
                      </View>
                      <View style={styles.milestoneHeaderRight}>
                        {hasTitle && (
                          <CheckCircle2
                            size={18}
                            color="#00D4AA"
                            strokeWidth={2}
                          />
                        )}
                        <TouchableOpacity
                          onPress={() => handleRemoveMilestone(milestone.id)}
                          disabled={creating}
                          style={styles.deleteButton}>
                          <Trash2 size={18} color="#EF4444" strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>

                    {/* Milestone Details (Expandable) */}
                    {isExpanded && (
                      <View style={styles.milestoneDetails}>
                        {/* Title Input */}
                        <View style={styles.inputGroup}>
                          <Text
                            style={[
                              styles.inputLabel,
                              { color: themeColors.text_secondary },
                            ]}>
                            Title *
                          </Text>
                          <TextInput
                            style={[
                              styles.milestoneInput,
                              {
                                backgroundColor: themeColors.bg_primary,
                                borderColor: themeColors.border,
                                color: themeColors.text_primary,
                              },
                            ]}
                            placeholder="e.g., Complete first draft"
                            placeholderTextColor={themeColors.text_secondary}
                            value={milestone.title}
                            onChangeText={(text) =>
                              handleUpdateMilestone(milestone.id, "title", text)
                            }
                            editable={!creating}
                            maxLength={100}
                          />
                        </View>

                        {/* Description Input */}
                        <View style={styles.inputGroup}>
                          <Text
                            style={[
                              styles.inputLabel,
                              { color: themeColors.text_secondary },
                            ]}>
                            Description (Optional)
                          </Text>
                          <TextInput
                            style={[
                              styles.milestoneInput,
                              styles.descriptionInput,
                              {
                                backgroundColor: themeColors.bg_primary,
                                borderColor: themeColors.border,
                                color: themeColors.text_primary,
                              },
                            ]}
                            placeholder="Add more details..."
                            placeholderTextColor={themeColors.text_secondary}
                            value={milestone.description}
                            onChangeText={(text) =>
                              handleUpdateMilestone(
                                milestone.id,
                                "description",
                                text,
                              )
                            }
                            editable={!creating}
                            maxLength={300}
                            multiline
                            numberOfLines={3}
                          />
                        </View>

                        {/* Challenge Type Selector */}
                        <View style={styles.inputGroup}>
                          <Text
                            style={[
                              styles.inputLabel,
                              { color: themeColors.text_secondary },
                            ]}>
                            Challenge Type
                          </Text>
                          <View style={styles.challengeTypeGrid}>
                            {CHALLENGE_TYPES.map((type) => {
                              const isSelected =
                                milestone.challengeType === type.value;
                              const typeColor = ChallengeTypeColors[type.value];
                              return (
                                <TouchableOpacity
                                  key={type.value}
                                  onPress={() =>
                                    handleUpdateMilestone(
                                      milestone.id,
                                      "challengeType",
                                      type.value,
                                    )
                                  }
                                  disabled={creating}
                                  activeOpacity={0.7}
                                  style={[
                                    styles.challengeTypeButton,
                                    {
                                      backgroundColor: isSelected
                                        ? `${typeColor}20`
                                        : isDark
                                          ? "rgba(255, 255, 255, 0.08)"
                                          : "rgba(0, 0, 0, 0.03)",
                                      borderColor: isSelected
                                        ? typeColor
                                        : isDark
                                          ? "rgba(255, 255, 255, 0.15)"
                                          : "rgba(0, 0, 0, 0.1)",
                                    },
                                  ]}>
                                  <Image
                                    source={isDark ? type.gif : type.gifDark}
                                    style={[
                                      styles.challengeTypeGif,
                                      { opacity: isSelected ? 1 : 0.6 },
                                    ]}
                                    resizeMode="contain"
                                  />
                                  <Text
                                    style={[
                                      styles.challengeTypeLabel,
                                      {
                                        color: isSelected
                                          ? typeColor
                                          : themeColors.text_secondary,
                                      },
                                    ]}>
                                    {type.label}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Create Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleCreate}
              disabled={!canCreate || creating}
              activeOpacity={0.8}
              style={[
                styles.createButtonWrapper,
                { opacity: !canCreate || creating ? 0.5 : 1 },
              ]}>
              <LinearGradient
                colors={["#fb6322", "#f79971"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createButton}>
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create Dream</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    marginTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 20,
  },
  closeButton: {
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
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "InstrumentSans-SemiBold",
    marginBottom: 12,
  },
  dreamTitleInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "InstrumentSans-Regular",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  colorCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkIcon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  milestonesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addMilestoneButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(251, 99, 34, 0.1)",
  },
  addMilestoneText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fb6322",
    fontFamily: "InstrumentSans-SemiBold",
  },
  milestoneCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  milestoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  milestoneHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  milestoneNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#A855F7",
    fontFamily: "InstrumentSans-Bold",
  },
  milestoneHeaderTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "InstrumentSans-SemiBold",
    flex: 1,
  },
  milestoneHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  milestoneDetails: {
    padding: 14,
    paddingTop: 0,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "InstrumentSans-Medium",
  },
  milestoneInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "InstrumentSans-Regular",
  },
  descriptionInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  challengeTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  challengeTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: "30%",
    flexGrow: 1,
  },
  challengeTypeGif: {
    width: 20,
    height: 20,
  },
  challengeTypeLabel: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "InstrumentSans-SemiBold",
  },
  footer: {
    paddingTop: 16,
  },
  createButtonWrapper: {
    borderRadius: 14,
    overflow: "hidden",
  },
  createButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "InstrumentSans-Bold",
  },
});
