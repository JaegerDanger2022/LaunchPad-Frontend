# Streak Backend Implementation Specification

## Overview
This document describes the backend endpoint implementation needed to support the streak feature. The app will automatically recalculate streaks when users open the app, allowing them to see immediate changes if they've missed days (without needing to complete another milestone).

---

## GET /users/{userId}/streak

### Purpose
Fetch the current streak data for a user, with automatic recalculation if necessary. This endpoint should check if the user's streak needs to be recalculated (e.g., if a day has passed since the last completion) and update it if needed.

### Request
**Method:** `GET`
**URL:** `/users/{userId}/streak`
**Authentication:** Required (user must own the streak data)

**Query Parameters:** None

**Headers:**
```
Content-Type: application/json
```

### Response (Success - 200 OK)

```json
{
  "success": true,
  "message": "Streak fetched successfully",
  "streak_data": {
    "current_streak": 5,
    "longest_streak": 8,
    "last_completion_date": "2026-01-28T15:30:00Z",
    "total_completions": 42,
    "streak_freeze_available": false,
    "milestone_achievements": {
      "three_day_count": 3,
      "seven_day_count": 1,
      "thirty_day_count": 0
    }
  },
  "streak_broken": false,
  "recalculated": false
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the request succeeded |
| `message` | string | Human-readable message about the operation |
| `streak_data` | StreakData object | The current streak data (see schema below) |
| `streak_broken` | boolean | **NEW: Set to `true` if streak was broken during this fetch** (user missed a day since last completion) |
| `recalculated` | boolean | **NEW: Set to `true` if streak was recalculated** (day changed but streak was reset or continued) |

### StreakData Schema

```json
{
  "current_streak": 5,              // Days in current streak (0 if broken)
  "longest_streak": 8,              // All-time best streak
  "last_completion_date": "2026-01-28T15:30:00Z",  // ISO timestamp of last streak-eligible completion
  "total_completions": 42,          // Total count of streak-eligible milestones completed
  "streak_freeze_available": false, // Has one free missed day available
  "milestone_achievements": {
    "three_day_count": 3,           // Times reached 3-day streak
    "seven_day_count": 1,           // Times reached 7-day streak
    "thirty_day_count": 0           // Times reached 30-day streak
  }
}
```

### Response (Error - 400/500)

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "streak_data": null,
  "streak_broken": false,
  "recalculated": false
}
```

### Error Cases

| Status | Scenario | Response |
|--------|----------|----------|
| 404 | User not found | `"success": false, "message": "User not found"` |
| 400 | Invalid userId format | `"success": false, "message": "Invalid user ID"` |
| 401 | Unauthorized (not owner) | `"success": false, "message": "Unauthorized"` |
| 500 | Server error | `"success": false, "message": "Internal server error"` |

---

## Recalculation Logic (Backend Implementation)

When `GET /users/{userId}/streak` is called, the backend should:

1. **Fetch the user's current streak data from database**
   - Get: `current_streak`, `last_completion_date`, `longest_streak`, etc.

2. **Calculate days difference between now and last_completion_date**
   ```
   now = current_time_in_user_timezone
   last = last_completion_date_in_user_timezone
   days_diff = (now - last).days
   ```

3. **Determine if recalculation is needed**
   - If `days_diff == 0`: Same day, no change needed. Return current streak.
   - If `days_diff == 1`: Next day, no recalculation needed yet (streak continues as-is).
   - If `days_diff > 1`: Missed one or more days. **RECALCULATE NEEDED.**

4. **Handle missed days (days_diff > 1)**
   ```
   if (days_diff > 1) {
     if (user.streak_freeze_available) {
       // User has a freeze power-up - use it
       user.streak_freeze_available = false
       // Streak continues, don't break
       // Still set last_completion_date = now for next calculation
       recalculated = true
       streak_broken = false
     } else {
       // User missed day(s) - streak resets to 0
       user.current_streak = 0
       user.last_completion_date = null (or keep old for reference)
       recalculated = true
       streak_broken = true
     }
   }
   ```

5. **Save updated data to database** (if recalculated)

6. **Return response with flags set appropriately**
   - `recalculated: true` if any changes were made
   - `streak_broken: true` if streak was reset to 0

### Important: Timezone Handling

**Use user's timezone for all calculations**, not UTC. Example:

```python
from datetime import datetime
from pytz import timezone

def get_user_timezone(user):
  # Get from user preferences/profile
  return timezone(user.timezone or 'America/New_York')

def recalculate_streak(user):
  user_tz = get_user_timezone(user)
  now = datetime.now(user_tz).date()
  last_completion = user.streak.last_completion_date.astimezone(user_tz).date()
  days_diff = (now - last_completion).days

  # Recalculation logic based on days_diff
  ...
```

---

## Implementation Notes

### 1. Non-Breaking Changes
- If no recalculation happens, simply return current streak data with `recalculated: false`
- Fetching streak should never break the user's existing streak (unless it's past the missed-day threshold)

### 2. Atomicity
- Ensure recalculation is atomic - either fully applies or rolls back
- Use database transactions if available

