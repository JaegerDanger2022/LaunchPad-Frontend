# Frontend Integration Guide - Voice Conversation

**For:** PacksLight---Expo-Frontend (React Native)
**Backend:** PacksLight---Expo-Backend (WebSocket API)
**LangGraph:** Handles conversation logic

---

## Architecture Overview

```
User speaks
    ↓
Frontend: Record audio
    ↓ WebSocket
Backend: STT (Whisper) → LangGraph → TTS (Eleven Labs)
    ↓ WebSocket
Frontend: Play audio
    ↓
User speaks again (2-3 exchanges)
    ↓
Backend: LangGraph extracts context → creates roadmap
    ↓ WebSocket
Frontend: Show roadmap
```

---

## WebSocket Protocol

### Connect

```typescript
const ws = new WebSocket(`${WS_URL}/api/voice/ws/${userId}`);
```

### Messages You'll Receive

```typescript
// AI audio response
{
  type: "audio",
  data: "base64_encoded_mp3_audio"
}

// AI text (for display)
{
  type: "text",
  text: "Hi! What's a goal you'd like to work on?"
}

// Your transcript (what you said)
{
  type: "user_transcript",
  text: "I want to learn guitar"
}

// Turn complete (AI done talking)
{
  type: "turn_complete"
}

// Workflow complete (roadmap ready)
{
  type: "workflow_complete",
  roadmap: { /* roadmap object */ },
  status: "completed"
}

// Error
{
  type: "error",
  message: "Error description"
}
```

### Messages You Send

```typescript
// Send recorded audio
{
  type: "audio",
  data: "base64_encoded_wav_audio"
}

// End conversation early
{
  type: "end"
}
```

---

## Implementation

### 1. Install Dependencies

```bash
npm install react-native-audio-recorder-player
# or
expo install expo-av
```

### 2. Create Voice Service

**File:** `src/services/voiceService.ts`

```typescript
import { Audio } from 'expo-av';

export class VoiceService {
  private ws: WebSocket | null = null;
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;

  constructor(
    private userId: string,
    private onAudio: (base64Audio: string) => void,
    private onText: (text: string) => void,
    private onUserTranscript: (text: string) => void,
    private onTurnComplete: () => void,
    private onWorkflowComplete: (roadmap: any) => void,
    private onError: (error: string) => void
  ) {}

  // ========================================================================
  // WEBSOCKET
  // ========================================================================

  async connect(wsUrl: string) {
    this.ws = new WebSocket(`${wsUrl}/api/voice/ws/${this.userId}`);

    this.ws.onopen = () => {
      console.log('[VoiceService] Connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('[VoiceService] WebSocket error:', error);
      this.onError('WebSocket connection error');
    };

    this.ws.onclose = () => {
      console.log('[VoiceService] Disconnected');
    };
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'audio':
        this.onAudio(data.data);
        break;
      case 'text':
        this.onText(data.text);
        break;
      case 'user_transcript':
        this.onUserTranscript(data.text);
        break;
      case 'turn_complete':
        this.onTurnComplete();
        break;
      case 'workflow_complete':
        this.onWorkflowComplete(data.roadmap);
        break;
      case 'error':
        this.onError(data.message);
        break;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // ========================================================================
  // RECORDING
  // ========================================================================

  async startRecording() {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      console.log('[VoiceService] Recording started');
    } catch (error) {
      console.error('[VoiceService] Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string> {
    if (!this.recording) {
      throw new Error('No active recording');
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      if (!uri) {
        throw new Error('No recording URI');
      }

      // Read file and convert to base64
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove data:audio/x-wav;base64, prefix
          const base64Audio = base64.split(',')[1];
          resolve(base64Audio);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('[VoiceService] Failed to stop recording:', error);
      throw error;
    }
  }

  async sendAudio(base64Audio: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({
      type: 'audio',
      data: base64Audio
    }));
  }

  // ========================================================================
  // PLAYBACK
  // ========================================================================

  async playAudio(base64Audio: string) {
    try {
      // Stop any current playback
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Convert base64 to audio file
      const audioUri = `data:audio/mp3;base64,${base64Audio}`;

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, volume: 1.0 }
      );

      this.sound = sound;

      // Cleanup when done
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          this.sound = null;
        }
      });

      console.log('[VoiceService] Playing audio');
    } catch (error) {
      console.error('[VoiceService] Failed to play audio:', error);
      throw error;
    }
  }

  async stopPlayback() {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
}
```

### 3. Create Voice Screen

**File:** `src/screens/VoiceConversationScreen.tsx`

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VoiceService } from '../services/voiceService';

