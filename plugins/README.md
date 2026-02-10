# Expo Config Plugins

This directory contains custom Expo config plugins for the LaunchPad app.

## removeMediaPlaybackPermission.js

**Purpose**: Removes the `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission that is automatically added by `expo-audio`.

**Why we remove it**:
- This permission is for apps that play media in the background (like Spotify)
- Our app only uses audio/video in the foreground:
  - Video playback (Luna, celebrations) - user is actively viewing
  - Audio recording (voice input) - user is actively speaking
  - Audio playback (voice responses) - user is actively listening
- Google Play Store requires justification for this permission
- Removing it avoids potential app rejection

**What it does**:
1. Removes `android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK` from the manifest
2. Removes `mediaPlayback` foreground service type from any services

**Technical details**:
- Uses `@expo/config-plugins` to modify AndroidManifest.xml at build time
- Runs during prebuild/build process
- Does not affect iOS builds
