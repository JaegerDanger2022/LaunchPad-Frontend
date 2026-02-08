import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from '../services/notificationService';
import { savePushToken, updateLastActivity as updateLastActivityAPI, sendWelcomeNotification } from '../config/api';
import { useAuthStore } from './authStore';

export interface NotificationPreferences {
  dailyCheckIn: boolean;
  comebackAlert: boolean;
  preferredTime: string; // "09:00" format
}

interface NotificationStore {
  pushToken: string | null;
  isRegistered: boolean;
  lastActivityTimestamp: string | null;
  notificationPreferences: NotificationPreferences;

  // Actions
  initializeNotifications: () => Promise<void>;
  savePushTokenToBackend: (token: string) => Promise<void>;
  updateLastActivity: () => Promise<void>;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  handleNotificationReceived: (notification: Notifications.Notification) => void;
  handleNotificationResponse: (response: Notifications.NotificationResponse) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  pushToken: null,
  isRegistered: false,
  lastActivityTimestamp: null,
  notificationPreferences: {
    dailyCheckIn: true,
    comebackAlert: true,
    preferredTime: '09:00',
  },

  initializeNotifications: async () => {
    try {
      console.log('[NotificationStore] Initializing notifications...');

      // Register for push notifications
      const tokenData = await registerForPushNotificationsAsync();

      if (tokenData) {
        console.log('[NotificationStore] Push token obtained:', tokenData.token);
        set({ pushToken: tokenData.token, isRegistered: true });

        // Save token to backend
        await get().savePushTokenToBackend(tokenData.token);

        // Send welcome notification for new signups (after token is saved)
        const authState = useAuthStore.getState();
        if (authState.isNewSignup && authState.user?.uid) {
          console.log('[NotificationStore] New signup detected, sending welcome notification');
          sendWelcomeNotification(authState.user.uid);
          useAuthStore.setState({ isNewSignup: false });
        }
      } else {
        console.warn('[NotificationStore] Failed to obtain push token');
      }

      // Add listeners
      addNotificationReceivedListener((notification) => {
        console.log('[NotificationStore] Notification received:', notification);
        get().handleNotificationReceived(notification);
      });

      addNotificationResponseReceivedListener((response) => {
        console.log('[NotificationStore] Notification tapped:', response);
        get().handleNotificationResponse(response);
      });

      console.log('[NotificationStore] Notifications initialized successfully');
    } catch (error) {
      console.error('[NotificationStore] Failed to initialize notifications:', error);
    }
  },

  savePushTokenToBackend: async (token: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        console.warn('[NotificationStore] No user logged in, skipping token save');
        return;
      }

      console.log('[NotificationStore] Saving push token to backend for user:', user.uid);
      await savePushToken(user.uid, token);
      console.log('[NotificationStore] Push token saved successfully');
    } catch (error) {
      console.error('[NotificationStore] Failed to save push token:', error);
    }
  },

  updateLastActivity: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        console.warn('[NotificationStore] No user logged in, skipping activity update');
        return;
      }

      const timestamp = new Date().toISOString();
      set({ lastActivityTimestamp: timestamp });

      console.log('[NotificationStore] Updating last activity for user:', user.uid);
      await updateLastActivityAPI(user.uid);
      console.log('[NotificationStore] Last activity updated successfully');
    } catch (error) {
      console.error('[NotificationStore] Failed to update last activity:', error);
    }
  },

  updateNotificationPreferences: async (prefs: Partial<NotificationPreferences>) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        console.warn('[NotificationStore] No user logged in, skipping preferences update');
        return;
      }

      const updatedPrefs = {
        ...get().notificationPreferences,
        ...prefs,
      };

      set({ notificationPreferences: updatedPrefs });

      console.log('[NotificationStore] Updating notification preferences:', updatedPrefs);
      // TODO: Call API to save preferences to backend
      // await updateNotificationPreferencesAPI(user.uid, updatedPrefs);
      console.log('[NotificationStore] Notification preferences updated');
    } catch (error) {
      console.error('[NotificationStore] Failed to update notification preferences:', error);
    }
  },

  handleNotificationReceived: (notification: Notifications.Notification) => {
    // Handle notification received while app is in foreground
    const data = notification.request.content.data;
    console.log('[NotificationStore] Handling foreground notification:', data);

    // You can show custom in-app alerts here or update app state
  },

  handleNotificationResponse: (response: Notifications.NotificationResponse) => {
    // Handle notification tap - navigate to appropriate screen
    const data = response.notification.request.content.data;
    console.log('[NotificationStore] Handling notification tap:', data);

    // Navigation based on notification type
    if (data.type === 'daily_check_in' || data.type === 'comeback_alert') {
      // Navigate to Home screen (or specific milestone)
      // This will be handled by the navigation system
      console.log('[NotificationStore] Should navigate to:', data.screen || 'Home');
    }
  },
}));
