# Firebase + Expo Push Notifications Setup Guide

## Overview

This guide covers setting up push notifications using **Expo's notification system** with **Firebase Cloud Messaging (FCM)** backend.

## Architecture

1. **Expo Notifications** - Handles local notification delivery and user permissions
2. **Expo Push Token** - Device token for Expo's push notification service
3. **Firebase Cloud Messaging** - Backend service to send notifications
4. **Your Backend** - Stores push tokens and triggers notifications via FCM Admin SDK

## Step 1: Install Required Packages

```bash
npx expo install expo-notifications expo-device expo-constants
```

## Step 2: Configure app.json

Add the following to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#FF6B35",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    },
    "android": {
      "googleServicesFile": "./google-services.json",
      "useNextNotificationsApi": true
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

## Step 3: Firebase Setup

### A. Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** → **Cloud Messaging**
4. Under **Cloud Messaging API (V1)**, enable the API if not already enabled
5. Download configuration files:
   - **Android**: `google-services.json` → Place in project root
   - **iOS**: `GoogleService-Info.plist` → Place in project root

### B. Get FCM Server Key

1. In Firebase Console → **Project Settings** → **Cloud Messaging**
2. Copy the **Server Key** (for legacy API) or use **Service Account** for V1 API
3. Store this securely in your backend environment variables

## Step 4: Create Notification Service

Create `src/services/notificationService.ts`:

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushToken {
  token: string;
  type: 'expo' | 'fcm';
}

/**
 * Request notification permissions from user
 */
export async function registerForPushNotificationsAsync(): Promise<PushToken | null> {
  let token: string | undefined;

  // Check if running on physical device
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token - permission denied');
    return null;
  }

  // Get Expo Push Token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ??
                     Constants.easConfig?.projectId;

    if (!projectId) {
      throw new Error('Project ID not found');
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Expo Push Token:', token);
  } catch (error) {
    console.error('Error getting Expo push token:', error);
    return null;
  }

  // Android-specific channel configuration
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    // Create additional channels for different notification types
    await Notifications.setNotificationChannelAsync('milestones', {
      name: 'Milestone Completions',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#14B8A6',
      sound: 'milestone_sound.wav',
    });

    await Notifications.setNotificationChannelAsync('streaks', {
      name: 'Streak Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150, 150, 150],
      lightColor: '#FF6B35',
      sound: 'default',
    });
  }

  return {
    token,
    type: 'expo',
  };
}

/**
 * Add notification received listener (when app is in foreground)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps notification)
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  triggerSeconds?: number
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
      badge: 1,
    },
    trigger: triggerSeconds
      ? { seconds: triggerSeconds }
      : null, // null = immediate
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get notification badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications
 */
export async function dismissAllNotifications() {
  await Notifications.dismissAllNotificationsAsync();
}
```

## Step 5: Backend Implementation (Node.js + Firebase Admin)

### A. Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### B. Initialize Firebase Admin

```typescript
// backend/src/services/firebaseAdmin.ts
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const messaging = admin.messaging();
```

### C. Send Notifications Function

```typescript
// backend/src/services/notificationService.ts
import { messaging } from './firebaseAdmin';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

/**
 * Send notification to a single device
 */
export async function sendPushNotification(
  pushToken: string,
  payload: NotificationPayload
) {
  try {
    // For Expo Push Tokens, use Expo's push service
    if (pushToken.startsWith('ExponentPushToken')) {
      return await sendExpoNotification(pushToken, payload);
    }

    // For FCM tokens
    const message = {
      token: pushToken,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    console.log('Successfully sent FCM notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Send notification via Expo Push Service
 */
async function sendExpoNotification(
  expoPushToken: string,
  payload: NotificationPayload
) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data || {},
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  const result = await response.json();
  console.log('Expo notification result:', result);
  return result;
}

/**
 * Send notification to multiple devices
 */
export async function sendMulticastNotification(
  pushTokens: string[],
  payload: NotificationPayload
) {
  const expoTokens = pushTokens.filter(t => t.startsWith('ExponentPushToken'));
  const fcmTokens = pushTokens.filter(t => !t.startsWith('ExponentPushToken'));

  const results = [];

  // Send to Expo tokens
  if (expoTokens.length > 0) {
    const expoMessages = expoTokens.map(token => ({
      to: token,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    }));

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expoMessages),
    });

    results.push(await expoResponse.json());
  }

  // Send to FCM tokens
  if (fcmTokens.length > 0) {
    const message = {
      tokens: fcmTokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };

    const fcmResponse = await messaging.sendMulticast(message);
    results.push(fcmResponse);
  }

  return results;
}
```

## Step 6: Integrate into Your App

### A. Create Notification Store

```typescript
// src/store/notificationStore.ts
import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from '../services/notificationService';
import { useAuthStore } from './authStore';

