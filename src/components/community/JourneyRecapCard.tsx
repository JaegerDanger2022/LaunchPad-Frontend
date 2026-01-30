import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { JourneyRecap } from "../../types/community";
import {
  CATEGORY_COLORS,
  CATEGORY_COLORS_LIGHT,
} from "../../constants/communityColors";
import { CategoryBadge } from "./CategoryBadge";
import { CourageBoostButton } from "./CourageBoostButton";
import { MeTooButton } from "./MeTooButton";
import { formatDate } from "../../utils/communityUtils";

interface JourneyRecapCardProps {
  journeyRecap: JourneyRecap;
  onBoost: (journeyId: string) => void;
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
  const categoryBackgroundColor =
    CATEGORY_COLORS_LIGHT[journeyRecap.dreamCategory];

  const userInfo = journeyRecap.isAnonymous
    ? "Someone"
    : `${journeyRecap.userDisplayName}${journeyRecap.userAge ? ", " + journeyRecap.userAge : ""}${journeyRecap.userLocation ? ", " + journeyRecap.userLocation : ""}`;

  const formattedDate = formatDate(journeyRecap.completedDate);

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: categoryColor }]}
      onPress={onPress}
      activeOpacity={0.9}>
      {/* Header with star and category */}
      <View
        style={[
          styles.cardHeader,
          { backgroundColor: categoryBackgroundColor },
        ]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.star, { color: categoryColor }]}>⭐</Text>
          <Text style={styles.headerTitle}>JOURNEY COMPLETE</Text>
        </View>
        <CategoryBadge category={journeyRecap.dreamCategory} size="small" />
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Dream Title */}
        <Text style={styles.dreamTitle}>
          {(journeyRecap.dreamTitle || "DREAM").toUpperCase()}
        </Text>

        {/* Journey Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{journeyRecap.totalMilestones}</Text>
            <Text style={styles.statLabel}>Milestones</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {journeyRecap.durationDays === 0 ? '<1' : journeyRecap.durationDays}
            </Text>
            <Text style={styles.statLabel}>
              {journeyRecap.durationDays === 1 ? 'Day' : 'Days'}
            </Text>
          </View>
        </View>

        {/* Journey Story */}
        <View style={styles.storySection}>
          <Text style={styles.storyText}>"{journeyRecap.journeyStory}"</Text>
        </View>

        {/* Key Moment (if provided) */}
        {journeyRecap.keyMoment && (
          <View style={styles.keyMomentSection}>
            <Text style={styles.keyMomentLabel}>Most memorable moment:</Text>
            <Text style={styles.keyMomentText}>"{journeyRecap.keyMoment}"</Text>
          </View>
        )}

        {/* Date and User */}
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <Text style={styles.userInfo}>— {userInfo}</Text>
      </View>

      {/* Footer with Interactions */}
      <View style={styles.cardFooter}>
        <CourageBoostButton
          boostCount={journeyRecap.courageBoosts}
          hasUserBoosted={journeyRecap.hasUserBoosted}
          onPress={() => onBoost(journeyRecap.id)}
          size="medium"
        />

        {/* Me Too Button */}
        {onMeToo && (
          <MeTooButton
            meTooCount={journeyRecap.meTooCount}
            hasUserMeTooed={journeyRecap.hasUserMeTooed}
            onPress={() => onMeToo(journeyRecap.id)}
            size="medium"
          />
        )}

        {/* Permission Button */}
        {onPermission && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => onPermission(journeyRecap.id)}
            activeOpacity={0.7}>
            <Text style={styles.permissionIcon}>💬</Text>
            <Text style={styles.permissionText}>Give Permission</Text>
          </TouchableOpacity>
        )}

        {/* View Permissions */}
        {journeyRecap.permissionsCount > 0 && onViewPermissions && (
          <TouchableOpacity
            style={styles.viewPermissionsButton}
            onPress={() => onViewPermissions(journeyRecap.id)}
            activeOpacity={0.7}>
            <Text style={styles.permissionIcon}>💬</Text>
            <Text style={styles.viewPermissionsText}>
              {journeyRecap.permissionsCount}{" "}
              {journeyRecap.permissionsCount === 1
                ? "Permission"
                : "Permissions"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  star: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#111827",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
  },
  dreamTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    letterSpacing: 0.6,
    lineHeight: 26,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  storySection: {
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  storyText: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#374151",
    lineHeight: 22,
  },
  keyMomentSection: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  keyMomentLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  keyMomentText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#78350F",
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  userInfo: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  permissionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  permissionIcon: {
    fontSize: 16,
  },
  permissionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  viewPermissionsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F0F5FF",
  },
  viewPermissionsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D5BFF",
  },
});