export default function VoiceConversationScreen({ navigation, route }) {
  const { userId, wsUrl } = route.params;

  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiText, setAiText] = useState('');
  const [userText, setUserText] = useState('');
  const [conversationLog, setConversationLog] = useState<string[]>([]);

  const voiceServiceRef = useRef<VoiceService | null>(null);

  useEffect(() => {
    // Initialize voice service
    const voiceService = new VoiceService(
      userId,
      handleAudio,
      handleText,
      handleUserTranscript,
      handleTurnComplete,
      handleWorkflowComplete,
      handleError
    );

    voiceServiceRef.current = voiceService;

    // Connect
    voiceService.connect(wsUrl);
    setIsConnected(true);

    // Cleanup
    return () => {
      voiceService.disconnect();
      voiceServiceRef.current = null;
    };
  }, [userId, wsUrl]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleAudio = async (base64Audio: string) => {
    setIsPlaying(true);
    try {
      await voiceServiceRef.current?.playAudio(base64Audio);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleText = (text: string) => {
    setAiText(text);
    setConversationLog((prev) => [...prev, `AI: ${text}`]);
  };

  const handleUserTranscript = (text: string) => {
    setUserText(text);
    setConversationLog((prev) => [...prev, `You: ${text}`]);
  };

  const handleTurnComplete = () => {
    console.log('Turn complete');
  };

  const handleWorkflowComplete = (roadmap: any) => {
    console.log('Roadmap complete:', roadmap);
    // Navigate to roadmap screen
    navigation.navigate('Roadmap', { roadmap });
  };

  const handleError = (error: string) => {
    console.error('Error:', error);
    alert(`Error: ${error}`);
  };

  // ========================================================================
  // RECORDING
  // ========================================================================

  const handlePressIn = async () => {
    if (isPlaying) {
      // Don't interrupt AI
      return;
    }

    try {
      setIsRecording(true);
      await voiceServiceRef.current?.startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  const handlePressOut = async () => {
    if (!isRecording) return;

    try {
      const base64Audio = await voiceServiceRef.current?.stopRecording();
      if (base64Audio) {
        await voiceServiceRef.current?.sendAudio(base64Audio);
      }
    } catch (error) {
      console.error('Failed to send audio:', error);
    } finally {
      setIsRecording(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Conversation</Text>

      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.status}>
          {isPlaying ? '🔊 AI speaking...' :
           isRecording ? '🎤 Recording...' :
           '👂 Listening...'}
        </Text>
      </View>

      {/* AI Text */}
      <View style={styles.textContainer}>
        <Text style={styles.label}>AI:</Text>
        <Text style={styles.text}>{aiText}</Text>
      </View>

      {/* User Text */}
      <View style={styles.textContainer}>
        <Text style={styles.label}>You:</Text>
        <Text style={styles.text}>{userText}</Text>
      </View>

      {/* Conversation Log */}
      <View style={styles.logContainer}>
        {conversationLog.map((message, index) => (
          <Text key={index} style={styles.logText}>
            {message}
          </Text>
        ))}
      </View>

      {/* Record Button */}
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recordButtonActive,
          isPlaying && styles.recordButtonDisabled
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isPlaying}
        activeOpacity={0.8}
      >
        <Text style={styles.recordButtonText}>
          {isRecording ? '🎤 Recording...' : '🎤 Hold to Speak'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusContainer: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    textAlign: 'center',
  },
  textContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  logContainer: {
    flex: 1,
    marginVertical: 20,
  },
  logText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  recordButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#F44336',
  },
  recordButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### 4. Navigation Setup

```typescript
// Add to your navigation stack
<Stack.Screen
  name="VoiceConversation"
  component={VoiceConversationScreen}
  options={{ title: 'Voice Assistant' }}
/>

// Navigate to it
navigation.navigate('VoiceConversation', {
  userId: 'user_123',
  wsUrl: 'ws://your-backend-url.com'
});
```

---

## Testing

### 1. Test Permissions

```typescript
const { status } = await Audio.requestPermissionsAsync();
console.log('Microphone permission:', status);
```

### 2. Test Recording

```typescript
const service = new VoiceService(/* ... */);
await service.startRecording();
setTimeout(async () => {
  const audio = await service.stopRecording();
  console.log('Recorded audio length:', audio.length);
}, 3000);
```

### 3. Test WebSocket

```typescript
const service = new VoiceService(/* ... */);
await service.connect('ws://localhost:8000');
// Check console for connection messages
```

---

## Flow Example

```
1. User opens screen
   → VoiceService connects to WebSocket
   → Receives AI greeting audio
   → Plays: "Hi! What's a goal you'd like to work on?"

2. User holds record button
   → Records audio
   → Releases button
   → Sends audio to backend
   → Receives transcript: "I want to learn guitar"
   → Receives AI audio
   → Plays: "That sounds exciting! Do you want to start soon?"

3. User responds again (2-3 times)
   → Same flow

4. Backend sends workflow_complete
   → Navigate to roadmap screen
   → Show personalized roadmap
```

---

## Error Handling

```typescript
// Handle connection errors
ws.onerror = (error) => {
  Alert.alert('Connection Error', 'Failed to connect to voice assistant');
};

// Handle recording errors
try {
  await startRecording();
} catch (error) {
  Alert.alert('Recording Error', 'Could not access microphone');
}

// Handle playback errors
try {
  await playAudio(base64Audio);
} catch (error) {
  Alert.alert('Playback Error', 'Could not play audio response');
}
```

---

## UI/UX Tips

1. **Visual Feedback**
   - Show recording animation (pulsing red circle)
   - Show AI speaking animation (sound waves)
   - Display transcripts in real-time

2. **Prevent Interruptions**
   - Disable record button while AI is speaking
   - Stop playback if user starts talking

3. **Loading States**
   - Show "Processing..." while waiting for AI response
   - Show "Creating roadmap..." when workflow starts

4. **Conversation Context**
   - Show conversation history
   - Allow scrolling through past messages

---

## Next Steps

1. ✅ Backend WebSocket implemented
2. ⏳ Implement VoiceService in frontend
3. ⏳ Create VoiceConversationScreen
4. ⏳ Test audio recording
5. ⏳ Test audio playback
6. ⏳ Test full conversation flow

---

**Ready to build!** See [BACKEND_INTEGRATION_FINAL.md](BACKEND_INTEGRATION_FINAL.md) for backend implementation.
