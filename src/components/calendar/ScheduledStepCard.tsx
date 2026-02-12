import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { getThemeColors, Color } from '../../constants/GlobalStyles';
import { ScheduledStep } from '../../config/api';

interface ScheduledStepCardProps {
  step: ScheduledStep;
  onToggleComplete: (stepId: string, completed: boolean) => void;
}

export const ScheduledStepCard: React.FC<ScheduledStepCardProps> = ({
  step,
  onToggleComplete
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: step.dream_color + '15',
        borderLeftColor: step.dream_color,
        opacity: step.completed ? 0.6 : 1
      }
    ]}>
      <TouchableOpacity
        style={styles.contentWrapper}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        {/* Dream context */}
        <View style={styles.header}>
          <Text style={[styles.dreamTitle, { color: step.dream_color }]} numberOfLines={1}>
            {step.dream_title}
          </Text>
          <Text style={[styles.time, { color: Color.colorBlack, opacity: 0.6 }]}>
            {step.time_estimate_minutes} min
          </Text>
        </View>

        {/* Task description */}
        <Text
          style={[
            styles.description,
            { color: Color.colorBlack },
            step.completed && styles.completedText
          ]}
          numberOfLines={expanded ? undefined : 2}
        >
          {step.step_description}
        </Text>
      </TouchableOpacity>

      {/* Checkbox */}
      <TouchableOpacity
        onPress={() => onToggleComplete(step._id, !step.completed)}
        style={styles.checkbox}
      >
        {step.completed ? (
          <CheckCircle size={28} color="#10B981" fill="#10B981" />
        ) : (
          <Circle size={28} color={Color.colorBlack} opacity={0.3} strokeWidth={2} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dreamTitle: {
    fontSize: 12,
    fontFamily: 'InstrumentSans-Bold',
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 11,
    fontFamily: 'InstrumentSans-SemiBold',
    flexShrink: 0,
  },
  description: {
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  checkbox: {
    flexShrink: 0,
    paddingTop: 2,
  }
});
