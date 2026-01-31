import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Mic } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ConnectionStatus } from './ConnectionStatus';
import { ConversationMessage } from '../../types/voice';
import { Colors } from '../../constants/Colors';

interface VoiceRecordingUIProps {
  isConnected: boolean;
  isConnecting: boolean;
  isRecording: boolean;
  isPlayingResponse: boolean;
  conversationHistory: ConversationMessage[];
  connectionError: string | null;
  onRecordStart: () => void;
  onRecordEnd: () => void;
  onCancel: () => void;
}

export const VoiceRecordingUI: React.FC<VoiceRecordingUIProps> = ({
  isConnected,
  isConnecting,
  isRecording,
  isPlayingResponse,
  conversationHistory,
  connectionError,
  onRecordStart,
  onRecordEnd,
  onCancel,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Pulse animation for recording button
  useEffect(() => {
    if (isRecording) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversationHistory.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversationHistory.length]);

  const handlePressIn = async () => {
    if (!isConnected || isPlayingResponse) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRecordStart();
  };

  const handlePressOut = async () => {
    if (!isRecording) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRecordEnd();
  };

  const renderConversationHistory = () => {
    if (conversationHistory.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Tap and hold the microphone button to start talking about your dream
          </Text>
        </View>
      );
    }

    return conversationHistory.map((message, index) => (
      <View
        key={index}
        style={[
          styles.messageContainer,
          message.role === 'user' ? styles.userMessage : styles.aiMessage,
        ]}
      >
        <Text style={styles.messageRole}>
          {message.role === 'user' ? '👤 You' : '🤖 AI'}
        </Text>
        <Text style={styles.messageText}>{message.text}</Text>
      </View>
    ));
  };

  const getButtonText = () => {
    if (!isConnected) return 'Connecting...';
    if (isRecording) return 'Recording...';
    if (isPlayingResponse) return 'AI is speaking...';
    return 'Hold to Talk';
  };

  const isButtonDisabled = !isConnected || isPlayingResponse;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎤 Conversation with AI</Text>
        <ConnectionStatus
          isConnected={isConnected}
          isConnecting={isConnecting}
          error={connectionError}
        />
      </View>

      {/* Conversation History */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.conversationScrollView}
        contentContainerStyle={styles.conversationContent}
        showsVerticalScrollIndicator={false}
      >
        {renderConversationHistory()}

        {/* AI Thinking Indicator */}
        {isPlayingResponse && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={[styles.messageText, styles.thinkingText]}>
              AI is responding...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Recording Button */}
      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
              isButtonDisabled && styles.recordButtonDisabled,
            ]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isButtonDisabled}
            activeOpacity={0.8}
          >
            {isRecording ? (
              <View style={styles.recordingIndicator} />
            ) : (
              <Mic
                size={28}
                color={isButtonDisabled ? '#CCCCCC' : '#FFFFFF'}
                strokeWidth={2.5}
              />
            )}
          </TouchableOpacity>
        </Animated.View>

        <Text
          style={[
            styles.buttonLabel,
            isRecording && styles.buttonLabelActive,
            isButtonDisabled && styles.buttonLabelDisabled,
          ]}
        >
          {getButtonText()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'InstrumentSans-Bold',
    color: Colors.textPrimary,
  },
  conversationScrollView: {
    flex: 1,
    marginBottom: 16,
  },
  conversationContent: {
    paddingVertical: 8,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  userMessage: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  aiMessage: {
    backgroundColor: Colors.cardBg,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  messageRole: {
    fontSize: 12,
    fontFamily: 'InstrumentSans-Bold',
    color: Colors.textSecondary,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  thinkingText: {
    fontStyle: 'italic',
    color: Colors.textMuted,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 12,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: '#FF4444',
  },
  recordButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0.1,
  },
  recordingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  buttonLabel: {
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
    color: Colors.textSecondary,
  },
  buttonLabelActive: {
    fontFamily: 'InstrumentSans-Bold',
    color: '#FF4444',
  },
  buttonLabelDisabled: {
    color: Colors.textMuted,
  },
});
