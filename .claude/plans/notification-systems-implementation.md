# Implementation Plan: Daily Check-In & Comeback Alert Notifications

## Overview
This plan outlines the implementation of two notification systems:
1. **Daily Check-In**: Remind active users to complete their daily milestone
2. **Comeback Alert**: Re-engage users who have been inactive for 3+ days

Both systems will be built using **Expo Notifications** (client-side) and **Firebase Cloud Functions** (backend scheduling).

---

## Architecture Summary

### Client-Side (Expo Frontend)
- Expo Notifications for push delivery
- Zustand store for notification state management
- Activity tracking on milestone completion
- Permission handling on app launch

### Backend (Node.js + Firebase)
- Firebase Cloud Functions for scheduled tasks
- Firestore to store user activity metadata
- FCM Admin SDK to send notifications
- Daily cron jobs to check user activity patterns

---

## Phase 1: Foundation Setup

### 1.1 Install Required Packages

**Frontend:**
```bash
npx expo install expo-notifications expo-device expo-constants
```

**Backend (already has Firebase):**
```bash
# Assuming backend is Node.js
npm install firebase-admin firebase-functions
```

### 1.2 Update app.json Configuration

Add notification configuration:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#FF6B35"
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#FF6B35",
      "androidMode": "default"
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

### 1.3 Add Firebase Config Files

**Files needed:**
- `google-services.json` (Android) - Download from Firebase Console → Project Settings
- `GoogleService-Info.plist` (iOS) - Download from Firebase Console → Project Settings

**Location:** Project root directory

---

## Phase 2: Client-Side Implementation

### 2.1 Create Notification Service

**File:** `src/services/notificationService.ts`

**Purpose:** Handle all notification operations (permissions, registration, local notifications)

**Key Functions:**
- `registerForPushNotificationsAsync()` - Request permissions & get Expo Push Token
- `addNotificationReceivedListener()` - Handle foreground notifications
- `addNotificationResponseReceivedListener()` - Handle notification taps
- `scheduleLocalNotification()` - Schedule local reminders
- `cancelAllScheduledNotifications()` - Clear pending notifications

**Implementation Details:**
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

export async function registerForPushNotificationsAsync() {
  // Check device, request permissions, get token
  // Create Android notification channels
  // Return push token
}
```

**Android Channels to Create:**
- `streaks` (Default importance) - For daily check-ins and streak reminders
- `reengagement` (Medium importance) - For comeback alerts

### 2.2 Create Notification Store

**File:** `src/store/notificationStore.ts`

**Purpose:** Manage notification state and backend sync

**State:**
```typescript
interface NotificationStore {
  pushToken: string | null;
  isRegistered: boolean;
  lastActivityTimestamp: string | null; // Track when user was last active
  notificationPreferences: {
    dailyCheckIn: boolean;
    comebackAlert: boolean;
    preferredTime: string; // e.g., "09:00"
  };

  // Actions
  initializeNotifications: () => Promise<void>;
  savePushTokenToBackend: (token: string) => Promise<void>;
  updateLastActivity: () => Promise<void>;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}
```

**Key Actions:**
1. **initializeNotifications()**: Register for notifications, save token, set up listeners
2. **savePushTokenToBackend()**: POST token to backend API
3. **updateLastActivity()**: Update timestamp when milestone completed
4. **updateNotificationPreferences()**: Allow user to opt in/out

**Integration Points:**
- Called in `App.tsx` on mount
- `updateLastActivity()` called in milestone completion flow

### 2.3 Update AuthStore for Activity Tracking

**File:** `src/store/authStore.ts`

**Changes:**
1. Add `last_activity` field to UserData interface
2. Update `last_activity` on every milestone completion
3. Call notification store's `updateLastActivity()` after updating

**Pattern:**
```typescript
// In updateMilestoneStatusLocal or after milestone completion
updateStreakData: (streakData: StreakData) => {
  set((state) => {
    const updatedUserData = {
      ...state.userData,
      streak: streakData,
      last_activity: new Date().toISOString() // Add this
    };

    // Update notification store
    useNotificationStore.getState().updateLastActivity();

    return { userData: updatedUserData };
  });
}
```

### 2.4 Update API Layer

**File:** `src/config/api.ts`

**New Functions:**
```typescript
// Save push token
export async function savePushToken(
  userId: string,
  pushToken: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/push-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pushToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to save push token');
  }
}

