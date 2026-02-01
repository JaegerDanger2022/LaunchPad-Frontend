import { API_BASE_URL } from '../config/api';
import { VoiceCallbacks, WebSocketMessage } from '../types/voice';

/**
 * WebSocket Voice Service - Singleton pattern
 * Manages WebSocket connection to Gemini 2.0 Live API backend
 */
class VoiceServiceClass {
  private ws: WebSocket | null = null;
  private callbacks: VoiceCallbacks | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  /**
   * Get WebSocket URL from API base URL
   */
  private getWebSocketURL(): string {
    // Convert HTTP(S) to WS(S)
    const wsUrl = API_BASE_URL.replace(/^https?:\/\//i, (match: string) =>
      match.toLowerCase().startsWith('https') ? 'wss://' : 'ws://'
    );

    console.log('[VoiceService] WebSocket base URL:', wsUrl);
    return wsUrl;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(userId: string, callbacks: VoiceCallbacks): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        this.callbacks = callbacks;

        const wsBaseUrl = this.getWebSocketURL();
        const wsUrl = `${wsBaseUrl}/voice/ws/${userId}`;

        console.log('[VoiceService] Connecting to:', wsUrl);

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[VoiceService] WebSocket connected');
          this.reconnectAttempts = 0;
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
          }
          this.callbacks?.onConnectionChange(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('[VoiceService] WebSocket error:', error);
          console.error('[VoiceService] WebSocket URL was:', wsUrl);
          console.error('[VoiceService] Error details:', JSON.stringify(error, null, 2));
          const errorObj = new Error(`WebSocket connection error - attempted to connect to ${wsUrl}`);
          this.callbacks?.onError(errorObj);
          reject(errorObj);
        };

        this.ws.onclose = (event) => {
          console.log('[VoiceService] WebSocket closed:', event.code, event.reason);
          console.log('[VoiceService] Close was clean:', event.wasClean);
          console.log('[VoiceService] WebSocket URL was:', wsUrl);
          this.callbacks?.onConnectionChange(false);

          // Attempt reconnection if not intentional disconnect
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          } else if (event.code !== 1000) {
            // Max reconnect attempts reached
            const errorMsg = event.reason || `WebSocket closed with code ${event.code}`;
            this.callbacks?.onError(new Error(errorMsg));
          }
        };
      } catch (error) {
        console.error('[VoiceService] Connection error:', error);
        const errorObj = error instanceof Error ? error : new Error('Failed to connect');
        this.callbacks?.onError(errorObj);
        reject(errorObj);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (!this.userId || !this.callbacks) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    console.log(
      `[VoiceService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      if (this.userId && this.callbacks) {
        this.connect(this.userId, this.callbacks).catch((error) => {
          console.error('[VoiceService] Reconnect failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      console.log('[VoiceService] Received message type:', message.type);

      switch (message.type) {
        case 'audio':
          if (message.data) {
            this.callbacks?.onAudioResponse(message.data);
          }
          break;

        case 'text':
          if (message.text) {
            console.log('[VoiceService] AI transcript:', message.text);
            this.callbacks?.onTextResponse(message.text);
          }
          break;

        case 'workflow_complete':
          if (message.thread_id && message.user_request) {
            console.log('[VoiceService] Workflow complete:', message.thread_id);
            this.callbacks?.onWorkflowComplete(message.thread_id, message.user_request);
          }
          break;

        case 'error':
          console.error('[VoiceService] Server error:', message.message);
          this.callbacks?.onError(new Error(message.message || 'Server error'));
          break;

        default:
          console.warn('[VoiceService] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[VoiceService] Error parsing message:', error);
    }
  }

  /**
   * Send audio chunk to server
   */
  sendAudioChunk(base64Audio: string): void {
    if (!this.isConnected()) {
      console.warn('[VoiceService] Cannot send audio - not connected');
      return;
    }

    const message: WebSocketMessage = {
      type: 'audio',
      data: base64Audio,
    };

    this.ws?.send(JSON.stringify(message));
    console.log('[VoiceService] Sent audio chunk, size:', base64Audio.length);
  }

  /**
   * Signal end of audio turn
   */
  endAudioTurn(): void {
    if (!this.isConnected()) {
      console.warn('[VoiceService] Cannot end turn - not connected');
      return;
    }

    const message: WebSocketMessage = {
      type: 'end_audio',
    };

    this.ws?.send(JSON.stringify(message));
    console.log('[VoiceService] Sent end_audio signal');
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    console.log('[VoiceService] Disconnecting...');

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }

    this.userId = null;
    this.callbacks = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const VoiceService = new VoiceServiceClass();
