import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { JourneyRecap } from "../../types/community";
import { CATEGORY_COLORS } from "../../constants/communityColors";
import { CategoryBadge } from "./CategoryBadge";
import { CourageBoostButton } from "./CourageBoostButton";
import { MeTooButton } from "./MeTooButton";
import { formatDate } from "../../utils/communityUtils";

interface JourneyRecapCardProps {
  journeyRecap: JourneyRecap;
  onBoost?: (journeyId: string) => void;
  onMeToo?: (journeyId: string) => void;
  onPermission?: (journeyId: string) => void;
  onViewPermissions?: (journeyId: string) => void;
  onPress?: () => void;
}

export const JourneyRecapCard: React.FC<JourneyRecapCardProps> = ({
  journeyRecap,
  onBoost,
  onMeToo,
  onPermission,
  onViewPermissions,
  onPress,
}) => {
  const categoryColor = CATEGORY_COLORS[journeyRecap.dreamCategory];

  const userInfo = journeyRecap.isAnonymous
    ? "Someone"
    : `${journeyRecap.userDisplayName}${journeyRecap.userAge ? ", " + journeyRecap.userAge : ""}${journeyRecap.userLocation ? ", " + journeyRecap.userLocation : ""}`;

  const formattedDate = formatDate(journeyRecap.createdAt);

  return (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={onPress}
      activeOpacity={0.85}>
      {/* Colored accent strip — gradient fade for journey cards */}
      <LinearGradient
        colors={[categoryColor, categoryColor + "00"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentStrip}
      />

      {/* Frosted glass body */}
      <BlurView intensity={40} tint="dark" style={styles.glassBody}>
        {/* Top row: star badge + category tag */}
        <View style={styles.topRow}>
          <View style={[styles.journeyBadge, { borderColor: categoryColor + "66" }]}>
            <Text style={[styles.star, { color: categoryColor }]}>⭐</Text>
            <Text style={styles.journeyLabel}>JOURNEY COMPLETE</Text>
          </View>
          <CategoryBadge category={journeyRecap.dreamCategory} size="small" />
        </View>

        {/* Dream title */}
        <Text style={styles.dreamTitle}>
          {(journeyRecap.dreamTitle || "DREAM").toUpperCase()}
        </Text>

        {/* Stats row — milestones + days in glass pills */}
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{journeyRecap.totalMilestones}</Text>
            <Text style={styles.statLabel}>Milestones</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statPill}>
            <Text style={styles.statValue}>
              {journeyRecap.durationDays === 0 ? "<1" : journeyRecap.durationDays}
            </Text>
            <Text style={styles.statLabel}>
              {journeyRecap.durationDays === 1 ? "Day" : "Days"}
            </Text>
          </View>
        </View>

        {/* Journey story quote */}
        <Text style={styles.storyText}>"{journeyRecap.journeyStory}"</Text>

        {/* Key moment highlight */}
        {journeyRecap.keyMoment && (
          <View style={[styles.keyMomentSection, { borderLeftColor: categoryColor }]}>
            <Text style={styles.keyMomentLabel}>Most memorable moment</Text>
            <Text style={styles.keyMomentText}>"{journeyRecap.keyMoment}"</Text>
          </View>
        )}

        {/* Meta: date + author */}
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.userInfo}>{userInfo}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Action footer */}
        <View style={styles.actionRow}>
          {onBoost && (
            <CourageBoostButton
              boostCount={journeyRecap.courageBoosts}
              hasUserBoosted={journeyRecap.hasUserBoosted}
              onPress={() => onBoost(journeyRecap.id)}
              size="medium"
            />
          )}

          {onMeToo && (
            <MeTooButton
              meTooCount={journeyRecap.meTooCount}
              hasUserMeTooed={journeyRecap.hasUserMeTooed}
              onPress={() => onMeToo(journeyRecap.id)}
              size="medium"
            />
          )}

          {onPermission && (
            <TouchableOpacity
              style={styles.ghostButton}
              onPress={() => onPermission(journeyRecap.id)}
              activeOpacity={0.6}>
              <Text style={styles.ghostIcon}>💬</Text>
              <Text style={styles.ghostText}>Permission</Text>
            </TouchableOpacity>
          )}

          {journeyRecap.permissionsCount > 0 && onViewPermissions && (
            <TouchableOpacity
              style={[styles.ghostButton, styles.ghostButtonAccent]}
              onPress={() => onViewPermissions(journeyRecap.id)}
              activeOpacity={0.6}>
              <Text style={styles.ghostIcon}>💬</Text>
              <Text style={[styles.ghostText, { color: categoryColor }]}>
                {journeyRecap.permissionsCount}{" "}
                {journeyRecap.permissionsCount === 1 ? "Permission" : "Permissions"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "rgba(255, 255, 255, 0.08)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  accentStrip: {
    height: 3,
  },
  glassBody: {
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    padding: 18,
    gap: 10,
  },
  // Top row
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  journeyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  star: {
    fontSize: 16,
  },
  journeyLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "rgba(255, 255, 255, 0.85)",
  },
  // Title
  dreamTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.4,
    lineHeight: 25,
    marginTop: 2,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 12,
    paddingVertical: 10,
    marginVertical: 2,
  },
  statPill: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.45)",
    marginTop: 2,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  // Story
  storyText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 20,
  },
  // Key moment
  keyMomentSection: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  keyMomentLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  keyMomentText: {
    fontSize: 13,
    fontStyle: "italic",
    color: "rgba(255, 255, 255, 0.65)",
    lineHeight: 18,
  },
  // Meta
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.4)",
  },
  metaDot: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.3)",
  },
  userInfo: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.45)",
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 2,
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
