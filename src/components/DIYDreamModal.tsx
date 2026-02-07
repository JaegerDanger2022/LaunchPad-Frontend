import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { getThemeColors } from '../constants/GlobalStyles';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { createCustomDream } from '../config/api';

interface DIYDreamModalProps {
  visible: boolean;
  onClose: () => void;
  onDreamCreating?: () => void;
}

interface CustomMilestone {
  id: string;
  title: string;
  description: string;
  challengeType: 'action' | 'research' | 'reflection';
}

const CHALLENGE_TYPES = [
  { value: 'action', label: 'Action', emoji: '⚡' },
  { value: 'research', label: 'Research', emoji: '📚' },
  { value: 'reflection', label: 'Reflection', emoji: '💭' },
] as const;

export const DIYDreamModal: React.FC<DIYDreamModalProps> = ({
  visible,
  onClose,
  onDreamCreating,
}) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const [dreamTitle, setDreamTitle] = useState('');
  const [milestones, setMilestones] = useState<CustomMilestone[]>([
    { id: '1', title: '', description: '', challengeType: 'action' },
  ]);
  const [creating, setCreating] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>('1');

  const handleAddMilestone = () => {
    const newId = Date.now().toString();
    setMilestones([
      ...milestones,
      { id: newId, title: '', description: '', challengeType: 'action' },
    ]);
    setExpandedMilestone(newId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRemoveMilestone = (id: string) => {
    if (milestones.length === 1) {
      Alert.alert('Cannot Remove', 'You need at least one milestone.');
      return;
    }
    setMilestones(milestones.filter((m) => m.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUpdateMilestone = (
    id: string,
    field: keyof CustomMilestone,
    value: string
  ) => {
    setMilestones(
      milestones.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const handleToggleExpand = (id: string) => {
    setExpandedMilestone(expandedMilestone === id ? null : id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCreate = async () => {
    // Validation
    if (!dreamTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your dream.');
      return;
    }

    const validMilestones = milestones.filter((m) => m.title.trim());
    if (validMilestones.length === 0) {
      Alert.alert(
        'Missing Milestones',
        'Please add at least one milestone with a title.'
      );
      return;
    }

    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    setCreating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await createCustomDream(user.uid, dreamTitle.trim(), validMilestones);

      // Close modal and trigger loading state
      handleClose();
      onDreamCreating?.();
    } catch (error: any) {
      console.error('[DIYDreamModal] Failed to create custom dream:', error);
      Alert.alert('Error', error.message || 'Failed to create dream. Please try again.');
      setCreating(false);
    }
  };

  const handleClose = () => {
    setDreamTitle('');
    setMilestones([{ id: '1', title: '', description: '', challengeType: 'action' }]);
    setExpandedMilestone('1');
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            <Text style={[styles.headerTitle, { color: themeColors.text_primary }]}>
              Create Your Dream
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Dream Title Input */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: themeColors.text_primary }]}>
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

            {/* Milestones Section */}
            <View style={styles.section}>
              <View style={styles.milestonesHeader}>
                <Text style={[styles.sectionLabel, { color: themeColors.text_primary }]}>
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
                                ? 'rgba(168, 85, 247, 0.2)'
                                : 'rgba(168, 85, 247, 0.15)',
                            },
                          ]}>
                          <Text style={styles.milestoneNumberText}>{index + 1}</Text>
                        </View>
                        <Text
                          style={[
                            styles.milestoneHeaderTitle,
                            { color: themeColors.text_primary },
                          ]}
                          numberOfLines={1}>
                          {hasTitle ? milestone.title : 'Untitled Milestone'}
                        </Text>
                      </View>
                      <View style={styles.milestoneHeaderRight}>
                        {hasTitle && (
                          <CheckCircle2 size={18} color="#00D4AA" strokeWidth={2} />
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
                              handleUpdateMilestone(milestone.id, 'title', text)
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
                              handleUpdateMilestone(milestone.id, 'description', text)
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
                          <View style={styles.challengeTypeRow}>
                            {CHALLENGE_TYPES.map((type) => {
                              const isSelected =
                                milestone.challengeType === type.value;
                              return (
                                <TouchableOpacity
                                  key={type.value}
                                  onPress={() =>
                                    handleUpdateMilestone(
                                      milestone.id,
                                      'challengeType',
                                      type.value
                                    )
                                  }
                                  disabled={creating}
                                  activeOpacity={0.7}
                                  style={[
                                    styles.challengeTypeButton,
                                    {
                                      backgroundColor: isSelected
                                        ? 'rgba(168, 85, 247, 0.2)'
                                        : themeColors.bg_primary,
                                      borderColor: isSelected
                                        ? '#A855F7'
                                        : themeColors.border,
                                    },
                                  ]}>
                                  <Text style={styles.challengeTypeEmoji}>
                                    {type.emoji}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.challengeTypeLabel,
                                      {
                                        color: isSelected
                                          ? '#A855F7'
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
                colors={['#fb6322', '#f79971']}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    marginTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'InstrumentSans-Bold',
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
    fontWeight: '600',
    fontFamily: 'InstrumentSans-SemiBold',
    marginBottom: 12,
  },
  dreamTitleInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'InstrumentSans-Regular',
  },
  milestonesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addMilestoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 99, 34, 0.1)',
  },
  addMilestoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fb6322',
    fontFamily: 'InstrumentSans-SemiBold',
  },
  milestoneCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  milestoneHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  milestoneNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A855F7',
    fontFamily: 'InstrumentSans-Bold',
  },
  milestoneHeaderTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'InstrumentSans-SemiBold',
    flex: 1,
  },
  milestoneHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '500',
    fontFamily: 'InstrumentSans-Medium',
  },
  milestoneInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'InstrumentSans-Regular',
  },
  descriptionInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  challengeTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  challengeTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  challengeTypeEmoji: {
    fontSize: 18,
  },
  challengeTypeLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'InstrumentSans-SemiBold',
  },
  footer: {
    paddingTop: 16,
  },
  createButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  createButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'InstrumentSans-Bold',
  },
});
