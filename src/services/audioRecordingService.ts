import { Audio } from 'expo-av';
import { Paths, File } from 'expo-file-system';

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

      // Stop any existing recording first
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (e) {
          console.log('[AudioRecording] Cleaned up previous recording');
        }
        this.recording = null;
      }

      // Configure audio mode for recording
      console.log('[AudioRecording] Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Small delay to ensure audio mode is set
      await new Promise(resolve => setTimeout(resolve, 150));

      // Create new recording instance
      console.log('[AudioRecording] Creating recording instance...');
      this.recording = new Audio.Recording();

      // Configure recording options for Gemini Live API
      // Gemini expects 16kHz, 16-bit, mono, linear PCM
      console.log('[AudioRecording] Preparing to record...');
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 256000,
        },
      });

      // Start recording
      console.log('[AudioRecording] Starting recording...');
      await this.recording.startAsync();
      console.log('[AudioRecording] Recording started successfully');
    } catch (error) {
      console.error('[AudioRecording] Failed to start recording:', error);
      console.error('[AudioRecording] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
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

      // Convert to base64 using new File API
      const file = new File(uri);
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

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
      console.log('[AudioRecording] Playing audio response, size:', base64Audio.length);

      // Stop any existing playback
      await this.stopPlayback();

      // Gemini sends PCM audio - save as WAV for compatibility
      const file = new File(Paths.cache, `voice_response_${Date.now()}.wav`);

      // Convert base64 to binary
      const binaryString = atob(base64Audio);
      const audioData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        audioData[i] = binaryString.charCodeAt(i);
      }

      // Write WAV file with header for 16-bit PCM, 24kHz, mono
      const wavData = this.createWavFile(audioData, 24000, 1, 16);

      // Write to file
      await file.create();
      const writable = file.writableStream();
      const writer = writable.getWriter();
      await writer.write(wavData);
      await writer.close();

      console.log('[AudioRecording] WAV file written:', file.uri);

      // Create sound instance
      const { sound } = await Audio.Sound.createAsync(
        { uri: file.uri },
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
   * Create a WAV file from raw PCM data
   */
  private createWavFile(
    pcmData: Uint8Array,
    sampleRate: number,
    numChannels: number,
    bitsPerSample: number
  ): Uint8Array {
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = pcmData.length;
    const headerSize = 44;
    const fileSize = headerSize + dataSize - 8;

    const buffer = new ArrayBuffer(headerSize + dataSize);
    const view = new DataView(buffer);
    const data = new Uint8Array(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM data
    data.set(pcmData, headerSize);

    return new Uint8Array(buffer);
  }

  /**
   * Helper to write ASCII string to DataView
   */
  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
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