### 3. Logging
Backend should log:
```
[getStreak] User: {userId}, Current streak before: {current_streak}
[getStreak] Days since last completion: {days_diff}
[getStreak] Recalculated: {recalculated}, Broken: {streak_broken}
[getStreak] Current streak after: {current_streak}
```

### 4. Performance
- This endpoint may be called on every app launch
- Ensure it's optimized (single DB query if possible)
- Consider caching if recalculation within same calendar day

### 5. Edge Cases

| Scenario | Handling |
|----------|----------|
| User's first time - no last_completion_date | Return streak with current_streak=0, don't break anything |
| Timezone changed on user's device | Use backend timezone (user profile setting) for consistency |
| Multiple app launches same day | days_diff will be 0, no recalculation needed |
| User hasn't completed any milestone | Keep streak as-is (likely 0) |
| Leap year/DST transitions | Use standard timezone library, it handles these |

---

## Frontend Integration

The frontend calls `getStreak()` in two scenarios:

### 1. On App Load (auto-recalculation)
```typescript
// In authStore.ts loadUserData()
const streakResponse = await getStreak(userId);
if (streakResponse.success) {
  updateStreakData(streakResponse.streak_data);

  // Log recalculation events for debugging
  if (streakResponse.recalculated) {
    console.log('Streak was recalculated');
  }
  if (streakResponse.streak_broken) {
    console.log('Streak was broken - user missed a day');
  }
}
```

**Expected behavior:**
- User opens app on day 2 (after missing day 1)
- `getStreak()` is called and detects days_diff > 1
- Backend resets current_streak to 0
- Frontend receives `streak_broken: true`
- Badge on HomeScreen shows 0 days
- User sees the change immediately without completing a milestone

### 2. Streak Update (optional - for audit trail)
```typescript
// In milestone completion, after updateStreak()
// Could optionally call getStreak() to verify server state
// This is optional - backend already returns streak in updateStreak() response
```

---

## Database Schema Addition

Add this to the user document:

```javascript
{
  user_id: string,
  timezone: "America/New_York",  // User's timezone for streak calculations
  // ... existing fields

  streak: {
    current_streak: { type: Number, default: 0 },
    longest_streak: { type: Number, default: 0 },
    last_completion_date: { type: Date, default: null },
    total_completions: { type: Number, default: 0 },
    streak_freeze_available: { type: Boolean, default: false },
    milestone_achievements: {
      three_day_count: { type: Number, default: 0 },
      seven_day_count: { type: Number, default: 0 },
      thirty_day_count: { type: Number, default: 0 }
    },
    // Optional: audit fields
    last_recalculated_at: { type: Date, default: null },
    recalculation_count: { type: Number, default: 0 }
  }
}
```

---

## Testing Checklist for Backend Team

### Unit Tests
- [ ] Streak unchanged when called same day
- [ ] Streak unchanged when called next day without completion
- [ ] Streak resets to 0 when called 2+ days after last completion
- [ ] Streak freeze prevents reset on missed day
- [ ] `recalculated` flag set correctly
- [ ] `streak_broken` flag set correctly
- [ ] Returns null/0 for user with no previous completions

### Integration Tests
- [ ] User misses a day, opens app: sees streak reset in frontend
- [ ] User completes milestone, opens app: streak continues as expected
- [ ] Multiple users' streaks independent of each other
- [ ] Works across timezone boundaries

### Performance Tests
- [ ] Single DB query per request
- [ ] Response time < 200ms for single user
- [ ] Can handle concurrent requests

---

## Example Scenarios

### Scenario 1: User with active streak opens app
**Setup:**
- Last completion: 2026-01-28 (today)
- Current streak: 5 days
- Now: 2026-01-28 (still same day)

**Calculation:**
- days_diff = 0
- No recalculation needed
- Return: `recalculated: false, streak_broken: false`
- Frontend badge shows: 🔥 5

---

### Scenario 2: User misses a day, opens app next day
**Setup:**
- Last completion: 2026-01-26
- Current streak: 3 days
- Now: 2026-01-28 (missed 2026-01-27)

**Calculation:**
- days_diff = 2
- Missed day(s) detected
- If freeze available: use it, keep streak
- If no freeze: reset current_streak to 0
- Return: `recalculated: true, streak_broken: true`
- Frontend badge shows: 🔥 0

---

### Scenario 3: User completes milestone next day
**Setup:**
- Last completion: 2026-01-27
- Current streak: 2 days
- Now: 2026-01-28 (next day, no other activity)

**Calculation:**
- days_diff = 1
- No recalculation (user is continuing streak)
- Return: `recalculated: false, streak_broken: false`
- If user completes milestone now, PUT /streak/update will extend to 3 days
- Frontend badge shows: 🔥 2 (until milestone completion)

---

## Questions for Backend Team?

Please clarify:
1. Where is user's timezone stored/configured?
2. Should we store timezone in user profile, or use IP-based detection?
3. Do we need audit logging for streak recalculations?
4. Any rate limiting on this endpoint?
5. Should we cache last_recalculated_at to avoid unnecessary DB hits same day?

