import React, { useState, useEffect, useRef } from 'react';
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
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Color, getThemeColors } from '../constants/GlobalStyles';
import { startConversation, sendConversationTurn } from '../config/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

interface CreateDreamModalProps {
  visible: boolean;
  onClose: () => void;
  onDreamCreating?: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const CreateDreamModal: React.FC<CreateDreamModalProps> = ({
  visible,
  onClose,
  onDreamCreating,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [creatingDream, setCreatingDream] = useState(false);
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Start conversation when modal opens
  useEffect(() => {
    if (visible && user?.uid) {
      setSessionId(null);
      setMessages([]);
      setInputText('');
      setSending(true);
      setCreatingDream(false);

      startConversation(user.uid)
        .then((res) => {
          setSessionId(res.session_id);
          setMessages([{ role: 'assistant', text: res.ai_message }]);
        })
        .catch((err) => {
          console.error('[CreateDreamModal] startConversation failed:', err);
          Alert.alert('Connection Error', 'Could not start the conversation. Please try again.');
          onClose();
        })
        .finally(() => setSending(false));
    }
  }, [visible, user?.uid]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !sessionId || !user?.uid || sending || creatingDream) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Append user message + empty assistant bubble for streaming
    setMessages((prev) => [
      ...prev,
      { role: 'user', text },
      { role: 'assistant', text: '' },
    ]);
    setInputText('');
    setSending(true);

    try {
      const res = await sendConversationTurn(sessionId, user.uid, text, (chunk) => {
        // Append each chunk to the last (assistant) bubble
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: updated[updated.length - 1].text + chunk,
          };
          return updated;
        });
      });

      if (res.conversation_complete) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCreatingDream(true);
        onClose();
        onDreamCreating?.();
        // Dream doesn't exist in the DB yet — HomeScreen polls until it appears,
        // then refreshes user data and navigates to AllDreams.
      }
    } catch (err: any) {
      console.error('[CreateDreamModal] sendConversationTurn failed:', err);
      // Remove both the user message and the empty assistant bubble
      setMessages((prev) => prev.slice(0, -2));
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSessionId(null);
    setMessages([]);
    setInputText('');
    setSending(false);
    setCreatingDream(false);
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
            style={{ flex: 1, justifyContent: 'flex-end' }}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              {/* Modal Content */}
              <View
                style={{
                  backgroundColor: themeColors.bg_primary,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingHorizontal: 24,
                  paddingTop: 24,
                  paddingBottom: Math.max(insets.bottom + 16, 32),
                  flex: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 16,
                }}>
                {/* Close Button */}
                <TouchableOpacity
                  onPress={handleClose}
                  style={{ alignSelf: 'flex-end', marginBottom: 12 }}>
                  <X size={24} color={themeColors.text_primary} />
                </TouchableOpacity>

                {/* Title */}
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: themeColors.text_primary,
                    fontFamily: 'InstrumentSans-Bold',
                    marginBottom: 4,
                    textAlign: 'center',
                  }}>
                  What's Your Dream?
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: themeColors.text_secondary,
                    fontFamily: 'InstrumentSans-Regular',
                    textAlign: 'center',
                    marginBottom: 16,
                    lineHeight: 20,
                  }}>
                  Chat with your dream coach
                </Text>

                {/* Chat bubble list */}
                <ScrollView
                  ref={scrollRef}
                  style={{ flex: 1, marginBottom: 12 }}
                  contentContainerStyle={{ justifyContent: 'flex-end' }}>
                  {messages.map((msg, i) => (
                    <View
                      key={i}
                      style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        marginBottom: 8,
                      }}>
                      {msg.role === 'assistant' ? (
                        <View
                          style={{
                            backgroundColor: themeColors.bg_secondary,
                            borderRadius: 16,
                            borderTopLeftRadius: 4,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                          }}>
                          <Text
                            style={{
                              fontSize: 15,
                              color: themeColors.text_primary,
                              fontFamily: 'InstrumentSans-Regular',
                              lineHeight: 22,
                            }}>
                            {msg.text}
                          </Text>
                        </View>
                      ) : (
                        <LinearGradient
                          colors={['#fb6322', '#f79971']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            borderRadius: 16,
                            borderTopRightRadius: 4,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                          }}>
                          <Text
                            style={{
                              fontSize: 15,
                              color: Color.colorWhite,
                              fontFamily: 'InstrumentSans-Regular',
                              lineHeight: 22,
                            }}>
                            {msg.text}
                          </Text>
                        </LinearGradient>
                      )}
                    </View>
                  ))}

                  {/* Typing indicator — only during the initial /start call (no messages yet) */}
                  {sending && messages.length === 0 && (
                    <View style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
                      <View
                        style={{
                          backgroundColor: themeColors.bg_secondary,
                          borderRadius: 16,
                          borderTopLeftRadius: 4,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                        }}>
                        <ActivityIndicator size="small" color={themeColors.text_secondary} />
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* Input row OR "building roadmap" state */}
                {creatingDream ? (
                  <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                    <ActivityIndicator size="large" color="#fb6322" />
                    <Text
                      style={{
                        fontSize: 15,
                        color: themeColors.text_secondary,
                        fontFamily: 'InstrumentSans-Regular',
                        marginTop: 10,
                      }}>
                      Building your roadmap…
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: themeColors.bg_secondary,
                        borderWidth: 1,
                        borderColor: themeColors.border,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        fontSize: 16,
                        fontFamily: 'InstrumentSans-Regular',
                        color: themeColors.text_primary,
                        minHeight: 48,
                      }}
                      placeholder="Type a message…"
                      placeholderTextColor={themeColors.text_secondary}
                      value={inputText}
                      onChangeText={setInputText}
                      onSubmitEditing={handleSend}
                      editable={!sending && !creatingDream}
                      returnKeyType="send"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={handleSend}
                      disabled={!inputText.trim() || sending || creatingDream}
                      activeOpacity={0.7}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        overflow: 'hidden',
                        opacity: !inputText.trim() || sending ? 0.4 : 1,
                      }}>
                      <LinearGradient
                        colors={['#fb6322', '#f79971']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        {sending ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Send size={20} color="#fff" />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Cancel link */}
                <TouchableOpacity
                  onPress={handleClose}
                  disabled={creatingDream}
                  activeOpacity={0.7}
                  style={{ marginTop: 12 }}>
                  <View style={{ paddingVertical: 8, alignItems: 'center', opacity: creatingDream ? 0.3 : 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: themeColors.text_secondary,
                        fontFamily: 'InstrumentSans-Regular',
                        fontWeight: '500',
                      }}>
                      Cancel
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
