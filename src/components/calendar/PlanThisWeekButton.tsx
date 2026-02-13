import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Modal, View, ActivityIndicator } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { Color } from '../../constants/GlobalStyles';
import { planMilestone, markMilestoneWeekPlanned } from '../../config/api';
import Toast from 'react-native-toast-message';
import { SafeBlurView } from '../SafeBlurView';

interface PlanThisWeekButtonProps {
  milestoneId: string;
  threadId: string;
  weekPlanned?: boolean;
  onScheduleCreated?: () => void;
}

export const PlanThisWeekButton: React.FC<PlanThisWeekButtonProps> = ({
  milestoneId,
  threadId,
  weekPlanned = false,
  onScheduleCreated
}) => {
  const { user } = useAuthStore();

  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [loading, setLoading] = useState(false);

  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleConfirm = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const weekStart = getTodayDate();
      console.log('[PlanThisWeekButton] Planning milestone with params:', {
        userId: user.uid,
        milestoneId,
        threadId,
        daysPerWeek,
        weekStart
      });
      await planMilestone(user.uid, milestoneId, threadId, daysPerWeek, weekStart);

      // Mark milestone as having its week planned
      await markMilestoneWeekPlanned(user.uid, threadId, milestoneId);

      // Close modal immediately after successful creation
      setShowPlanningModal(false);

      Toast.show({
        type: 'success',
        text1: 'Week Planned! 📅',
        text2: `Scheduled across ${daysPerWeek} days`
      });

      onScheduleCreated?.();
    } catch (error: any) {
      console.error('Failed to plan milestone:', error);
      Toast.show({
        type: 'error',
        text1: 'Scheduling Failed',
        text2: error.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: weekPlanned ? '#CCCCCC' : Color.colorOrangered }
        ]}
        onPress={() => !weekPlanned && setShowPlanningModal(true)}
        activeOpacity={weekPlanned ? 1 : 0.8}
        disabled={weekPlanned}
      >
        <Calendar size={20} color="#FFF" />
        <Text style={styles.buttonText}>
          {weekPlanned ? 'Week Already Planned' : 'Plan This Week'}
        </Text>
      </TouchableOpacity>

      {/* Planning Modal */}
      <Modal
        visible={showPlanningModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPlanningModal(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeBlurView
            intensity={20}
            tint="light"
            style={styles.modalBlur}
          >
            <View style={[styles.modalContainer, { backgroundColor: '#FFFFFF' }]}>
              <Text style={[styles.modalTitle, { color: Color.colorBlack }]}>
                Plan Your Week
              </Text>
              <Text style={[styles.modalSubtitle, { color: 'rgba(0, 0, 0, 0.7)' }]}>
                How many days per week can you work on this?
              </Text>

              {/* Days selector */}
              <View style={styles.daysSelector}>
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.dayButton,
                      daysPerWeek === num && { backgroundColor: Color.colorOrangered }
                    ]}
                    onPress={() => setDaysPerWeek(num)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      { color: daysPerWeek === num ? '#FFF' : Color.colorBlack }
                    ]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: 'rgba(0, 0, 0, 0.2)' }]}
                  onPress={() => setShowPlanningModal(false)}
                  disabled={loading}
                >
                  <Text style={[styles.cancelButtonText, { color: Color.colorBlack }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: Color.colorOrangered }]}
                  onPress={handleConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Create Schedule</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </SafeBlurView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'InstrumentSans-SemiBold',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 0, 0.3)',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'InstrumentSans-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    fontFamily: 'InstrumentSans-Regular',
    marginBottom: 24,
  },
  daysSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  dayButtonText: {
    fontSize: 16,
    fontFamily: 'InstrumentSans-SemiBold',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'InstrumentSans-SemiBold',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'InstrumentSans-SemiBold',
    fontWeight: '600',
  }
});