// Update last activity
export async function updateLastActivity(userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/activity`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      last_activity: new Date().toISOString()
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update activity');
  }
}

// Update notification preferences
export async function updateNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/notification-preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error('Failed to update notification preferences');
  }
}
```

### 2.5 Initialize Notifications in App

**File:** `App.tsx`

**Changes:**
```typescript
import { useNotificationStore } from './src/store/notificationStore';

function App() {
  const initializeNotifications = useNotificationStore(
    (state) => state.initializeNotifications
  );

  useEffect(() => {
    // Initialize notifications after auth is ready
    initializeNotifications();
  }, []);

  // ... rest of app
}
```

### 2.6 Track Activity on Milestone Completion

**Files to Update:**
- `src/components/milestonescreen/OneTimeGoal.tsx`
- `src/components/milestonescreen/RepeatableGoal.tsx`

**Changes:**
After successful milestone completion and streak update:
```typescript
// In handleComplete() function, after updateStreak() succeeds
import { useNotificationStore } from '../../store/notificationStore';

const updateLastActivity = useNotificationStore.getState().updateLastActivity;
await updateLastActivity();
```

---

## Phase 3: Backend Implementation

### 3.1 Database Schema Updates

**Collection:** `users`

**New Fields:**
```typescript
{
  push_token: string | null,           // Expo push token
  last_activity: string | null,        // ISO timestamp of last milestone completion
  last_login: string | null,           // ISO timestamp of last app launch
  notification_preferences: {
    daily_check_in: boolean,           // Default: true
    comeback_alert: boolean,           // Default: true
    preferred_time: string,            // "09:00" format
    quiet_hours_start: string | null,  // "22:00" format
    quiet_hours_end: string | null,    // "08:00" format
  },
  notification_metadata: {
    last_daily_check_in_sent: string | null,
    last_comeback_alert_sent: string | null,
    daily_check_in_count: number,
    comeback_alert_count: number,
  }
}
```

### 3.2 API Endpoints

**New Routes:**

#### 3.2.1 POST /users/:userId/push-token
Save/update user's push token
```typescript
router.post('/users/:userId/push-token', async (req, res) => {
  const { userId } = req.params;
  const { pushToken } = req.body;

  await db.collection('users').updateOne(
    { user_id: userId },
    {
      $set: {
        push_token: pushToken,
        last_login: new Date().toISOString()
      }
    }
  );

  res.json({ success: true });
});
```

#### 3.2.2 PUT /users/:userId/activity
Update user's last activity timestamp
```typescript
router.put('/users/:userId/activity', async (req, res) => {
  const { userId } = req.params;

  await db.collection('users').updateOne(
    { user_id: userId },
    {
      $set: {
        last_activity: new Date().toISOString()
      }
    }
  );

  res.json({ success: true });
});
```

#### 3.2.3 PUT /users/:userId/notification-preferences
Update notification preferences
```typescript
router.put('/users/:userId/notification-preferences', async (req, res) => {
  const { userId } = req.params;
  const preferences = req.body;

  await db.collection('users').updateOne(
    { user_id: userId },
    {
      $set: {
        notification_preferences: preferences
      }
    }
  );

  res.json({ success: true });
});
```

### 3.3 Notification Service

**File:** `backend/src/services/notificationService.ts`

**Purpose:** Send push notifications via Expo Push Service

```typescript
interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function sendPushNotification(
  pushToken: string,
  payload: NotificationPayload
) {
  const message = {
    to: pushToken,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data || {},
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error('Failed to send notification');
  }

  return await response.json();
}
```

### 3.4 Daily Check-In Scheduler

**File:** `backend/src/schedulers/dailyCheckInScheduler.ts`

**Purpose:** Run daily to send check-in reminders to active users

**Schedule:** Every hour from 8 AM to 10 PM (user's timezone)

**Logic:**
```typescript
export async function runDailyCheckInScheduler() {
  const now = new Date();
  const currentHour = now.getUTCHours(); // Adjust for timezones

  // Find users who:
  // 1. Have active streak (current_streak > 0)
  // 2. Haven't completed a milestone today
  // 3. Current time >= preferred_time + 2 hours
  // 4. Opted in to daily check-ins
  // 5. Not in quiet hours

  const users = await db.collection('users').find({
    'notification_preferences.daily_check_in': true,
    'streak.current_streak': { $gt: 0 },
    'last_activity': {
      $lt: new Date(now.setHours(0, 0, 0, 0)).toISOString() // Before today
    },
    push_token: { $ne: null },
  }).toArray();

  for (const user of users) {
    const preferredTime = user.notification_preferences.preferred_time || '09:00';
    const [preferredHour, preferredMinute] = preferredTime.split(':').map(Number);
    const reminderHour = preferredHour + 2; // 2 hours after preferred time

    // Check if current hour matches reminder hour
    if (currentHour === reminderHour) {
      // Check if already sent today
      const lastSent = user.notification_metadata?.last_daily_check_in_sent;
      if (lastSent && isSameDay(new Date(lastSent), now)) {
        continue; // Already sent today
      }

      // Send notification
      await sendPushNotification(user.push_token, {
        title: `🔥 Don't break your ${user.streak.current_streak} day streak!`,
        body: 'Complete today\'s goal to keep the streak alive.',
        data: { type: 'daily_check_in', screen: 'Home' },
      });

      // Update metadata
      await db.collection('users').updateOne(
        { user_id: user.user_id },
        {
          $set: {
            'notification_metadata.last_daily_check_in_sent': now.toISOString(),
          },
          $inc: {
            'notification_metadata.daily_check_in_count': 1,
          },
        }
      );
    }
  }
}
```

**Cron Schedule:** Every hour
```typescript
// Using node-cron or Firebase Cloud Functions scheduled trigger
cron.schedule('0 * * * *', runDailyCheckInScheduler);
```

### 3.5 Comeback Alert Scheduler

**File:** `backend/src/schedulers/comebackAlertScheduler.ts`

**Purpose:** Run daily to send comeback alerts to inactive users

**Schedule:** Once daily at 10 AM UTC

**Logic:**
```typescript
export async function runComebackAlertScheduler() {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  // Find users who:
  // 1. Last activity was 3+ days ago
  // 2. Haven't received comeback alert in past 7 days
  // 3. Opted in to comeback alerts
  // 4. Have incomplete milestones

  const users = await db.collection('users').find({
    'notification_preferences.comeback_alert': true,
    'last_activity': {
      $lt: threeDaysAgo.toISOString()
    },
    push_token: { $ne: null },
  }).toArray();

  for (const user of users) {
    // Check if already sent in past 7 days
    const lastSent = user.notification_metadata?.last_comeback_alert_sent;
    if (lastSent) {
      const daysSinceLastAlert = (now.getTime() - new Date(lastSent).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastAlert < 7) {
        continue; // Don't spam
      }
    }

    // Count incomplete milestones
    const incompleteMilestones = await countIncompleteMilestones(user.user_id);

    if (incompleteMilestones === 0) {
      continue; // No reason to come back
    }

    // Calculate days inactive
    const lastActivity = new Date(user.last_activity);
    const daysInactive = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    // Send notification
    await sendPushNotification(user.push_token, {
      title: '👋 We Miss You!',
      body: `You have ${incompleteMilestones} incomplete milestones waiting. Ready to get back on track?`,
      data: {
        type: 'comeback_alert',
        screen: 'Home',
        daysInactive: daysInactive.toString(),
      },
    });

    // Update metadata
    await db.collection('users').updateOne(
      { user_id: user.user_id },
      {
        $set: {
          'notification_metadata.last_comeback_alert_sent': now.toISOString(),
        },
        $inc: {
          'notification_metadata.comeback_alert_count': 1,
        },
      }
    );
  }
}

