import {
  AudioModule,
  createAudioPlayer,
  setAudioModeAsync,
  IOSOutputFormat,
  AudioQuality,
} from 'expo-audio';
import type { AudioPlayer, AudioRecorder } from 'expo-audio';
import { Paths, File } from 'expo-file-system';

/**
 * Service for managing audio recording and playback
 */
export class AudioRecordingService {
  private recorder: AudioRecorder | null = null;
  private player: AudioPlayer | null = null;
  private audioChunks: string[] = [];

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    try {
      console.log('[AudioRecording] Starting recording...');

      // Stop any existing recording first
      if (this.recorder) {
        try {
          await this.recorder.stop();
        } catch (e) {
          console.log('[AudioRecording] Cleaned up previous recording');
        }
        this.recorder = null;
      }

      // Configure audio mode for recording
      console.log('[AudioRecording] Setting audio mode...');
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'duckOthers',
        shouldRouteThroughEarpiece: false,
      });

      // Small delay to ensure audio mode is set
      await new Promise(resolve => setTimeout(resolve, 150));

      // Create new recording instance with options for Gemini Live API
      // Gemini expects 16kHz, 16-bit, mono, linear PCM
      console.log('[AudioRecording] Creating recording instance...');
      this.recorder = new AudioModule.AudioRecorder({
        extension: '.wav',
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 256000,
        android: {
          outputFormat: 'default',
          audioEncoder: 'default',
        },
        ios: {
          outputFormat: IOSOutputFormat.LINEARPCM,
          audioQuality: AudioQuality.HIGH,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 256000,
        },
      });

      // Prepare and start recording
      console.log('[AudioRecording] Preparing to record...');
      await this.recorder.prepareToRecordAsync();

      console.log('[AudioRecording] Starting recording...');
      this.recorder.record();
      console.log('[AudioRecording] Recording started successfully');
    } catch (error) {
      console.error('[AudioRecording] Failed to start recording:', error);
      console.error('[AudioRecording] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      this.recorder = null;
      throw error;
    }
  }

  /**
   * Stop recording and return base64 encoded audio
   */
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recorder) {
        console.warn('[AudioRecording] No recording in progress');
        return null;
      }

      console.log('[AudioRecording] Stopping recording...');

      // Stop recording
      await this.recorder.stop();
      const uri = this.recorder.uri;
      this.recorder = null;

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
      this.recorder = null;
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

      // Eleven Labs sends complete MP3 audio - play directly
      const file = new File(Paths.cache, `voice_response_${Date.now()}.mp3`);

      // Convert base64 to binary
      const binaryString = atob(base64Audio);
      const audioData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        audioData[i] = binaryString.charCodeAt(i);
      }

      // Write MP3 file
      await file.create();
      const writable = file.writableStream();
      const writer = writable.getWriter();
      await writer.write(audioData);
      await writer.close();

      console.log('[AudioRecording] MP3 file written:', file.uri);

      // Set audio mode for playback
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'duckOthers',
        shouldRouteThroughEarpiece: false,
      });

      // Create audio player and play
      this.player = createAudioPlayer({ uri: file.uri });
      this.player.volume = 1.0;

      // Listen for playback completion
      this.player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          console.log('[AudioRecording] Playback finished');
          this.player?.remove();
          this.player = null;
        }
      });

      this.player.play();
      console.log('[AudioRecording] Audio playback started');
    } catch (error) {
      console.error('[AudioRecording] Failed to play audio:', error);
      console.error('[AudioRecording] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
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
      if (this.player) {
        console.log('[AudioRecording] Stopping playback...');
        this.player.pause();
        this.player.remove();
        this.player = null;
      }
    } catch (error) {
      console.error('[AudioRecording] Error stopping playback:', error);
    }
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.recorder !== null;
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return this.player !== null;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.recorder) {
        await this.recorder.stop();
        this.recorder = null;
      }
      if (this.player) {
        this.player.remove();
        this.player = null;
      }
      this.audioChunks = [];
    } catch (error) {
      console.error('[AudioRecording] Error during cleanup:', error);
    }
  }
}
