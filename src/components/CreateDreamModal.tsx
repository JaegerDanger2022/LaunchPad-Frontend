import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Color } from '../constants/GlobalStyles';
import { createDream } from '../config/api';
import { useAuthStore } from '../store/authStore';

interface CreateDreamModalProps {
  visible: boolean;
  onClose: () => void;
  onDreamCreating?: () => void;
  onDreamCreated?: () => void;
}

export const CreateDreamModal: React.FC<CreateDreamModalProps> = ({
  visible,
  onClose,
  onDreamCreating,
  onDreamCreated,
}) => {
  const [dreamInput, setDreamInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loadUserData } = useAuthStore();

  const handleCreateDream = async () => {
    if (!dreamInput.trim()) {
      Alert.alert('Empty Input', 'Please describe your dream');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Close modal first
      onClose();

      // Notify parent that we're creating the dream (show loading screen)
      onDreamCreating?.();

      // Create the dream and get the thread_id
      const threadId = await createDream(user.uid, dreamInput.trim());

      // Reload user data to get the updated dreams
      await loadUserData(user.uid);

      // Log the thread_id for reference (saved on backend during dream creation)
      if (threadId) {
        console.log('Dream created with thread_id:', threadId);
      }

      // Clear input
      setDreamInput('');
      setLoading(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Notify parent that dream was created
      onDreamCreated?.();
    } catch (error: any) {
      console.error('Error creating dream:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error Creating Dream',
        error.message || 'Failed to create dream. Please try again.',
      );
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      {/* Backdrop */}
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}>
          {/* Modal Content */}
          <View
            style={{
              backgroundColor: Color.colorSnow,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 32,
              minHeight: 300,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 16,
            }}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
              <X size={24} color={Color.colorBlack} />
            </TouchableOpacity>

            {/* Title */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: Color.colorBlack,
                fontFamily: 'InstrumentSans-Bold',
                marginBottom: 8,
                textAlign: 'center',
              }}>
              What's Your Dream?
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontSize: 14,
                color: '#A0A0A0',
                fontFamily: 'InstrumentSans-Regular',
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: 20,
              }}>
              Describe what you want to achieve. Be as specific as possible.
            </Text>

            {/* Input Field */}
            <TextInput
              style={{
                backgroundColor: Color.colorWhite,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                fontFamily: 'InstrumentSans-Regular',
                color: Color.colorBlack,
                maxHeight: 120,
                marginBottom: 24,
                textAlignVertical: 'top',
              }}
              placeholder="e.g., Launch a profitable side project, write a book, learn Spanish..."
              placeholderTextColor="#A0A0A0"
              multiline
              editable={!loading}
              value={dreamInput}
              onChangeText={setDreamInput}
            />

            {/* Create Button */}
            <TouchableOpacity
              onPress={handleCreateDream}
              disabled={loading || !dreamInput.trim()}
              activeOpacity={0.8}
              style={{
                marginBottom: 12,
                opacity: loading || !dreamInput.trim() ? 0.6 : 1,
              }}>
              <LinearGradient
                colors={['#fb6322', '#f79971']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 48,
                }}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: Color.colorWhite,
                      fontFamily: 'InstrumentSans-Bold',
                    }}>
                    Create Dream
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}>
              <View
                style={{
                  paddingVertical: 12,
                  alignItems: 'center',
                  opacity: loading ? 0.6 : 1,
                }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#A0A0A0',
                    fontFamily: 'InstrumentSans-Regular',
                    fontWeight: '500',
                  }}>
                  Cancel
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
