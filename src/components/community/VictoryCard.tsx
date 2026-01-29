import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { VictoryCard as VictoryCardType } from '../../types/community';
import { CATEGORY_COLORS, CATEGORY_COLORS_LIGHT } from '../../constants/communityColors';
import { CategoryBadge } from './CategoryBadge';
import { CourageBoostButton } from './CourageBoostButton';
import { formatDate, getConfidenceText } from '../../utils/communityUtils';

interface VictoryCardProps {
  victory: VictoryCardType;
  onBoost: (victoryId: string) => void;
  onPermission?: (victoryId: string) => void;
  onViewPermissions?: (victoryId: string) => void;
  onPress?: () => void;
}

export const VictoryCard: React.FC<VictoryCardProps> = ({
  victory,
  onBoost,
  onPermission,
  onViewPermissions,
  onPress,
}) => {
  const categoryColor = CATEGORY_COLORS[victory.dreamCategory];
  const categoryBackgroundColor = CATEGORY_COLORS_LIGHT[victory.dreamCategory];

  const userInfo = victory.isAnonymous
    ? 'A woman'
    : `${victory.userDisplayName}${victory.userAge ? ', ' + victory.userAge : ''}${victory.userLocation ? ', ' + victory.userLocation : ''}`;

  const formattedDate = formatDate(victory.completedDate);
  const confidenceText = getConfidenceText(victory.confidenceBoost);

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: categoryColor }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Header with checkmark and category icon */}
      <View
        style={[
          styles.cardHeader,
          { backgroundColor: categoryBackgroundColor },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.checkmark, { color: categoryColor }]}>✓</Text>
          <Text style={styles.headerTitle}>VICTORY</Text>
        </View>
        <CategoryBadge category={victory.dreamCategory} size="small" />
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Milestone Title */}
        <Text style={styles.milestoneTitle}>
          {(victory.milestoneTitle || 'MILESTONE').toUpperCase()}
        </Text>

        {/* Dream and Category Info */}
        <View style={styles.dreamSection}>
          <Text style={styles.dreamLabel}>Part of: {victory.dreamTitle}</Text>
        </View>

        {/* Evidence Snippet */}
        <View style={styles.evidenceSection}>
          <Text style={styles.evidenceText}>"{victory.evidenceSnippet}"</Text>
        </View>

        {/* Confidence Boost and Date */}
        <View style={styles.statsRow}>
          <Text style={[styles.confidenceStat, { color: categoryColor }]}>
            +{victory.confidenceBoost}% {confidenceText}
          </Text>
          <Text style={styles.dateText}>
            {formattedDate}
          </Text>
        </View>

        {/* User Info */}
        <Text style={styles.userInfo}>— {userInfo}</Text>
      </View>

      {/* Footer with Interactions */}
      <View style={styles.cardFooter}>
        <CourageBoostButton
          boostCount={victory.courageBoosts}
          hasUserBoosted={victory.hasUserBoosted}
          onPress={() => onBoost(victory.id)}
          size="medium"
        />

        {/* Permission Button */}
        {onPermission && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => onPermission(victory.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.permissionIcon}>💬</Text>
            <Text style={styles.permissionText}>Give Permission</Text>
          </TouchableOpacity>
        )}

        {/* View Permissions */}
        {victory.permissionsCount > 0 && onViewPermissions && (
          <TouchableOpacity
            style={styles.viewPermissionsButton}
            onPress={() => onViewPermissions(victory.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.permissionIcon}>💬</Text>
            <Text style={styles.viewPermissionsText}>
              {victory.permissionsCount} {victory.permissionsCount === 1 ? 'Permission' : 'Permissions'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkmark: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#111827',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 0.5,
  },
  dreamSection: {
    marginTop: 4,
  },
  dreamLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  evidenceSection: {
    marginVertical: 8,
    paddingHorizontal: 0,
  },
  evidenceText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#374151',
    lineHeight: 20,
  },
  statsRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceStat: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  userInfo: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  permissionIcon: {
    fontSize: 16,
  },
  permissionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  viewPermissionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F5FF',
  },
  viewPermissionsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D5BFF',
  },
});
