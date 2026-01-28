# Backend Specification: updateUpNext() Endpoint

## Overview
This endpoint updates the `up_next` field in the user document with the next incomplete milestone from active dreams. The frontend calculates which milestone should be "next up" and sends it to the backend for persistence.

## Endpoint Details

### Route
```
PUT /users/{userId}/up_next
```

### HTTP Method
`PUT`

### Authentication
- Required: Firebase User ID token (standard auth header)
- User must be authenticated to update their own up_next field

---

## Request

### URL Parameters
```
userId: string (Firebase user ID)
```

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <firebase-token>
```

### Request Body
```json
{
  "up_next": {
    "milestone_id": "string",
    "milestone_title": "string",
    "dream_thread_id": "string",
    "dream_title": "string",
    "time_estimate": "string (e.g., '20 mins', '1 hour')",
    "xp_points": number,
    "challenge_type": "string (e.g., 'power_move', 'knowledge_quest')",
    "streak_eligible": boolean,
    "updated_at": "string (ISO 8601 timestamp)"
  }
}
```

### Request Body - Null Case
When all dreams are complete or no incomplete milestones exist:
```json
{
  "up_next": null
}
```

---

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Up next updated successfully",
  "up_next": {
    "milestone_id": "string",
    "milestone_title": "string",
    "dream_thread_id": "string",
    "dream_title": "string",
    "time_estimate": "string",
    "xp_points": number,
    "challenge_type": "string",
    "streak_eligible": boolean,
    "updated_at": "string (ISO 8601 timestamp)"
  }
}
```

### Success Response - Null Case (200 OK)
```json
{
  "success": true,
  "message": "Up next cleared - no incomplete milestones found",
  "up_next": null
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid request body",
  "detail": "up_next field is required"
}
```

### Error Response (401 Unauthorized)
```json
{
  "success": false,
  "message": "User not authenticated",
  "detail": "Valid auth token required"
}
```

### Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "User not found",
  "detail": "No user document found with the provided userId"
}
```

### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Failed to update up_next",
  "detail": "Database error details..."
}
```

---

## Database Changes

### User Collection Schema Update
Add the following optional field to the User collection:

```javascript
{
  _id: ObjectId,
  user_id: string,
  email: string,
  firstname: string,
  lastname: string,
  created_at: ISODate,
  // ... existing fields ...

  // NEW FIELD
  up_next: {
    type: Object,
    default: null,
    schema: {
      milestone_id: string,
      milestone_title: string,
      dream_thread_id: string,
      dream_title: string,
      time_estimate: string,
      xp_points: number,
      challenge_type: string,
      streak_eligible: boolean,
      updated_at: ISODate
    }
  }
}
```

### Index Recommendation (Optional but Recommended)
For faster queries if you need to find users by their next milestone:
```javascript
db.users.createIndex({ "up_next.milestone_id": 1 })
```

---

## Implementation Notes

### Validation Rules
1. **Required Fields** (when up_next is not null):
   - `milestone_id`: Non-empty string
   - `milestone_title`: Non-empty string
   - `dream_thread_id`: Non-empty string, must reference existing dream
   - `dream_title`: Non-empty string
   - `time_estimate`: Non-empty string
   - `xp_points`: Non-negative integer
   - `challenge_type`: Non-empty string
   - `streak_eligible`: Boolean
   - `updated_at`: Valid ISO 8601 timestamp

2. **Optional Validation**:
   - Verify that `dream_thread_id` exists in the user's dreams array
   - Verify that `milestone_id` exists in the referenced dream's milestones
   - Verify that the milestone is not already completed (status !== "completed")

### Authorization
- Users can only update their own `up_next` field
- Extract userId from Firebase auth token and verify it matches the URL parameter

