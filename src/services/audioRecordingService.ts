import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

/**
 * Service for managing audio recording and playback
 */
export class AudioRecordingService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private audioChunks: string[] = [];

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    try {
      console.log('[AudioRecording] Starting recording...');

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Small delay to let Android prepare
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create new recording instance
      this.recording = new Audio.Recording();

      // Configure recording options
      await this.recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      // Start recording
      await this.recording.startAsync();
      console.log('[AudioRecording] Recording started');
    } catch (error) {
      console.error('[AudioRecording] Failed to start recording:', error);
      this.recording = null;
      throw error;
    }
  }

  /**
   * Stop recording and return base64 encoded audio
   */
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) {
        console.warn('[AudioRecording] No recording in progress');
        return null;
      }

      console.log('[AudioRecording] Stopping recording...');

      // Stop recording
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      if (!uri) {
        console.error('[AudioRecording] No URI for recording');
        return null;
      }

      console.log('[AudioRecording] Recording stopped, URI:', uri);

      // Convert to base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('[AudioRecording] Audio converted to base64, length:', base64.length);

      return base64;
    } catch (error) {
      console.error('[AudioRecording] Failed to stop recording:', error);
      this.recording = null;
      return null;
    }
  }

  /**
   * Play audio response from base64 data
   */
  async playAudioResponse(base64Audio: string): Promise<void> {
    try {
      console.log('[AudioRecording] Playing audio response...');

      // Stop any existing playback
      await this.stopPlayback();

      // Write base64 to temporary file
      const fileUri = `${FileSystem.cacheDirectory}voice_response_${Date.now()}.m4a`;
      await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create sound instance
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true },
        this._onPlaybackStatusUpdate
      );

      this.sound = sound;
      console.log('[AudioRecording] Audio playback started');
    } catch (error) {
      console.error('[AudioRecording] Failed to play audio:', error);
      throw error;
    }
  }

  /**
   * Stop audio playback
   */
  async stopPlayback(): Promise<void> {
    try {
      if (this.sound) {
        console.log('[AudioRecording] Stopping playback...');
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('[AudioRecording] Error stopping playback:', error);
    }
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.recording !== null;
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return this.sound !== null;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      this.audioChunks = [];
    } catch (error) {
      console.error('[AudioRecording] Error during cleanup:', error);
    }
  }

  /**
   * Playback status update callback
   */
  private _onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish) {
      console.log('[AudioRecording] Playback finished');
      this.sound = null;
    }
  };
}
