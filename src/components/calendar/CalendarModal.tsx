import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScheduledStepCard } from './ScheduledStepCard';
import { useAuthStore } from '../../store/authStore';
import { Color } from '../../constants/GlobalStyles';
import { fetchWeeklySchedule, updateScheduledStep, WeeklySchedule } from '../../config/api';
import Toast from 'react-native-toast-message';

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ visible, onClose }) => {
  const { user } = useAuthStore();

  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Calculate current Monday
  const getCurrentMonday = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday (0)
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    return monday.toISOString().split('T')[0];
  };

  // Initialize to current week
  useEffect(() => {
    if (visible && !currentWeekStart) {
      setCurrentWeekStart(getCurrentMonday());
    }
  }, [visible]);

  // Fetch schedule when week changes
  useEffect(() => {
    if (visible && user?.uid && currentWeekStart) {
      loadSchedule();
    }
  }, [visible, currentWeekStart, user?.uid]);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const schedule = await fetchWeeklySchedule(user!.uid, currentWeekStart);
      setWeeklySchedule(schedule);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load schedule'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (stepId: string, completed: boolean) => {
    console.log('[CalendarModal] Toggle complete:', { stepId, completed });

    if (!completed) {
      console.log('[CalendarModal] Unchecking task - not supported');
      return;
    }

    try {
      // First, call the API to delete the task
      console.log('[CalendarModal] Calling API to delete step');
      await updateScheduledStep(stepId, true);
      console.log('[CalendarModal] API call successful - task deleted from database');

      // Then update local state to remove it from UI
      console.log('[CalendarModal] Removing task from calendar UI');
      setWeeklySchedule(prev => {
        if (!prev) {
          console.log('[CalendarModal] No previous schedule');
          return prev;
        }

        // Create a completely new object to force React re-render
        const newDays = prev.days.map(day => {
          const filteredTasks = day.tasks.filter(task => task._id !== stepId);
          console.log(`[CalendarModal] Day ${day.day_of_week}: ${day.tasks.length} -> ${filteredTasks.length} tasks`);

          // Return a new day object with new tasks array
          return {
            date: day.date,
            day_of_week: day.day_of_week,
            tasks: [...filteredTasks] // Create new array
          };
        });

        const newSchedule: WeeklySchedule = {
          week_start_date: prev.week_start_date,
          week_end_date: prev.week_end_date,
          days: newDays
        };

        console.log('[CalendarModal] New schedule created with', newDays.reduce((sum, d) => sum + d.tasks.length, 0), 'total tasks');
        return newSchedule;
      });

      Toast.show({
        type: 'success',
        text1: '✅ Task completed!'
      });
    } catch (error) {
      console.error('[CalendarModal] Failed to delete task:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to complete task'
      });
      // Reload to get fresh data
      loadSchedule();
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(currentWeekStart);
    const offset = direction === 'prev' ? -7 : 7;
    const newDate = new Date(current);
    newDate.setDate(current.getDate() + offset);
    setCurrentWeekStart(newDate.toISOString().split('T')[0]);
  };

  const formatWeekRange = () => {
    if (!weeklySchedule) return '';
    const start = new Date(weeklySchedule.week_start_date);
    const end = new Date(weeklySchedule.week_end_date);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#FFFAF5', '#FFE8D6', '#FFD4B0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.blurView}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
              <Text style={[styles.title, { color: Color.colorBlack }]}>My Week</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={24} color={Color.colorBlack} />
              </TouchableOpacity>
            </View>

            {/* Week selector */}
            <View style={styles.weekSelector}>
              <TouchableOpacity onPress={() => navigateWeek('prev')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <ChevronLeft size={28} color={Color.colorBlack} />
              </TouchableOpacity>
              <Text style={[styles.weekRange, { color: Color.colorBlack }]}>
                {formatWeekRange()}
              </Text>
              <TouchableOpacity onPress={() => navigateWeek('next')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <ChevronRight size={28} color={Color.colorBlack} />
              </TouchableOpacity>
            </View>

            {/* Schedule content */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Color.colorOrangered} />
              </View>
            ) : (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {weeklySchedule?.days.map((day) => (
                  <View key={day.date} style={styles.daySection}>
                    <View style={styles.dayHeader}>
                      <Text style={[styles.dayName, { color: Color.colorBlack }]}>
                        {day.day_of_week}
                      </Text>
                      <Text style={[styles.dayDate, { color: 'rgba(0, 0, 0, 0.6)' }]}>
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>

                    {day.tasks.length > 0 ? (
                      day.tasks.map(task => (
                        <ScheduledStepCard
                          key={task._id}
                          step={task}
                          onToggleComplete={handleToggleComplete}
                        />
                      ))
                    ) : (
                      <View style={[styles.emptyDay, { backgroundColor: 'rgba(255, 255, 255, 0.5)' }]}>
                        <Text style={[styles.emptyText, { color: 'rgba(0, 0, 0, 0.5)' }]}>
                          No tasks scheduled
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'InstrumentSans-Bold',
    fontWeight: '700',
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  weekRange: {
    fontSize: 16,
    fontFamily: 'InstrumentSans-SemiBold',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  dayName: {
    fontSize: 18,
    fontFamily: 'InstrumentSans-Bold',
    fontWeight: '700',
  },
  dayDate: {
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
  },
  emptyDay: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
  }
});
