# Backend API Specification: Journey Recaps (Phase 2)

## Overview

Journey Recaps are special community posts created when a user completes an entire dream (all milestones). Unlike Victory Cards (which celebrate individual milestone completions), Journey Recaps tell the story of the complete journey from start to finish.

**Key Design Decision:** When a user completes the final milestone of a dream, they will ONLY be prompted to share a Journey Recap - NOT a Victory Card. This prevents duplicate posts and emphasizes the completion of the full journey over individual milestones.

---

## Database Schema

### New Collection: `journey_recaps`

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // User who completed the dream
  userDisplayName: String,          // "Sarah" or "Anonymous"
  userLocation: String,             // Optional
  userAge: Number,                  // Optional

  dreamId: ObjectId,                // Reference to dream (thread_id)
  dreamTitle: String,               // "Solo Trip to Bali"
  dreamCategory: String,            // Same categories as victory cards

  journeyStory: String,             // User's reflection (required, max 500 chars)
  totalMilestones: Number,          // How many milestones were in this dream
  durationDays: Number,             // Days from first milestone to completion
  keyMoment: String,                // Optional: Most memorable moment (max 200 chars)

  completedDate: Date,              // When the dream was completed
  createdAt: Date,                  // When posted to wall

  courageBoosts: Number,            // Count of boosts received (default: 0)
  permissionsCount: Number,         // Count of permissions granted (default: 0)
  meTooCount: Number,               // Count of Me Too clicks (default: 0)

  isAnonymous: Boolean,

  // Indexes
  index: { dreamCategory: 1, createdAt: -1 },
  index: { userId: 1, createdAt: -1 },
  index: { createdAt: -1 }
}
```

---

## API Endpoints

### 1. Create Journey Recap

**Endpoint:** `POST /api/journey-recaps`

**Description:** Create a journey recap when a dream is completed.

**Request Body:**
```json
{
  "dreamId": "thread_123",
  "journeyStory": "This dream taught me that I'm capable of more than I thought. The hardest part was...",
  "keyMoment": "The day I realized I could actually do this",  // Optional
  "isAnonymous": false
}
```

**Query Parameters:**
- `user_id` (required): ID of the user creating the journey recap

**Success Response (200):**
```json
{
  "success": true,
  "journeyRecapId": "journey_123",
  "couragePointsAwarded": 10
}
```

**Error Responses:**
- `400` - Invalid dreamId or missing required fields
- `401` - User not authenticated
- `404` - Dream not found or not completed
- `409` - Journey recap already exists for this dream
- `500` - Server error

**Business Logic:**
1. Validate dream exists and belongs to this user
2. Verify dream is actually completed (all milestones done)
3. Check that journey recap doesn't already exist for this dream (one per dream)
4. Calculate `totalMilestones` from dream's milestone count
5. Calculate `durationDays` from first milestone completion to last
6. Populate user info from user document (or use "Anonymous")
7. Create journey recap document
8. Award +10 courage points to user (more than victory card's +5)
9. Return success with journey recap ID

**Validation:**
- `journeyStory`: Required, 10-500 characters
- `keyMoment`: Optional, max 200 characters
- Dream must be 100% complete
- User can only create one journey recap per dream

---

### 2. Get Journey Recaps (Enhancement to Victories Endpoint)

**Endpoint:** `GET /api/victories`

**Description:** Return BOTH victory cards and journey recaps in the feed, sorted by `createdAt`.

**Updated Response:**
```json
{
  "feed": [
    {
      "type": "journey_recap",
      "id": "journey_123",
      "userId": "user_456",
      "userDisplayName": "Sarah",
      "userLocation": "Chicago, IL",
      "userAge": 28,
      "dreamId": "dream_789",
      "dreamTitle": "Solo Trip to Bali",
      "dreamCategory": "travel_exploration",
      "journeyStory": "This dream taught me...",
      "totalMilestones": 8,
      "durationDays": 45,
      "keyMoment": "The day I...",
      "completedDate": "2026-01-30T10:00:00Z",
      "createdAt": "2026-01-30T11:00:00Z",
      "courageBoosts": 15,
      "hasUserBoosted": false,
      "permissionsCount": 3,
      "meTooCount": 12,
      "hasUserMeTooed": true,
      "isAnonymous": false
    },
    {
      "type": "victory_card",
      "id": "victory_456",
      // ... existing victory card fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalCount": 89
  }
}
```

**Implementation Notes:**
- Query both `victory_cards` and `journey_recaps` collections
- Merge results and sort by `createdAt` descending
- Apply filters (category, timeframe) to both types
- Include `type` field in each item to distinguish on frontend
- Journey recaps can receive boosts, permissions, and Me Too just like victory cards

---

### 3. Boost Journey Recap

**Endpoint:** `POST /api/journey-recaps/:journeyRecapId/boost`

**Description:** Give a courage boost to a journey recap (same mechanics as victory boost).

**Query Parameters:**
- `giver_user_id` (required): ID of user giving the boost

**Success Response (200):**
```json
{
  "success": true,
  "newBoostCount": 16,
  "couragePointsAwarded": 1
}
```

**Business Logic:**
- Same as victory card boosts (+1 courage point to receiver)
- Prevent duplicate boosts (one per user per journey recap)
- Increment `courageBoosts` count

---

### 4. Give Permission to Journey Recap

**Endpoint:** `POST /api/journey-recaps/:journeyRecapId/permission`

**Description:** Grant a permission slip to a journey recap (same mechanics as victory permissions).

**Request Body:**
```json
{
  "permissionType": 4
}
```

**Query Parameters:**
- `giver_user_id` (required): ID of user giving the permission

**Success Response (200):**
```json
{
  "success": true,
  "permissionText": "Permission granted to call yourself a traveler",
  "couragePointsAwarded": 5
}
```

**Business Logic:**
- Same as victory card permissions (+5 courage points to receiver)
- Create permission slip document referencing journey recap
- One permission per user per journey recap

---

### 5. Toggle Me Too on Journey Recap

**Endpoint:** `POST /api/journey-recaps/:journeyRecapId/metoo`

**Description:** Toggle Me Too for a journey recap (same mechanics as victory Me Too).

**Query Parameters:**
- `user_id` (required): ID of user toggling Me Too

**Success Response (200):**
```json
{
  "success": true,
  "newMeTooCount": 13,
  "added": true
}
```

**Business Logic:**
- Same as victory card Me Too (toggle, no points, no notification)
- Save to inspirations list

---

### 6. Update Milestone Status Response (CRITICAL)

**Endpoint:** `PUT /milestone/update-status/:userId/:threadId/:milestoneId`

**Description:** Enhanced to return dream completion status.

**Updated Response:**
```json
{
  "success": true,
  "message": "Milestone updated successfully",
  "milestone": {
    // ... milestone details
  },
  "isComplete": true,  // Legacy field (keep for backwards compatibility)
  "dreamCompleted": true,  // NEW: true if this milestone completion finished the dream
  "dreamStats": {  // NEW: only present if dreamCompleted = true
    "totalMilestones": 8,
    "completedMilestones": 8,
    "completionPercentage": 100,
    "dreamStartDate": "2025-12-15T10:00:00Z",
    "dreamCompletedDate": "2026-01-30T14:30:00Z"
  }
}
```

**Business Logic:**
1. Update the milestone status to "completed"
2. Query all milestones for this dream (thread_id)
3. Check if ALL milestones are now completed
4. If yes:
   - Set `dreamCompleted = true`
   - Calculate `totalMilestones` (count of all milestones)
   - Calculate `completedMilestones` (should equal totalMilestones)
   - Calculate `completionPercentage` (should be 100)
   - Get `dreamStartDate` (earliest milestone completion date)
   - Set `dreamCompletedDate` to current timestamp
   - Calculate `durationDays` = days between start and completion
5. Return enhanced response

**Frontend Usage:**
- If `dreamCompleted = true`: Show "Share your journey?" prompt → Navigate to ShareJourneyRecap
- If `dreamCompleted = false`: Show "Share your victory?" prompt → Navigate to ShareVictory

---

## Validation Rules

1. **One Journey Recap Per Dream**: Users can only create one journey recap per completed dream

2. **Dream Must Be Complete**: Cannot create journey recap unless 100% of milestones are done

3. **Story Required**: `journeyStory` is required (10-500 chars). `keyMoment` is optional (max 200 chars)

4. **No Self-Permissions**: Users cannot give permissions to their own journey recaps

5. **Boost/Permission Limits**: Same as victory cards (one boost per user, one permission per user)

---

## Points System

- **Creating Journey Recap**: +10 courage points (more than victory's +5, as it's a bigger achievement)
- **Receiving Boost**: +1 courage point per boost
- **Receiving Permission**: +5 courage points per permission
- **Me Too**: No points (same as victories)

---

## Notifications (Optional)

Similar to victory cards, but with journey-specific messaging:

**Boost Notification:**
```
Title: "Journey Boost! ⚡"
Body: "Sarah boosted your journey! +1 courage point"
```

**Permission Notification:**
```
Title: "Permission Granted! 💬"
Body: "Sarah granted you permission on your journey! +5 courage points"
```

---

## Integration with Existing Features

### Victory Wall Feed
- Mix journey recaps and victory cards in one feed
- Sort by `createdAt` descending
- Apply same filters (category, timeframe)
- Journey recaps visually distinguished with ⭐ icon (vs. ✓ for victories)

### Inspirations List
- Me Too works for both victory cards and journey recaps
- Query both collections when fetching user's inspirations

### Permission Slips
- Permission slips can be attached to both victory cards and journey recaps
- Store reference to either `victoryCardId` OR `journeyRecapId`

### User Profile Stats
- Journey recaps count toward "Victories Shared" stat
- Or create separate "Journeys Completed" stat (optional)

---

## Performance Considerations

1. **Indexing**:
   - Index on `dreamCategory` + `createdAt` for filtered feed queries
   - Index on `userId` for user's own journey recaps
   - Composite index on `dreamId` to enforce one recap per dream

2. **Feed Query Optimization**:
   - Use aggregation pipeline to merge victory cards and journey recaps
   - Apply filters once across both collections
   - Paginate combined results

3. **Caching**:
   - Cache combined feed results
   - Invalidate cache when new journey recap or victory card is created

---

## Testing Checklist

- [ ] Can create journey recap after completing dream
- [ ] Cannot create journey recap if dream not complete
- [ ] Cannot create duplicate journey recap for same dream
- [ ] Journey story validation works (10-500 chars)
- [ ] Key moment is optional and max 200 chars
- [ ] Anonymous mode hides user info correctly
- [ ] Courage points awarded (+10 on creation)
- [ ] Journey recaps appear in feed mixed with victories
- [ ] Journey recaps can receive boosts (+1 point)
- [ ] Journey recaps can receive permissions (+5 points)
- [ ] Journey recaps can receive Me Too (no points)
- [ ] `dreamCompleted` flag returned correctly on milestone update
- [ ] `dreamStats` calculated correctly (milestones, duration, dates)
- [ ] Frontend shows correct prompt (journey vs victory)
- [ ] Feed filtering works for journey recaps (category, time)
- [ ] Journey recap stats (boosts, permissions, Me Too) persist correctly

---

## Example Flow

1. User completes 7/8 milestones of "Solo Trip to Bali" dream
2. User completes 8th (final) milestone → calls `updateMilestoneStatus`
3. Backend detects all milestones complete → returns `dreamCompleted: true`
4. Frontend shows ⭐ "Share your journey?" button (not 🏆 "Share your victory?")
5. User clicks → ShareJourneyRecapModal opens
6. Modal pre-fills: dream title, milestone count (8), duration (45 days)
7. User writes story: "This dream taught me I'm braver than I thought..."
8. User adds key moment: "Booking the flight despite my fear"
9. User clicks "Share Journey" → creates journey recap
10. Backend awards +10 courage points
11. Journey recap appears in Victory Wall feed with ⭐ icon
12. Other users can boost, give permissions, click Me Too

---

## Database Migration

If existing users have completed dreams but no journey recaps:

**Option 1 (Recommended):** No migration - only new dream completions get journey recaps

**Option 2 (Optional):** Prompt users with completed dreams to create retrospective journey recaps

---

## Notes

- Journey Recaps are more valuable than Victory Cards (10 vs 5 points)
- Journey Recaps emphasize reflection and storytelling over proof
- One dream = one journey recap (vs. many victory cards)
- Journey Recaps coexist peacefully with Victory Cards in the same feed
- Future: Could add "Chapters" feature where journey recap links to all associated victory cards

---

## Future Enhancements (Out of Scope for Phase 2)

- Link journey recap to all victory cards from that dream
- "Dream Gallery" showing user's completed dreams as journey recaps
- "Journeys by Category" filter
- Rich media support (add photos to journey recaps)
- Journey recap templates for different categories
