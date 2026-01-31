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
  type: 'expo';
}

/**
 * Request notification permissions from user and get Expo Push Token
 */
export async function registerForPushNotificationsAsync(): Promise<PushToken | null> {
  let token: string | undefined;

  // Check if running on physical device
  if (!Device.isDevice) {
    console.warn('[Notifications] Push notifications require a physical device');
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
    console.warn('[Notifications] Failed to get push token - permission denied');
    return null;
  }

  // Get Expo Push Token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.warn('[Notifications] Project ID not found, using default configuration');
    }

    const pushTokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    token = pushTokenData.data;
    console.log('[Notifications] Expo Push Token:', token);
  } catch (error) {
    console.error('[Notifications] Error getting Expo push token:', error);
    return null;
  }

  // Android-specific channel configuration
  if (Platform.OS === 'android') {
    // Default channel
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    // Streak notifications channel
    await Notifications.setNotificationChannelAsync('streaks', {
      name: 'Streak Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150, 150, 150],
      lightColor: '#FF6B35',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    // Re-engagement channel
    await Notifications.setNotificationChannelAsync('reengagement', {
      name: 'Comeback Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 200, 200],
      lightColor: '#14B8A6',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    console.log('[Notifications] Android notification channels created');
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
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps notification)
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
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
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
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
export async function cancelAllScheduledNotifications(): Promise<void> {
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
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications
 */
export async function dismissAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

/**
 * Remove all notification listeners
 */
export function removeAllNotificationListeners(): void {
  Notifications.removeAllNotificationListeners();
}
