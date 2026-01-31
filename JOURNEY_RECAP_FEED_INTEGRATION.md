# Journey Recap Feed Integration - Frontend Implementation

## Overview

Journey recaps are now integrated into the community feed alongside victory cards. Users will see a mixed feed of both milestone victories and completed dream journeys.

---

## Changes Made

### 1. Updated Types (`src/types/community.ts`)

Added union type for mixed feed:

```typescript
export type CommunityFeedItem =
  | (VictoryCard & { type: 'victory_card' })
  | (JourneyRecap & { type: 'journey_recap' });

export interface CommunityFeedResponse {
  feed: CommunityFeedItem[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
}
```

### 2. Updated API Functions (`src/config/api.ts`)

#### Updated `fetchVictories()`
- Now returns `CommunityFeedResponse` instead of `VictoriesResponse`
- Handles backwards compatibility: converts old format (`victories` array) to new format (`feed` array)
- Automatically adds `type` field to distinguish between victory cards and journey recaps

#### Added Journey Recap Interaction APIs
- `boostJourneyRecap(journeyRecapId, giverUserId)` - Give courage boost
- `giveJourneyRecapPermission(journeyRecapId, giverUserId, data)` - Grant permission slip
- `toggleJourneyRecapMeToo(journeyRecapId, userId)` - Toggle Me Too
- `getJourneyRecapPermissions(journeyRecapId)` - Fetch permissions list

### 3. Updated Community Screen (`src/screens/CommunityScreen.tsx`)

#### State Changes
- Renamed `victories` state to `feedItems` (type: `CommunityFeedItem[]`)
- Renamed `loadVictories()` to `loadFeed()`

#### Rendering Logic
- Added conditional rendering based on `item.type`:
  - `type === 'journey_recap'` → renders `<JourneyRecapCard />`
  - `type === 'victory_card'` → renders `<VictoryCard />`
- Both card types support same interactions: boost, permission, me too

#### Updated UI
- Subtitle now shows "X posts" instead of "X victories"

---

## Backend Requirements

The frontend is ready to display journey recaps, but the backend needs to be updated to provide them in the feed.

### Required Backend Changes

See `PacksLight---Expo-Backend/JOURNEY_RECAP_FEED_SPEC.md` for complete implementation details.

**Summary:**
1. Update `GET /api/victories` to return mixed feed with both collections
2. Add `POST /api/journey-recaps/:id/boost` endpoint
3. Add `POST /api/journey-recaps/:id/permission` endpoint
4. Add `POST /api/journey-recaps/:id/metoo` endpoint
5. Add `GET /api/journey-recaps/:id/permissions` endpoint

---

## Testing

### Current Behavior (Backend Not Updated)
- ✅ Feed displays victory cards (backwards compatible)
- ✅ Old API response format is automatically converted to new format
- ✅ All existing functionality works

### Expected Behavior (After Backend Update)
- ✅ Feed displays both victory cards and journey recaps
- ✅ Journey recaps show with ⭐ icon and journey stats
- ✅ Users can boost, permission, and me-too journey recaps
- ✅ Feed is sorted by creation date (newest first)
- ✅ Category and timeframe filters apply to both types

---

## User Flow

1. **User completes a dream** (all milestones done)
2. **Journey recap prompt appears** (instead of victory card)
3. **User shares their journey** with story and optional key moment
4. **Journey recap appears in community feed** alongside victory cards
5. **Other users can interact** with journey recaps just like victory cards:
   - Give courage boosts (+1 point)
   - Grant permission slips
   - Click "Me Too"

---

## Visual Differences

### Victory Card
- 🎯 Milestone icon
- Shows single milestone completion
- Evidence snippet
- Impact level
- Worth +5 courage points

### Journey Recap Card
- ⭐ Journey icon
- Shows complete dream journey
- Journey story (reflection)
- Total milestones count
- Duration in days
- Optional key moment
- Worth +10 courage points

---

## Next Steps

1. ✅ Frontend implementation complete
2. ⏳ Backend team implements feed endpoints (see spec document)
3. ⏳ Test with real journey recaps in feed
4. ⏳ Monitor performance with mixed feed queries

---

## Backwards Compatibility

The frontend gracefully handles both response formats:

**Old Format (current):**
```json
{
  "victories": [...],
  "pagination": {...}
}
```

**New Format (after backend update):**
```json
{
  "feed": [
    { "type": "victory_card", ... },
    { "type": "journey_recap", ... }
  ],
  "pagination": {...}
}
```

Frontend automatically converts old format to new format, ensuring zero downtime during backend migration.