### Data Persistence
- Store the entire `up_next` object as-is from the request
- Update `updated_at` timestamp automatically on backend (optional - can use frontend timestamp)
- When `up_next` is null, store null in the database (don't delete the field, set it to null)

### Concurrency Handling
- No special handling needed for concurrent requests
- Last write wins (simple PUT operation)
- Consider adding version field if concurrency control is needed in future

### Logging
Recommended logging:
```
[INFO] User {userId} updated up_next to milestone {milestone_id}
[WARN] User {userId} updated up_next to null (no incomplete milestones)
[ERROR] Failed to update up_next for user {userId}: {error message}
```

---

## Frontend Integration Points

The frontend calls this endpoint in the following scenarios:

1. **On App Load** (`loadUserData()` → `updateUpNext()`)
   - When user data is fetched from the backend
   - Ensures up_next is calculated fresh

2. **After Milestone Completion** (`updateMilestoneStatusLocal()` → `updateUpNext()`)
   - When a milestone's status changes to "completed"
   - Triggers recalculation to show next milestone

3. **After Recents Change** (`addToRecents()` → `updateUpNext()`)
   - When user views a different dream (changes priority)
   - Recalculates based on new dream priority order

### Frontend Implementation Details
- Calls are non-blocking (fire-and-forget)
- Frontend doesn't wait for response to continue
- Handles errors gracefully - app continues even if sync fails
- Console logs all requests and responses for debugging

---

## Example Flow

### Scenario 1: User Completes Last Milestone
```
Frontend State:
- Dream "Build an App" has 3 milestones
- Last milestone is completed

Frontend Action:
1. Call updateUpNext() with up_next = null
2. Send: PUT /users/{userId}/up_next with body { "up_next": null }
3. Backend persists null to database
4. Response: { "success": true, "up_next": null }
5. Frontend: HeroCard hides (no next milestone to show)
```

### Scenario 2: User Views Different Dream
```
Frontend State:
- User views Dream B (adds to recents at position 1)
- Dream B has incomplete milestones
- up_next was showing milestone from Dream A

Frontend Action:
1. Calculate new up_next from Dream B (first incomplete milestone)
2. Send: PUT /users/{userId}/up_next with new milestone data
3. Backend persists new up_next object
4. Response: { "success": true, "up_next": { ... } }
5. Frontend: HeroCard updates to show new milestone
```

### Scenario 3: All Dreams Complete
```
Frontend State:
- All active dreams have all milestones completed
- Recents all checked, all dreams checked

Frontend Action:
1. No incomplete milestones found anywhere
2. Call updateUpNext() with up_next = null
3. Send: PUT /users/{userId}/up_next with body { "up_next": null }
4. Backend persists null
5. Response: { "success": true, "up_next": null }
6. Frontend: HeroCard hides - show "All caught up!" message
```

---

## Testing Checklist

- [ ] Create endpoint at PUT /users/{userId}/up_next
- [ ] Validate all required fields in request body
- [ ] Verify user authentication
- [ ] Update user document with up_next object
- [ ] Handle null case (clear up_next)
- [ ] Return proper success response
- [ ] Return proper error responses with appropriate status codes
- [ ] Test with valid milestone data
- [ ] Test with null data
- [ ] Test with invalid/missing fields (should error)
- [ ] Test with non-existent userId (404)
- [ ] Test with unauthenticated request (401)
- [ ] Verify database persists data correctly
- [ ] Test concurrent requests from same user
- [ ] Verify frontend can call endpoint without errors

---

## Notes for Backend Team

1. **Simple Operation**: This is a straightforward update operation - no complex business logic needed on the backend. The frontend handles all milestone calculation.

2. **No Validation of References**: The frontend validates that the milestone_id exists in the dream before sending. You can add defensive checks if desired, but not required.

3. **No Side Effects**: This endpoint should only update the database field. No need to update other data, trigger workflows, or send notifications.

4. **Idempotent**: Sending the same request multiple times should produce the same result. Safe for retries.

5. **Non-Critical**: If this endpoint fails, the app continues to work. Users just won't see the HeroCard until next time they refresh or restart.

6. **Frontend Handles Calculation**: All the logic to determine "what is next" happens on the frontend. This endpoint is just storage.

---

## Related Endpoints

This endpoint works with existing endpoints:
- `GET /users/{userId}` - Fetches user data (includes up_next)
- `PUT /milestone/update-status/{userId}/{threadId}/{milestoneId}` - Updates milestone status, triggers up_next recalculation
- `PUT /users/{userId}/recents` - Updates recents list, triggers up_next recalculation
