# Foreground Service Media Playback Permission - Removed

## Issue
Google Play Store flagged the app for using `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission without proper justification.

## Root Cause
The `expo-audio` package automatically adds this permission in its AndroidManifest.xml:
```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
```

## Why We Don't Need It
Our app uses audio/video ONLY in the foreground:
- ✅ **Video playback** (Luna, celebrations) - User actively viewing
- ✅ **Audio recording** (voice input) - User actively speaking
- ✅ **Audio playback** (voice responses) - User actively listening
- ❌ **Background media playback** - NOT used (this is what the permission is for)

The permission is designed for apps like Spotify that continue playing audio when the app is minimized.

## Solution Implemented
Created a custom Expo config plugin to remove the permission at build time.

### Files Created/Modified:

1. **plugins/removeMediaPlaybackPermission.js** (NEW)
   - Custom config plugin using `@expo/config-plugins`
   - Removes `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission from manifest
   - Removes `mediaPlayback` service type from any services

2. **app.json** (MODIFIED)
   - Added plugin to the plugins array:
   ```json
   "plugins": [
     ...existing plugins...,
     "./plugins/removeMediaPlaybackPermission.js"
   ]
   ```

3. **plugins/README.md** (NEW)
   - Documentation of the plugin purpose and functionality

## Verification
After running `npx expo prebuild --clean --platform android`:
- ✅ No `FOREGROUND_SERVICE` permissions in AndroidManifest.xml
- ✅ No `mediaPlayback` service types declared
- ✅ App still has required permissions:
  - `RECORD_AUDIO` - for voice input
  - `MODIFY_AUDIO_SETTINGS` - for audio configuration
  - `POST_NOTIFICATIONS` - for notifications

## Testing Required
- [ ] Test voice recording feature still works
- [ ] Test voice playback still works
- [ ] Test Luna video animations play correctly
- [ ] Test celebration videos play correctly
- [ ] Build and submit to Google Play Store

## Next Steps
1. Test all audio/video features in development build
2. Create production build with `eas build`
3. Submit to Google Play Store
4. Monitor for any permission-related rejections

## Technical Details
- The plugin runs during the prebuild phase
- It modifies the AndroidManifest.xml before compilation
- Does not affect iOS builds
- Will persist across `expo prebuild` runs as long as it's in app.json
