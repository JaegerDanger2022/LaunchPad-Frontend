/**
 * Voice conversation types and interfaces
 */

export interface ConversationMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface VoiceCallbacks {
  onAudioResponse: (base64Audio: string) => void;
  onTextResponse: (text: string) => void;
  onWorkflowComplete: (threadId: string, userRequest: string) => void;
  onConnectionChange: (connected: boolean) => void;
  onError: (error: Error) => void;
}

export interface WebSocketMessage {
  type: 'audio' | 'text' | 'workflow_complete' | 'end_audio' | 'error';
  data?: string;
  text?: string;
  thread_id?: string;
  user_request?: string;
  message?: string;
}

export interface VoiceStore {
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
