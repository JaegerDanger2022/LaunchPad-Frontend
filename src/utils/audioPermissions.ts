import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';

/**
 * Request microphone permission and configure audio session
 * @returns true if permission granted, false otherwise
 */
export async function requestAudioPermissionsAsync(): Promise<boolean> {
  try {
    console.log('[Audio] Checking microphone permissions...');

    // Check existing permission status
    const { status: existingStatus } = await getRecordingPermissionsAsync();
    let finalStatus = existingStatus;

    console.log('[Audio] Existing permission status:', existingStatus);

    // Request permission if not granted
    if (existingStatus !== 'granted') {
      console.log('[Audio] Requesting microphone permission...');
      const { status } = await requestRecordingPermissionsAsync();
      finalStatus = status;
      console.log('[Audio] Permission request result:', status);
    }

    if (finalStatus !== 'granted') {
      console.warn('[Audio] Microphone permission denied');
      return false;
    }

    // Configure audio session for recording
    console.log('[Audio] Configuring audio mode...');
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'duckOthers',
      shouldRouteThroughEarpiece: false,
    });

    console.log('[Audio] Microphone permission granted and audio configured');
    return true;
  } catch (error) {
    console.error('[Audio] Error requesting permissions:', error);
    return false;
  }
}
