import { create } from 'zustand';
import { VoiceService } from '../services/voiceService';
import { AudioRecordingService } from '../services/audioRecordingService';
import { requestAudioPermissionsAsync } from '../utils/audioPermissions';
import { ConversationMessage } from '../types/voice';

interface VoiceStore {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Recording state
  isRecording: boolean;
  isPlayingResponse: boolean;

  // Conversation state
  conversationHistory: ConversationMessage[];
  currentTranscript: string;

  // Results
  workflowThreadId: string | null;
  extractedDreamRequest: string | null;

  // Actions
  connect: (userId: string) => Promise<void>;
  disconnect: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  reset: () => void;
}

// Audio recording service instance
const audioRecorder = new AudioRecordingService();

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  // Initial state
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  isRecording: false,
  isPlayingResponse: false,
  conversationHistory: [],
  currentTranscript: '',
  workflowThreadId: null,
  extractedDreamRequest: null,

  // Connect to WebSocket
  connect: async (userId: string) => {
    console.log('[VoiceStore] Connecting for user:', userId);
    set({ isConnecting: true, connectionError: null });

    try {
      // Request audio permissions first
      const hasPermission = await requestAudioPermissionsAsync();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Connect to WebSocket
      await VoiceService.connect(userId, {
        onAudioResponse: async (base64Audio: string) => {
          console.log('[VoiceStore] Received complete audio response');
          set({ isPlayingResponse: true });

          try {
            // Eleven Labs sends complete MP3 - play directly
            await audioRecorder.playAudioResponse(base64Audio);
          } catch (error) {
            console.error('[VoiceStore] Error playing audio:', error);
          } finally {
            set({ isPlayingResponse: false });
          }
        },

        onTextResponse: (text: string) => {
          console.log('[VoiceStore] Received text response:', text);
          const { conversationHistory } = get();

          // Add text to conversation history
          set({
            conversationHistory: [
              ...conversationHistory,
              {
                role: 'assistant',
                text,
                timestamp: new Date(),
              },
            ],
            currentTranscript: '',
          });
        },

        onTurnComplete: () => {
          console.log('[VoiceStore] Turn complete');
          // No buffering needed - audio already played
        },

        onWorkflowComplete: (threadId: string, userRequest: string) => {
          console.log('[VoiceStore] Workflow complete:', threadId);
          set({
            workflowThreadId: threadId,
            extractedDreamRequest: userRequest,
          });

          // Disconnect after workflow completion
          get().disconnect();
        },

        onConnectionChange: (connected: boolean) => {
          console.log('[VoiceStore] Connection status:', connected);
          set({
            isConnected: connected,
            isConnecting: false,
          });
        },

        onError: (error: Error) => {
          console.error('[VoiceStore] Error:', error);
          set({
            connectionError: error.message,
            isConnecting: false,
            isConnected: false,
          });
        },
      });

      set({ isConnecting: false });
    } catch (error) {
      console.error('[VoiceStore] Connection failed:', error);
      set({
        connectionError: error instanceof Error ? error.message : 'Connection failed',
        isConnecting: false,
        isConnected: false,
      });
      throw error;
    }
  },

  // Disconnect from WebSocket
  disconnect: () => {
    console.log('[VoiceStore] Disconnecting...');
    VoiceService.disconnect();
    audioRecorder.cleanup();

    set({
      isConnected: false,
      isConnecting: false,
      isRecording: false,
      isPlayingResponse: false,
    });
  },

  // Start recording audio
  startRecording: async () => {
    const { isConnected, isPlayingResponse } = get();

    if (!isConnected) {
      console.warn('[VoiceStore] Cannot record - not connected');
      return;
    }

    if (isPlayingResponse) {
      console.warn('[VoiceStore] Cannot record - AI is speaking');
      return;
    }

    try {
      console.log('[VoiceStore] Starting recording...');
      await audioRecorder.startRecording();
      set({ isRecording: true });
    } catch (error) {
      console.error('[VoiceStore] Failed to start recording:', error);
      throw error;
    }
  },

  // Stop recording and send audio
  stopRecording: async () => {
    const { isRecording, conversationHistory } = get();

    if (!isRecording) {
      console.warn('[VoiceStore] No recording in progress');
      return;
    }

    try {
      console.log('[VoiceStore] Stopping recording...');
      const base64Audio = await audioRecorder.stopRecording();

      if (base64Audio) {
        // Send audio to server
        VoiceService.sendAudioChunk(base64Audio);
        VoiceService.endAudioTurn();

        // Add placeholder for user message (will be updated when transcript arrives)
        set({
          conversationHistory: [
            ...conversationHistory,
            {
              role: 'user',
              text: 'Speaking...',
              timestamp: new Date(),
            },
          ],
          currentTranscript: 'Speaking...',
        });
      }

      set({ isRecording: false });
    } catch (error) {
      console.error('[VoiceStore] Failed to stop recording:', error);
      set({ isRecording: false });
      throw error;
    }
  },

  // Reset all state
  reset: () => {
    console.log('[VoiceStore] Resetting state...');
    audioRecorder.cleanup();

    set({
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      isRecording: false,
      isPlayingResponse: false,
      conversationHistory: [],
      currentTranscript: '',
      workflowThreadId: null,
      extractedDreamRequest: null,
    });
  },
}));
