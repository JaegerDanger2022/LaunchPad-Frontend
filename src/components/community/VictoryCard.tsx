import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Bookmark } from "lucide-react-native";
import { VictoryCard as VictoryCardType } from "../../types/community";
import { CATEGORY_COLORS } from "../../constants/communityColors";
import { ChallengeTypeColors } from "../../constants/GlobalStyles";
import { CategoryBadge } from "./CategoryBadge";
import { CourageBoostButton } from "./CourageBoostButton";
import { ResonanceIndicator } from "./ResonanceIndicator";
import { formatDate, getConfidenceText } from "../../utils/communityUtils";

interface VictoryCardProps {
  victory: VictoryCardType;
  onBoost?: (victoryId: string) => void;
  onMeToo?: (victoryId: string) => void;
  onPin?: (victoryId: string) => void;
  isPinned?: boolean;
  onPermission?: (victoryId: string) => void;
  onViewPermissions?: (victoryId: string) => void;
  onPress?: () => void;
}

export const VictoryCard: React.FC<VictoryCardProps> = ({
  victory,
  onBoost,
  onMeToo,
  onPin,
  isPinned = false,
  onPermission,
  onViewPermissions,
  onPress,
}) => {
  // Use challenge type color if available, fallback to green
  const categoryColor = victory.challengeType && ChallengeTypeColors[victory.challengeType as keyof typeof ChallengeTypeColors]
    ? ChallengeTypeColors[victory.challengeType as keyof typeof ChallengeTypeColors]
    : '#10B981';

  // Format challenge type for display (e.g., "power_move" -> "Power Move")
  const formatChallengeType = (type?: string) => {
    if (!type) return null;
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const userInfo = victory.isAnonymous
    ? `Someone${victory.prefTimezone ? " in " + victory.prefTimezone : ""}`
    : `${victory.userDisplayName}${victory.userAge ? ", " + victory.userAge : ""}${victory.userLocation ? ", " + victory.userLocation : ""}`;

  const formattedDate = formatDate(victory.createdAt);
  const confidenceText = getConfidenceText(victory.confidenceBoost);
  const challengeTypeLabel = formatChallengeType(victory.challengeType);

  return (
    <View style={styles.cardWrapper}>
      {/* Colored accent strip at the very top */}
      <LinearGradient
        colors={[categoryColor, categoryColor + "00"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentStrip}
      />

      {/* Frosted glass body */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{ overflow: 'hidden', borderRadius: 20 }}>
        <BlurView intensity={80} tint="dark" style={styles.glassBody}>
        {/* Top row: checkmark badge + category tag + pin */}
        <View style={styles.topRow}>
          <View style={[styles.victoryBadge, { borderColor: categoryColor + "66" }]}>
            <Text style={[styles.checkmark, { color: categoryColor }]}>✓</Text>
            <Text style={styles.victoryLabel}>MILESTONE</Text>
          </View>
          <View style={styles.topRowRight}>
            {challengeTypeLabel && (
              <View style={[styles.challengeTypeBadge, { backgroundColor: categoryColor + "33", borderColor: categoryColor + "66" }]}>
                <Text style={[styles.challengeTypeText, { color: categoryColor }]}>
                  {challengeTypeLabel}
                </Text>
              </View>
            )}
            {onPin && (
              <TouchableOpacity
                style={[styles.pinButton, isPinned && styles.pinButtonActive]}
                onPress={() => onPin(victory.id)}
                activeOpacity={0.6}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Bookmark
                  size={16}
                  color={isPinned ? "#FBF124" : "rgba(255, 255, 255, 0.5)"}
                  fill={isPinned ? "#FBF124" : "none"}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Milestone title */}
        <Text style={styles.milestoneTitle}>
          {(victory.milestoneTitle || "MILESTONE").toUpperCase()}
        </Text>

        {/* Evidence quote - only show if provided */}
        {victory.evidenceSnippet && (
          <Text style={styles.evidenceText}>"{victory.evidenceSnippet}"</Text>
        )}

        {/* Meta row: confidence + date + author */}
        <View style={styles.metaRow}>
          <Text style={[styles.confidenceStat, { color: categoryColor }]}>
            +{victory.confidenceBoost}% {confidenceText}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <Text style={styles.userInfo}>— {userInfo}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Action footer */}
        <View style={styles.actionRow}>
          <ResonanceIndicator
            meTooCount={victory.meTooCount}
            hasUserMeTooed={victory.hasUserMeTooed}
            onPress={onMeToo ? () => onMeToo(victory.id) : undefined}
            size="medium"
            disabled={!onMeToo}
          />

          {onPermission && (
            <TouchableOpacity
              style={styles.ghostButton}
              onPress={() => onPermission(victory.id)}
              activeOpacity={0.6}>
              <Text style={styles.ghostIcon}>💬</Text>
              <Text style={styles.ghostText}>Permission</Text>
            </TouchableOpacity>
          )}

          {victory.permissionsCount > 0 && (
            <TouchableOpacity
              style={[styles.ghostButton, styles.ghostButtonAccent]}
              onPress={() => onViewPermissions?.(victory.id)}
              activeOpacity={0.6}>
              <Text style={styles.ghostIcon}>💬</Text>
              <Text style={[styles.ghostText, { color: categoryColor }]}>
                {victory.permissionsCount}{" "}
                {victory.permissionsCount === 1 ? "Permission" : "Permissions"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    backgroundColor: "rgba(30, 41, 59, 0.4)", // Semi-transparent dark background for blur effect
    // Subtle outer glow via shadow
    shadowColor: "rgba(255, 255, 255, 0.12)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  accentStrip: {
    height: 3,
  },
  glassBody: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 18,
    gap: 10,
  },
  // Top row
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  victoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "bold",
  },
  victoryLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "rgba(255, 255, 255, 0.85)",
  },
  topRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  challengeTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  pinButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  pinButtonActive: {
    backgroundColor: "rgba(251, 241, 36, 0.12)",
    borderColor: "rgba(251, 241, 36, 0.3)",
  },
  challengeTypeText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  // Title
  milestoneTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.4,
    marginTop: 4,
  },
  // Evidence
  evidenceText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 20,
  },
  // Meta
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  confidenceStat: {
    fontSize: 12,
    fontWeight: "600",
  },
  metaDot: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.3)",
  },
  dateText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.4)",
  },
  userInfo: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.45)",
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 4,
  },
  // Actions
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  ghostButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  ghostButtonAccent: {
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  ghostIcon: {
    fontSize: 14,
  },
  ghostText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
  },
});