interface NotificationStore {
  pushToken: string | null;
  notification: Notifications.Notification | null;
  isRegistered: boolean;
  initializeNotifications: () => Promise<void>;
  savePushTokenToBackend: (token: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  pushToken: null,
  notification: null,
  isRegistered: false,

  initializeNotifications: async () => {
    try {
      // Register for push notifications
      const tokenData = await registerForPushNotificationsAsync();

      if (tokenData) {
        set({ pushToken: tokenData.token, isRegistered: true });

        // Save token to backend
        await get().savePushTokenToBackend(tokenData.token);
      }

      // Add listeners
      addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
        set({ notification });
      });

      addNotificationResponseReceivedListener((response) => {
        console.log('Notification tapped:', response);
        // Handle navigation based on notification data
        const data = response.notification.request.content.data;
        // Navigate to appropriate screen based on data
      });
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  },

  savePushTokenToBackend: async (token: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      // Call your backend API to save the token
      await fetch('YOUR_BACKEND_URL/api/users/push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({ pushToken: token }),
      });
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  },
}));
```

### B. Initialize in App.tsx

```typescript
// App.tsx
import { useEffect } from 'react';
import { useNotificationStore } from './store/notificationStore';

function App() {
  const initializeNotifications = useNotificationStore(
    (state) => state.initializeNotifications
  );

  useEffect(() => {
    initializeNotifications();
  }, []);

  return (
    // Your app components
  );
}
```

## Step 7: Update EAS Configuration

Add to `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Step 8: Testing Notifications

### Test with Expo Push Notification Tool

1. Go to https://expo.dev/notifications
2. Enter your Expo Push Token
3. Send a test notification

### Test with cURL

```bash
curl -H "Content-Type: application/json" -X POST https://exp.host/--/api/v2/push/send -d '{
  "to": "ExponentPushToken[YOUR_TOKEN_HERE]",
  "title": "Test Notification",
  "body": "This is a test!",
  "data": { "type": "test" }
}'
```

## Common Notification Use Cases

### 1. Streak Reminder
```typescript
await sendPushNotification(userToken, {
  title: '🔥 Keep your streak alive!',
  body: "You haven't logged in today. Don't break your 5-day streak!",
  data: { type: 'streak_reminder', screen: 'Home' },
});
```

### 2. Milestone Completion
```typescript
await sendPushNotification(userToken, {
  title: '🎉 Milestone Completed!',
  body: 'You completed "Learn React Native". Share your win!',
  data: { type: 'milestone_complete', milestoneId: '123' },
});
```

### 3. Community Engagement
```typescript
await sendPushNotification(userToken, {
  title: '💬 New Permission Granted',
  body: 'Someone gave you permission to keep going!',
  data: { type: 'permission', victoryId: '456' },
});
```

## Troubleshooting

### Android Issues
- Ensure `google-services.json` is in project root
- Run `npx expo prebuild --clean` after adding plugins
- Check Android notification channels are created

### iOS Issues
- Ensure `GoogleService-Info.plist` is in project root
- Enable Push Notifications capability in Xcode
- Test on physical device (notifications don't work in simulator)

### Permission Issues
- Always request permissions on app startup or login
- Handle permission denial gracefully
- Provide clear messaging about why notifications are beneficial

## Additional Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Expo Push Notification Tool](https://expo.dev/notifications)
