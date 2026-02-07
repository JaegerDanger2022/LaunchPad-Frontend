# Notification System Implementation Guide

## Overview
This document outlines the notification system that sends daily nudges and inactivity reminders to users.

## Frontend Implementation ✅ COMPLETE

### 1. Signup Flow
- **New Screen**: `NotificationTimeScreen.tsx` - Allows users to select their preferred notification time during signup
- **Flow**: Signup → Timezone → **NotificationTime** → Pledge
- Users can enable/disable daily reminders and choose from 15 time slots (6 AM - 9 PM)
- Default: Enabled at 9:00 AM

### 2. Settings Integration
- **Component**: `NotificationTimePickerModal.tsx` - Modal for changing notification preferences
- **Settings Screen**: Added "Daily Reminders" row under Preferences section
- Users can toggle notifications on/off and change the time at any point

### 3. API & State Management
- **Updated Files**:
  - `src/config/api.ts` - Added `updateUserNotificationPreferences()` function
  - `src/store/authStore.ts` - Updated `signUp()` to accept `notificationTime` parameter
  - `App.tsx` - Added `NotificationTimeScreen` to navigation stack
- **Data Flow**: Notification preferences are stored in user document as `pref_notification_time` (24-hour format, e.g., "09:00")

---

## Backend Implementation Requirements ⚠️ NEEDED

### 1. Database Schema Updates

#### User Collection
Add the following field to the user document:

```python
{
  "pref_notification_time": Optional[str],  # Format: "HH:MM" (24-hour), null if disabled
  "last_activity": Optional[str],  # ISO timestamp of last milestone completion
  # ... existing fields
}
```

**Examples**:
- `"pref_notification_time": "09:00"` - Daily reminder at 9 AM in user's timezone
- `"pref_notification_time": null` - Notifications disabled
- `"last_activity": "2025-01-15T14:30:00Z"` - Last milestone marked complete

### 2. API Endpoints

#### 2.1 User Registration
**Endpoint**: `POST /api/users/register`

Update the existing registration endpoint to accept optional notification preference:

```python
class UserRegistrationRequest(BaseModel):
    user_id: str
    firstname: str
    lastname: str
    email: str
    pref_timezone: Optional[str] = None
    pref_notification_time: Optional[str] = None  # NEW FIELD
```

#### 2.2 Update Notification Preferences
**Endpoint**: `PATCH /api/users/{user_id}/notification-preferences`

```python
class NotificationPreferencesUpdate(BaseModel):
    pref_notification_time: Optional[str]  # null to disable, "HH:MM" to enable

@router.patch("/users/{user_id}/notification-preferences")
async def update_notification_preferences(
    user_id: str,
    preferences: NotificationPreferencesUpdate
):
    """Update user's notification time preference"""
    # Validate time format if provided
    if preferences.pref_notification_time:
        validate_time_format(preferences.pref_notification_time)  # Should be "HH:MM"

    # Update user document
    await users_collection.update_one(
        {"user_id": user_id},
        {"$set": {"pref_notification_time": preferences.pref_notification_time}}
    )

    return {"success": True, "message": "Notification preferences updated"}
```

#### 2.3 Update Last Activity Timestamp
**Automatic Update**: When a milestone is marked as complete

Update the existing milestone completion endpoint to set `last_activity`:

```python
@router.patch("/milestones/{milestone_id}/complete")
async def complete_milestone(milestone_id: str, user_id: str):
    # ... existing milestone completion logic ...

    # Update last_activity timestamp
    await users_collection.update_one(
        {"user_id": user_id},
        {"$set": {"last_activity": datetime.utcnow().isoformat() + "Z"}}
    )

    return {"success": True}
```

### 3. Notification Service (New)

#### 3.1 Background Worker
Create a background job that runs hourly (or more frequently) to check for users who need notifications.

**File**: `services/notification_service.py`

