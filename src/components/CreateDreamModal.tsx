import React, { useState, useEffect } from 'react';
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
  Linking,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Color } from '../constants/GlobalStyles';
import { createDream } from '../config/api';
import { useAuthStore } from '../store/authStore';
import { useVoiceStore } from '../store/voiceStore';
import { VoiceModeToggle } from './voice/VoiceModeToggle';
import { VoiceRecordingUI } from './voice/VoiceRecordingUI';

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
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const { user, loadUserData } = useAuthStore();
  const insets = useSafeAreaInsets();

  // Voice store
  const {
    isConnected,
    isConnecting,
    isRecording,
    isPlayingResponse,
    conversationHistory,
    connectionError,
    workflowThreadId,
    extractedDreamRequest,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    reset,
  } = useVoiceStore();

  // Handle voice mode connection
  useEffect(() => {
    if (visible && inputMode === 'voice' && user?.uid) {
      console.log('[CreateDreamModal] Attempting to connect to voice service for user:', user.uid);
      connect(user.uid).catch((error) => {
        console.error('[CreateDreamModal] Connection failed:', error);
        console.error('[CreateDreamModal] Error message:', error.message);
        console.error('[CreateDreamModal] Error stack:', error.stack);

        // Check if it's a permission error
        if (error.message?.includes('permission')) {
          Alert.alert(
            'Microphone Permission Required',
            'Please enable microphone access in your device settings to use voice mode.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => setInputMode('text') },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            'Connection Failed',
            `Failed to connect to voice service: ${error.message}\n\nPlease try again or use text mode.`,
            [{ text: 'OK', onPress: () => setInputMode('text') }]
          );
        }
      });
    }

    return () => {
      if (inputMode === 'voice') {
        disconnect();
      }
    };
  }, [visible, inputMode, user?.uid, connect, disconnect]);

  // Handle workflow completion from voice
  useEffect(() => {
    if (workflowThreadId && extractedDreamRequest && user?.uid) {
      console.log('[CreateDreamModal] Voice workflow completed:', workflowThreadId);

      // Close modal
      onClose();

      // Show loading screen
      onDreamCreating?.();

      // Reload user data to get the new dream
      loadUserData(user.uid).then(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onDreamCreated?.();
        reset();
      });
    }
  }, [workflowThreadId, extractedDreamRequest, user?.uid, onClose, onDreamCreating, onDreamCreated, loadUserData, reset]);

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

  const handleModeChange = (mode: 'text' | 'voice') => {
    setInputMode(mode);
    if (mode === 'text') {
      disconnect();
      reset();
    }
  };

  const handleClose = () => {
    if (inputMode === 'voice') {
      disconnect();
      reset();
    }
    setDreamInput('');
    setInputMode('text');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            keyboardVerticalOffset={Platform.OS === 'android' ? -insets.bottom : 0}
            style={{ justifyContent: 'flex-end' }}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              {/* Modal Content */}
              <View
                style={{
                  backgroundColor: Color.colorSnow,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingHorizontal: 24,
                  paddingTop: 24,
                  paddingBottom: Math.max(insets.bottom + 16, 32),
                  minHeight: 300,
                  maxHeight: '80%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 16,
                }}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={handleClose}
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
                marginBottom: 16,
                lineHeight: 20,
              }}>
              Describe what you want to achieve. Be as specific as possible.
            </Text>

            {/* Mode Toggle */}
            <View style={{ marginBottom: 24 }}>
              <VoiceModeToggle
                mode={inputMode}
                onModeChange={handleModeChange}
                disabled={loading || isRecording || isPlayingResponse}
              />
            </View>

            {/* Text Input Mode */}
            {inputMode === 'text' ? (
              <>
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
              </>
            ) : (
              /* Voice Input Mode */
              <VoiceRecordingUI
                isConnected={isConnected}
                isConnecting={isConnecting}
                isRecording={isRecording}
                isPlayingResponse={isPlayingResponse}
                conversationHistory={conversationHistory}
                connectionError={connectionError}
                onRecordStart={startRecording}
                onRecordEnd={stopRecording}
                onCancel={handleClose}
              />
            )}

            {/* Cancel Button - Only show in text mode */}
            {inputMode === 'text' && (
              <TouchableOpacity
                onPress={handleClose}
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
            )}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
