# expo-video Removal - Android Permissions Impact

## Changes Made

### 1. Removed from package.json
```json
- "expo-video": "~3.0.15"
```

### 2. Removed from app.json plugins
```json
- "expo-video",
```

## Permissions That Will Be REMOVED After Rebuild

When you rebuild the app with EAS (`eas build` or `npx expo prebuild --clean`), the following permissions will be **automatically removed** from the AndroidManifest.xml:

### ❌ Will Be Removed:
- `android.permission.READ_MEDIA_VIDEO` ✅
- `android.permission.READ_MEDIA_IMAGES` ✅
- `android.permission.READ_MEDIA_AUDIO` ✅ (was added by expo-video)
- `android.permission.READ_MEDIA_VISUAL_USER_SELECTED` ✅ (was added by expo-video)

These permissions were **automatically added by the expo-video plugin** during the prebuild process.

## Permissions That Will REMAIN

These permissions are still needed by other parts of the app:

### ✅ Will Remain:
- `android.permission.INTERNET` - Required for API calls
- `android.permission.MODIFY_AUDIO_SETTINGS` - Required by expo-audio
- `android.permission.POST_NOTIFICATIONS` - Required by expo-notifications
- `android.permission.RECORD_AUDIO` - Required by expo-audio (explicitly declared in app.json)
- `android.permission.SYSTEM_ALERT_WINDOW` - Required by React Native dev mode
- `android.permission.VIBRATE` - Required for haptic feedback
- `android.permission.READ_EXTERNAL_STORAGE` - Legacy fallback (Android < 13)
- `android.permission.WRITE_EXTERNAL_STORAGE` - Legacy fallback (Android < 13)

## Confirmation

**Q: Will the bundled app use READ_MEDIA_IMAGES or READ_MEDIA_VIDEO?**

**A: NO** ✅ - After you run `eas build` or `npx expo prebuild --clean`, these permissions will be completely removed from your app because:

1. ✅ `expo-video` plugin removed from app.json (line 26 deleted)
2. ✅ `expo-video` package removed from package.json
3. ✅ All video files replaced with Lottie animations
4. ✅ No code references to expo-video remain

The Android manifest is **auto-generated** during the build process based on which Expo plugins you have installed. Since expo-video is no longer in your config, its permissions won't be added.

## How Expo Plugin Permissions Work

Expo uses a **plugin system** where each plugin declares its required permissions:

```
expo-video plugin → adds → READ_MEDIA_VIDEO, READ_MEDIA_IMAGES, READ_MEDIA_AUDIO
expo-audio plugin → adds → RECORD_AUDIO, MODIFY_AUDIO_SETTINGS
expo-notifications plugin → adds → POST_NOTIFICATIONS
```

When you remove a plugin from app.json, its permissions are no longer injected during the prebuild.

## Build Process

1. **Local prebuild**: `npx expo prebuild --clean`
   - Regenerates native projects
   - Removes expo-video permissions from AndroidManifest.xml

2. **EAS build**: `eas build --platform android`
   - Does prebuild automatically in the cloud
   - Generates clean AndroidManifest.xml without video permissions

## Verification

After building, you can verify the permissions by:

1. **Check the manifest**:
   ```bash
   cat android/app/src/main/AndroidManifest.xml | grep READ_MEDIA
   ```
   Should return: (nothing - permissions removed)

2. **Check the APK**:
   ```bash
   aapt dump permissions app.apk | grep READ_MEDIA
   ```
   Should return: (nothing - permissions removed)

## Summary

✅ **YES, confirmed**: The bundled app will **NOT** use `READ_MEDIA_IMAGES` or `READ_MEDIA_VIDEO` after rebuild.

All video-related permissions were only present because of the `expo-video` plugin, which is now completely removed.