```python
from datetime import datetime, timedelta
import pytz
from typing import List, Dict

class NotificationService:
    def __init__(self, users_collection, notification_provider):
        self.users_collection = users_collection
        self.notification_provider = notification_provider

    async def process_notifications(self):
        """Main entry point - check and send all due notifications"""
        current_time = datetime.utcnow()

        # 1. Send daily nudges
        await self.send_daily_nudges(current_time)

        # 2. Send inactivity reminders
        await self.send_inactivity_reminders(current_time)

    async def send_daily_nudges(self, current_time: datetime):
        """Send daily nudges to users whose notification time has arrived"""
        # Query users who:
        # - Have notifications enabled (pref_notification_time is not null)
        # - Have active dreams
        # - Their preferred time matches current time (accounting for timezone)

        users = await self.users_collection.find({
            "pref_notification_time": {"$ne": None},
            "dreams": {"$elemMatch": {"status": "active"}}
        }).to_list(length=None)

        for user in users:
            if self.is_notification_time(user, current_time):
                await self.send_daily_nudge(user)

    def is_notification_time(self, user: Dict, current_time: datetime) -> bool:
        """Check if current time matches user's preferred notification time"""
        # Convert user's preferred time to UTC based on their timezone
        user_tz = pytz.timezone(user.get("pref_timezone", "UTC"))
        pref_time = user.get("pref_notification_time")  # e.g., "09:00"

        if not pref_time:
            return False

        # Parse preferred time
        hour, minute = map(int, pref_time.split(":"))

        # Get current time in user's timezone
        user_local_time = current_time.astimezone(user_tz)

        # Check if it's within the notification window (e.g., ±5 minutes)
        return (
            user_local_time.hour == hour and
            abs(user_local_time.minute - minute) <= 5
        )

    async def send_inactivity_reminders(self, current_time: datetime):
        """Send reminders to users inactive for 2+ days"""
        # Calculate threshold (2 days ago)
        threshold = current_time - timedelta(days=2)

        # Query users who:
        # - Have active dreams
        # - Last activity was before threshold (or never)
        # - Have notifications enabled

        users = await self.users_collection.find({
            "$or": [
                {"last_activity": {"$lt": threshold.isoformat() + "Z"}},
                {"last_activity": None}
            ],
            "pref_notification_time": {"$ne": None},
            "dreams": {"$elemMatch": {"status": "active"}}
        }).to_list(length=None)

        for user in users:
            # Only send if we haven't sent one recently (e.g., within last 24h)
            if not self.sent_reminder_recently(user):
                await self.send_inactivity_reminder(user)

    def sent_reminder_recently(self, user: Dict) -> bool:
        """Check if we've sent an inactivity reminder in the last 24 hours"""
        last_reminder = user.get("last_inactivity_reminder")
        if not last_reminder:
            return False

        last_reminder_time = datetime.fromisoformat(last_reminder.replace("Z", "+00:00"))
        return datetime.utcnow() - last_reminder_time < timedelta(hours=24)

    async def send_daily_nudge(self, user: Dict):
        """Send daily nudge notification"""
        message = {
            "title": "Time to make progress! 🚀",
            "body": "Your dreams are waiting. Complete your next milestone today!",
            "data": {"type": "daily_nudge"}
        }

        await self.notification_provider.send(user["user_id"], message)

        # Update last notification timestamp (optional tracking)
        await self.users_collection.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"last_daily_nudge": datetime.utcnow().isoformat() + "Z"}}
        )

    async def send_inactivity_reminder(self, user: Dict):
        """Send inactivity reminder notification"""
        message = {
            "title": "We miss you! 🌟",
            "body": "You haven't checked off any milestones in 2 days. Don't break your momentum!",
            "data": {"type": "inactivity_reminder"}
        }

        await self.notification_provider.send(user["user_id"], message)

        # Track last inactivity reminder
        await self.users_collection.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"last_inactivity_reminder": datetime.utcnow().isoformat() + "Z"}}
        )
```

#### 3.2 Notification Provider Interface
You'll need to implement the actual notification sending logic based on your chosen provider (e.g., Firebase Cloud Messaging, OneSignal, etc.):

```python
class NotificationProvider:
    async def send(self, user_id: str, message: Dict):
        """Send push notification to user"""
        # Implementation depends on your notification service
        # Example for FCM:
        # - Get user's FCM token from database
        # - Send notification via FCM API
        pass
```

#### 3.3 Scheduler Setup
Set up a cron job or background task to run the notification service:

**Option 1: APScheduler (Python)**
```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()
scheduler.add_job(
    notification_service.process_notifications,
    'interval',
    minutes=5  # Check every 5 minutes
)
scheduler.start()
```

**Option 2: Celery (Distributed Tasks)**
```python
from celery import Celery

celery_app = Celery('notifications')

@celery_app.task
def process_notifications():
    asyncio.run(notification_service.process_notifications())

# Schedule in celerybeat
celery_app.conf.beat_schedule = {
    'process-notifications': {
        'task': 'tasks.process_notifications',
        'schedule': 300.0,  # Every 5 minutes
    },
}
```

### 4. Testing Checklist

#### Manual Testing
- [ ] Register new user with notifications enabled
- [ ] Verify `pref_notification_time` is saved in database
- [ ] Update notification time in Settings
- [ ] Disable notifications in Settings
- [ ] Mark a milestone complete and verify `last_activity` updates
- [ ] Wait 2 days without activity and verify inactivity reminder is sent

#### Edge Cases
- [ ] User has no timezone set (fallback to UTC)
- [ ] User has no active dreams (should not send notifications)
- [ ] User disables notifications mid-week
- [ ] User changes timezone (notifications should adjust to new timezone)
- [ ] User deletes all dreams (should stop notifications)

---

## Notification Message Templates

### Daily Nudge
**Time**: User's preferred time (e.g., 9:00 AM in their timezone)
**Frequency**: Once per day

**Messages** (rotate randomly):
1. "Time to make progress! 🚀 Your dreams are waiting."
2. "Good morning! Ready to crush your next milestone? 💪"
3. "Let's keep the momentum going! Complete a task today. ✨"
4. "Your future self will thank you. What will you accomplish today? 🌟"

### Inactivity Reminder
**Trigger**: No milestone marked complete in 2+ days
**Frequency**: Once per 24 hours (while inactive)

**Messages**:
1. "We miss you! 🌟 You haven't checked off any milestones in 2 days."
2. "Don't break your momentum! It's been 2 days since your last win. 🔥"
3. "Your dreams need you! Come back and make progress today. 💙"

---

## Security & Privacy Considerations

1. **User Consent**: Notifications are opt-in during signup and can be disabled anytime
2. **Data Privacy**: Store only essential notification data (time preference, last activity)
3. **Rate Limiting**: Don't spam users - one daily nudge max, one inactivity reminder per 24h
4. **Timezone Accuracy**: Always convert times using user's stored timezone
5. **Notification Tokens**: Store device tokens securely and remove on logout

---

## Deployment Notes

1. Ensure notification worker is running in production
2. Set up monitoring for notification delivery rates
3. Log notification sends for debugging (but don't log user data)
4. Consider A/B testing different message templates for engagement
5. Add analytics to track:
   - Notification open rates
   - User retention after notifications
   - Opt-out rates

---

## Future Enhancements

- [ ] Custom notification messages based on dream category
- [ ] Smart timing (machine learning to find best time for each user)
- [ ] Weekly recap notifications
- [ ] Streak about to break warnings
- [ ] Milestone deadline reminders
- [ ] Social features (friend completed a milestone)
