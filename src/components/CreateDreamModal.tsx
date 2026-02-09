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
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { getThemeColors } from '../constants/GlobalStyles';
import { startConversation, sendConversationTurn } from '../config/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';

interface CreateDreamModalProps {
  visible: boolean;
  onClose: () => void;
  onDreamCreating?: () => void;
}

type ChatStatus = 'rendering' | 'waiting' | 'sending';

export const CreateDreamModal: React.FC<CreateDreamModalProps> = ({
  visible,
  onClose,
  onDreamCreating,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentAiMessage, setCurrentAiMessage] = useState<string>('');
  const [currentUserMessage, setCurrentUserMessage] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [creatingDream, setCreatingDream] = useState(false);
  const [chatStatus, setChatStatus] = useState<ChatStatus>('waiting');
  const [fullAiMessage, setFullAiMessage] = useState(''); // Store complete AI message
  const [displayedAiMessage, setDisplayedAiMessage] = useState(''); // Typewriter display
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);
  const { user, userData } = useAuthStore();
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const insets = useSafeAreaInsets();

  // Animation refs for fade transitions
  const aiMessageOpacity = useRef(new Animated.Value(1)).current;
  const userMessageOpacity = useRef(new Animated.Value(1)).current;

  // Video player for Luna header
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const isSeekingRef = useRef(false);
  const chatStatusRef = useRef(chatStatus);
  chatStatusRef.current = chatStatus;

  const player = useVideoPlayer(require('../assets/animations/chatbox/Chatbox.mp4'), (player) => {
    player.muted = true;
    player.audioMixingMode = 'mixWithOthers';
    player.loop = false;
    player.timeUpdateEventInterval = 0.1;
    player.play();
  });

  // Track when video is loaded
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay' && !isVideoLoaded) {
      setIsVideoLoaded(true);
    }
  });

  // Handle playback time updates for manual looping
  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    if (isSeekingRef.current) return;

    try {
      switch (chatStatusRef.current) {
        case 'rendering':
          if (currentTime >= 4.5) {
            isSeekingRef.current = true;
            player.currentTime = 0;
            setTimeout(() => { isSeekingRef.current = false; }, 100);
          }
          break;
        case 'waiting':
          if (currentTime >= 9.5) {
            isSeekingRef.current = true;
            player.currentTime = 5;
            setTimeout(() => { isSeekingRef.current = false; }, 100);
          }
          break;
        case 'sending':
          if (currentTime >= 14) {
            isSeekingRef.current = true;
            player.currentTime = 11;
            setTimeout(() => { isSeekingRef.current = false; }, 100);
          }
          break;
      }
    } catch (error) {
      isSeekingRef.current = false;
    }
  });

  // Handle chat status changes and jump to appropriate video segment
  useEffect(() => {
    if (!isVideoLoaded || isSeekingRef.current) return;

    isSeekingRef.current = true;
    try {
      switch (chatStatus) {
        case 'rendering':
          player.currentTime = 0;
          break;
        case 'waiting':
          player.currentTime = 5;
          break;
        case 'sending':
          player.currentTime = 11;
          break;
      }
    } catch (error) {
      console.debug('[CreateDreamModal] seek interrupted');
    } finally {
      setTimeout(() => { isSeekingRef.current = false; }, 100);
    }
  }, [chatStatus, isVideoLoaded]);

  // Typewriter effect for AI messages
  useEffect(() => {
    if (!fullAiMessage) {
      console.log('[CreateDreamModal] fullAiMessage is empty, skipping typewriter');
      return;
    }

    console.log('[CreateDreamModal] Starting typewriter for message:', fullAiMessage.substring(0, 50));

    // Clear previous typewriter if any
    if (typewriterRef.current) {
      clearTimeout(typewriterRef.current);
    }

    setChatStatus('rendering');
    setCurrentAiMessage(fullAiMessage); // Set immediately so condition is true
    setDisplayedAiMessage('');
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < fullAiMessage.length) {
        setDisplayedAiMessage(fullAiMessage.slice(0, currentIndex + 1));
        currentIndex++;
        typewriterRef.current = setTimeout(typeNextChar, 20);
      } else {
        // Typewriter complete
        console.log('[CreateDreamModal] Typewriter complete');
        console.log('[CreateDreamModal] Full message:', fullAiMessage);
        console.log('[CreateDreamModal] Full message length:', fullAiMessage.length);
        console.log('[CreateDreamModal] Final currentIndex:', currentIndex);
        setChatStatus('waiting');
      }
    };

    typeNextChar();

    return () => {
      console.log('[CreateDreamModal] Typewriter cleanup called. currentIndex:', currentIndex, 'of', fullAiMessage.length);
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
    };
  }, [fullAiMessage]);

  // Fade out and replace AI message
  const replaceAiMessage = (newMessage: string) => {
    console.log('[CreateDreamModal] replaceAiMessage called with:', newMessage.substring(0, 50));
    console.log('[CreateDreamModal] Current state - currentAiMessage:', currentAiMessage.substring(0, 30), 'displayedAiMessage:', displayedAiMessage.substring(0, 30));

    // Only fade if there's an existing message
    if (currentAiMessage || displayedAiMessage) {
      console.log('[CreateDreamModal] Fading out existing message');
      Animated.timing(aiMessageOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        console.log('[CreateDreamModal] Fade complete, resetting opacity and setting new message');
        // Use a small delay to ensure the opacity reset is processed before typewriter starts
        requestAnimationFrame(() => {
          aiMessageOpacity.setValue(1);
          // Set the new message which will trigger typewriter
          setFullAiMessage(newMessage);
        });
      });
    } else {
      console.log('[CreateDreamModal] First message, no fade');
      // First message, no fade needed
      setFullAiMessage(newMessage);
    }
  };

  // Fade out user message (called when user starts typing again)
  const clearUserMessage = () => {
    if (currentUserMessage) {
      Animated.timing(userMessageOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentUserMessage('');
        userMessageOpacity.setValue(1);
      });
    }
  };

  // Set new user message immediately (no fade in, just appears)
  const setNewUserMessage = (message: string) => {
    setCurrentUserMessage(message);
    userMessageOpacity.setValue(1);
  };

  // Start conversation when modal opens
  useEffect(() => {
    if (visible && user?.uid) {
      setSessionId(null);
      setCurrentAiMessage('');
      setCurrentUserMessage('');
      setInputText('');
      setSending(true);
      setCreatingDream(false);
      setFullAiMessage('');
      setDisplayedAiMessage('');
      setChatStatus('sending');
      aiMessageOpacity.setValue(1);
      userMessageOpacity.setValue(1);

      startConversation(user.uid, userData?.pref_timezone)
        .then((res) => {
          console.log('[CreateDreamModal] startConversation response:', res);
          console.log('[CreateDreamModal] AI greeting message:', res.ai_message);
          setSessionId(res.session_id);
          // Set the initial AI greeting message
          setFullAiMessage(res.ai_message);
        })
        .catch((err) => {
          console.error('[CreateDreamModal] startConversation failed:', err);
          Alert.alert('Connection Error', 'Could not start the conversation. Please try again.');
          onClose();
        })
        .finally(() => setSending(false));
    }
  }, [visible, user?.uid]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !sessionId || !user?.uid || sending || creatingDream) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Set user message immediately (no fade, just appears)
    setNewUserMessage(text);
    setInputText('');
    setSending(true);
    setChatStatus('sending');

    try {
      let accumulatedMessage = '';
      console.log('[CreateDreamModal] Sending conversation turn:', text);
      const res = await sendConversationTurn(sessionId, user.uid, text, (chunk) => {
        console.log('[CreateDreamModal] Received chunk:', chunk);
        accumulatedMessage += chunk;
      });

      console.log('[CreateDreamModal] Response received. Accumulated message:', accumulatedMessage);
      console.log('[CreateDreamModal] Response object:', res);

      if (res.conversation_complete) {
        console.log('[CreateDreamModal] Conversation complete, showing final message before closing');

        // Show the final AI message so the user can read it
        setCurrentUserMessage('');
        userMessageOpacity.setValue(1);
        replaceAiMessage(accumulatedMessage);

        // Wait for typewriter to finish (20ms per char + 300ms fade + buffer)
        const typewriterDuration = accumulatedMessage.length * 20 + 300;
        const displayPause = 1500; // Let user read the message
        await new Promise(resolve => setTimeout(resolve, typewriterDuration + displayPause));

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onClose();
        onDreamCreating?.();
      } else {
        console.log('[CreateDreamModal] Conversation continuing, showing AI response');
        // Clear user message instantly so AI response is shown clearly
        setCurrentUserMessage('');
        userMessageOpacity.setValue(1);
        // Replace AI message with new response
        replaceAiMessage(accumulatedMessage);
      }
    } catch (err: any) {
      console.error('[CreateDreamModal] sendConversationTurn failed:', err);
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
      setChatStatus('waiting');
    } finally {
      setSending(false);
    }
  };

  // Handle text input change - fade out user message when they start typing again
  const handleTextChange = (text: string) => {
    setInputText(text);
    // If user starts typing and there's an existing message, fade it out
    if (text.length === 1 && currentUserMessage) {
      clearUserMessage();
    }
  };

  const handleClose = () => {
    if (typewriterRef.current) {
      clearTimeout(typewriterRef.current);
    }
    setSessionId(null);
    setCurrentAiMessage('');
    setCurrentUserMessage('');
    setInputText('');
    setSending(false);
    setCreatingDream(false);
    setChatStatus('waiting');
    setFullAiMessage('');
    setDisplayedAiMessage('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            keyboardVerticalOffset={Platform.OS === 'android' ? -insets.bottom : 0}
            style={styles.keyboardView}>
            <TouchableWithoutFeedback onPress={(e) => { e.stopPropagation(); Keyboard.dismiss(); }}>
              <View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor: themeColors.bg_primary,
                    paddingTop: Math.max(insets.top + 24, 24),
                    paddingBottom: Math.max(insets.bottom + 16, 32),
                  },
                ]}>
                {/* Close Button */}
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color={themeColors.text_primary} />
                </TouchableOpacity>

                {/* Main Chat Area */}
                <View style={styles.chatArea}>
                  {/* Luna Video Header (replaces avatar) */}
                  <View style={styles.videoHeaderContainer}>
                    <View style={styles.videoPortal}>
                      <VideoView
                        player={player}
                        style={styles.video}
                        contentFit="cover"
                        nativeControls={false}
                      />
                    </View>
                  </View>

                  {/* AI Message Area - No ScrollView, just display all text */}
                  <View style={styles.aiMessageWrapper}>
                    {/* AI Message Bubble */}
                    {(currentAiMessage || displayedAiMessage) && (
                      <Animated.View
                        style={[
                          styles.aiMessageContainer,
                          { opacity: aiMessageOpacity },
                        ]}>
                        <Text
                          style={[
                            styles.aiMessageText,
                            { color: themeColors.text_primary },
                          ]}>
                          {displayedAiMessage || currentAiMessage}
                        </Text>
                      </Animated.View>
                    )}

                    {/* Initial loading indicator */}
                    {sending && !currentAiMessage && !displayedAiMessage && (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={themeColors.text_secondary} />
                      </View>
                    )}
                  </View>

                  <View style={styles.spacer} />

                  {/* User Message Bubble */}
                  {currentUserMessage && (
                    <Animated.View
                      style={[
                        styles.userMessageContainer,
                        {
                          backgroundColor: themeColors.bg_secondary,
                          borderColor: themeColors.border,
                          opacity: userMessageOpacity,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.userMessageText,
                          { color: themeColors.text_primary },
                        ]}>
                        {currentUserMessage}
                      </Text>
                      <View style={styles.userInitials}>
                        <Text style={styles.initialsText}>
                          {(user as any)?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                      </View>
                    </Animated.View>
                  )}

                </View>

                {/* Input row OR "building roadmap" state */}
                {creatingDream ? (
                  <View style={styles.creatingContainer}>
                    <ActivityIndicator size="large" color="#fb6322" />
                    <Text
                      style={[
                        styles.creatingText,
                        { color: themeColors.text_secondary },
                      ]}>
                      Building your roadmap…
                    </Text>
                  </View>
                ) : (
                  <View style={styles.inputRow} onStartShouldSetResponder={() => true}>
                    <TextInput
                      ref={inputRef}
                      style={[
                        styles.input,
                        {
                          backgroundColor: themeColors.bg_secondary,
                          borderColor: themeColors.border,
                          color: themeColors.text_primary,
                        },
                      ]}
                      placeholder="Type a message…"
                      placeholderTextColor={themeColors.text_secondary}
                      value={inputText}
                      onChangeText={handleTextChange}
                      onSubmitEditing={handleSend}
                      editable={!sending && !creatingDream}
                      returnKeyType="send"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={handleSend}
                      disabled={!inputText.trim() || sending || creatingDream}
                      activeOpacity={0.7}
                      style={[
                        styles.sendButton,
                        { opacity: !inputText.trim() || sending ? 0.4 : 1 },
                      ]}>
                      <LinearGradient
                        colors={['#fb6322', '#f79971']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.sendGradient}>
                        {sending ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Send size={20} color="#fff" />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  chatArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 20,
  },
  videoHeaderContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  videoPortal: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  aiMessageWrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  aiMessageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  aiMessageText: {
    fontSize: 18,
    fontFamily: 'InstrumentSans-Regular',
    textAlign: 'center',
    lineHeight: 26,
    width: '100%',
  },
  loadingContainer: {
    alignSelf: 'center',
    paddingVertical: 20,
  },
  spacer: {
    height: 20, // Fixed spacer instead of flex
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    borderRadius: 20,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  userMessageText: {
    fontSize: 15,
    fontFamily: 'InstrumentSans-Regular',
    flex: 1,
  },
  userInitials: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#050938',
    fontFamily: 'InstrumentSans-Bold',
  },
  creatingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  creatingText: {
    fontSize: 15,
    fontFamily: 'InstrumentSans-Regular',
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'InstrumentSans-Regular',
    minHeight: 48,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