async function countIncompleteMilestones(userId: string): Promise<number> {
  const userData = await db.collection('users').findOne({ user_id: userId });
  if (!userData?.dreams) return 0;

  let count = 0;
  for (const dream of userData.dreams) {
    if (dream.roadmap?.milestones) {
      count += dream.roadmap.milestones.filter(
        (m: any) => m.status !== 'completed'
      ).length;
    }
  }

  return count;
}
```

**Cron Schedule:** Daily at 10 AM UTC
```typescript
cron.schedule('0 10 * * *', runComebackAlertScheduler);
```

---

## Phase 4: Settings UI (Optional)

### 4.1 Add Notification Preferences to Settings

**File:** `src/screens/SettingsScreen.tsx`

**New Section:**
```typescript
{/* Notification Preferences Section */}
<View style={styles.section}>
  <Text style={[styles.sectionTitle, { color: themeColors.text_primary }]}>
    Notifications
  </Text>
  <View style={[styles.card, { backgroundColor: themeColors.bg_secondary, borderColor: themeColors.border }]}>
    <SettingRow
      icon="🔔"
      label="Daily Check-In"
      value=""
      isSwitch
      switchValue={notificationPrefs.dailyCheckIn}
      onSwitchChange={(value) => updatePreference('dailyCheckIn', value)}
    />
    <SettingRow
      icon="👋"
      label="Comeback Reminders"
      value=""
      isSwitch
      switchValue={notificationPrefs.comebackAlert}
      onSwitchChange={(value) => updatePreference('comebackAlert', value)}
    />
    <SettingRow
      icon="⏰"
      label="Preferred Time"
      value={notificationPrefs.preferredTime}
      showArrow
      onPress={() => showTimePickerModal()}
    />
  </View>
