import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface HeroCardProps {
  badge: string;
  title: string;
  timeMinutes: number;
  xpPoints: number;
  onPress: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  badge,
  title,
  timeMinutes,
  xpPoints,
  onPress,
}) => {
  return (
    <View style={styles.card}>
      {/* Background Image Placeholder */}
      <View style={styles.imageContainer}>
        <Text style={styles.imagePlaceholder}>🎨</Text>
        <Badge
          text={badge}
          backgroundColor={Colors.white}
          textColor={Colors.primary}
          style={styles.badge}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <Text style={styles.metricIcon}>⏱️</Text>
            <Text style={styles.metricText}>{timeMinutes} min</Text>
          </View>
          <View style={[styles.metric, styles.xpMetric]}>
            <Text style={styles.xpText}>+ {xpPoints} XP</Text>
            <Text style={styles.xpIcon}>⚡</Text>
          </View>
        </View>

        {/* Button */}
        <Button
          title="LET'S GOOO!"
          onPress={onPress}
          icon="→"
          variant="primary"
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    height: 140,
    backgroundColor: Colors.cardBgLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imagePlaceholder: {
    fontSize: 60,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metricIcon: {
    fontSize: 14,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  xpMetric: {
    backgroundColor: Colors.successLight,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  xpIcon: {
    fontSize: 14,
  },
});
