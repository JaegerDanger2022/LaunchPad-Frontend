# EAS Updates Setup Guide

## Overview
This project is now configured with EAS Updates for Over-The-Air (OTA) updates. This allows you to push updates to your app without going through the app store review process.

## Configuration Summary

### Files Modified
1. **[eas.json](eas.json)** - Added update channels for development, preview, and production
2. **[app.json](app.json)** - Added updates configuration with automatic checking on app load
3. **[App.tsx](App.tsx)** - Added update checking logic that runs on app start
4. **[package.json](package.json)** - Added convenient npm scripts for publishing updates

### Update Channels
- **development** - For development builds
- **preview** - For internal testing/preview builds
- **production** - For production app store builds

## How It Works

### Automatic Update Check
- When the app launches, it automatically checks for updates (in production only, not in dev mode)
- If an update is available, it's downloaded in the background
- User is prompted to restart the app to apply the update
- User can choose "Later" or "Restart" immediately

### Runtime Version
- Uses `appVersion` policy - updates are tied to the app version in app.json
- Compatible updates will only be delivered to apps with matching versions

## Publishing Updates

### Prerequisites
1. You must be logged in to your Expo account:
   ```bash
   eas login
   ```

2. Make sure you've built at least one version of your app with EAS Build for each channel

### Publishing Commands

#### Production Updates (App Store builds)
```bash
npm run update:prod "Your update message here"
```
Example:
```bash
npm run update:prod "Fixed login bug and improved performance"
```

#### Preview Updates (Internal testing)
```bash
npm run update:preview "Your update message here"
```

#### Development Updates
```bash
npm run update:dev "Your update message here"
```

### Manual Publishing
You can also use the EAS CLI directly:
```bash
eas update --branch production --message "Your message"
eas update --branch preview --message "Your message"
eas update --branch development --message "Your message"
```

## What Can Be Updated OTA?

### ✅ Can Update
- JavaScript code changes
- React components
- Business logic
- Styling (except native styles)
- Assets (images, videos, etc.)
- API endpoints and configurations

### ❌ Cannot Update (requires new build)
- Native code changes (iOS/Android)
- App.json changes that affect native config
- New native dependencies
- Changes to expo-updates configuration
- App icons or splash screens
- Native permissions

## Building New Versions

When you need to make changes that require a new build:

### Development Build
```bash
npm run build:dev
```

### Preview Build
```bash
npm run build:preview
```

### Production Build
```bash
npm run build:prod
```

## Best Practices

1. **Test Before Publishing**
   - Always test updates in development/preview channels first
   - Use `npm run update:dev` or `npm run update:preview` for testing

2. **Clear Update Messages**
   - Write descriptive messages about what changed
   - Example: "Fixed crash on login screen" is better than "bug fix"

3. **Version Management**
   - Increment app version in app.json when making breaking changes
   - Use OTA updates for hotfixes and minor improvements

4. **Rollback Strategy**
   - Keep track of previous update messages
   - You can republish older code if needed by running update command again

5. **Monitor Updates**
   - Check the EAS dashboard to see update adoption: https://expo.dev/accounts/expocapstone/projects/launchpad/updates

## Checking Current Version

Users can check their current app version and update channel in your app by accessing the update information:

```typescript
import * as Updates from 'expo-updates';

// Get current update ID
const updateId = Updates.updateId;

// Get current channel
const channel = Updates.channel;

// Check if app is using embedded update
const isEmbeddedUpdate = Updates.isEmbeddedLaunch;
```

## Troubleshooting

### Updates Not Appearing
1. Verify you're on the correct channel/branch
2. Make sure the app version matches the runtime version
3. Check that you're not in development mode (`__DEV__` is false)
4. Force quit and restart the app

### Build Issues
1. Ensure all native dependencies are properly installed
2. Check that google-services.json is in place (for Android)
3. Verify EAS credentials are set up correctly

### Update Failed Error
1. Check your internet connection
2. Verify the update URL in app.json is correct
3. Check EAS dashboard for update status

## Useful Links

- **EAS Updates Docs**: https://docs.expo.dev/eas-update/introduction/
- **Project Dashboard**: https://expo.dev/accounts/expocapstone/projects/launchpad
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/

## Environment Variables

The following environment variable is used for the API URL:
- `EXPO_PUBLIC_API_URL` - Set in eas.json for each build profile

Current production API: `https://packslight-expo-backend-production.up.railway.app/api`