</View>
```

---

## Phase 5: Testing Strategy

### 5.1 Local Testing

**Daily Check-In:**
1. Set user's last_activity to yesterday
2. Set preferred_time to current time - 2 hours
3. Run scheduler manually
4. Verify notification received

**Comeback Alert:**
1. Set user's last_activity to 4 days ago
2. Run scheduler manually
3. Verify notification received

### 5.2 Production Testing

**Tools:**
- Expo Push Notification Tool: https://expo.dev/notifications
- Firebase Cloud Functions logs
- User activity dashboard

**Metrics to Track:**
- Notification delivery rate
- Open rate (taps)
- Re-engagement rate (users who return after comeback alert)
- Daily check-in conversion rate

---

## Phase 6: Deployment

### 6.1 Frontend Deployment

1. Run `npx expo prebuild` to generate native projects
2. Add `google-services.json` and `GoogleService-Info.plist`
3. Build with EAS:
   ```bash
   eas build --platform android
   eas build --platform ios
   ```

### 6.2 Backend Deployment

1. Deploy notification service
2. Deploy schedulers with cron jobs
3. Update environment variables:
   - `EXPO_PUSH_TOKEN_URL`
   - Firebase credentials

### 6.3 Database Migration

Run migration script to add new fields to existing users:
```javascript
db.users.updateMany({}, {
  $set: {
    push_token: null,
    last_activity: null,
    last_login: null,
    notification_preferences: {
      daily_check_in: true,
      comeback_alert: true,
      preferred_time: '09:00',
      quiet_hours_start: null,
      quiet_hours_end: null,
    },
    notification_metadata: {
      last_daily_check_in_sent: null,
      last_comeback_alert_sent: null,
      daily_check_in_count: 0,
      comeback_alert_count: 0,
    }
  }
});
```

---

## Success Criteria

### Daily Check-In
- ✅ Users receive reminder 2 hours after preferred time if no activity
- ✅ Only sent once per day
- ✅ Only sent to users with active streaks
- ✅ Respects user opt-out preferences
- ✅ Notification navigates to Home screen on tap

### Comeback Alert
- ✅ Users receive alert after 3 days of inactivity
- ✅ Only sent once per week maximum
- ✅ Only sent if user has incomplete milestones
- ✅ Respects user opt-out preferences
- ✅ Shows number of incomplete milestones
- ✅ Notification navigates to Home screen on tap

---

## Risk Mitigation

### 1. Notification Spam
**Risk:** Users receive too many notifications
**Mitigation:**
- Max 1 daily check-in per day
- Max 1 comeback alert per week
- Quiet hours support
- Easy opt-out in settings

### 2. Token Expiration
**Risk:** Push tokens become invalid over time
**Mitigation:**
- Refresh token on every app launch
- Handle token errors gracefully
- Re-register if notification fails

### 3. Timezone Issues
**Risk:** Notifications sent at wrong times due to timezone
**Mitigation:**
- Store user timezone in preferences
- Convert to UTC for storage
- Use user's local time for scheduling

### 4. Battery Drain
**Risk:** Background tasks drain battery
**Mitigation:**
- Use server-side scheduling (Firebase Cloud Functions)
- No client-side background tasks
- Minimal client-side processing

---

## Future Enhancements

1. **Smart Timing**: Use ML to find best notification time per user
2. **A/B Testing**: Test different notification copy
3. **Rich Notifications**: Add images, action buttons
4. **Notification History**: Show past notifications in-app
5. **Personalization**: Customize based on user behavior patterns
6. **Notification Grouping**: Bundle multiple notifications
7. **Silent Notifications**: Data-only for background sync

---

## Files to Create/Modify

### New Files
- `src/services/notificationService.ts`
- `src/store/notificationStore.ts`
- `backend/src/services/notificationService.ts`
- `backend/src/schedulers/dailyCheckInScheduler.ts`
- `backend/src/schedulers/comebackAlertScheduler.ts`

### Modified Files
- `app.json` - Add notification config
- `src/store/authStore.ts` - Add last_activity tracking
- `src/config/api.ts` - Add notification API functions
- `App.tsx` - Initialize notifications
- `src/components/milestonescreen/OneTimeGoal.tsx` - Track activity
- `src/components/milestonescreen/RepeatableGoal.tsx` - Track activity
- `src/screens/SettingsScreen.tsx` - Add notification preferences (optional)

### Firebase Files Needed
- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)

---

## Estimated Timeline

- **Phase 1 (Foundation Setup)**: 2-3 hours
- **Phase 2 (Client-Side)**: 4-6 hours
- **Phase 3 (Backend)**: 6-8 hours
- **Phase 4 (Settings UI)**: 2-3 hours (optional)
- **Phase 5 (Testing)**: 3-4 hours
- **Phase 6 (Deployment)**: 2-3 hours

**Total:** ~20-27 hours of development time

---

## Implementation Order

1. ✅ Foundation setup (packages, config)
2. ✅ Client notification service
3. ✅ Notification store
4. ✅ Activity tracking integration
5. ✅ Backend API endpoints
6. ✅ Backend notification service
7. ✅ Daily check-in scheduler
8. ✅ Comeback alert scheduler
9. ✅ Settings UI (optional)
10. ✅ Testing & deployment

---

This plan provides a complete roadmap for implementing both notification systems with all necessary code, architecture decisions, and deployment steps.
