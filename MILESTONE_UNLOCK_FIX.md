# Milestone Unlock Fix

## Problem
After completing a milestone, the next milestone in the sequence did not unlock automatically. The dependency checker kept showing the next milestone as locked even though its dependencies were met.

## Root Cause
The issue was caused by stale data in the Zustand store after milestone completion:

1. When a milestone was completed in `OneTimeGoal.tsx`:
   - The milestone status was updated locally in the store (`updateMilestoneStatusLocal`)
   - User data was refetched via `loadUserData`
   - However, `loadUserData` **preserved existing dream data** to avoid UI flashing (see `authStore.ts` line 351-356)
   - The `refreshDreamsFromCrud` function was called but also preserved milestones (line 614-616)
   - `loadFullDreams` skipped dreams that already had milestones loaded (line 545)

2. In `DreamPage.tsx`:
   - The dependency checker used this stale dream data to determine if milestones were locked
   - Since the dependencies array was not updated with the new completion status, the next milestone remained locked

## Solution
The fix involves three changes:

### 1. Force Refresh Dream Data After Milestone Completion
**File:** `src/components/milestonescreen/OneTimeGoal.tsx`

After completing a milestone, we now:
- Directly fetch the updated dream details from the backend using `fetchDreamDetails`
- Update the specific dream in the Zustand store with fresh milestone data including updated dependencies
- Add a `_lastUpdated` timestamp to track when data was refreshed
- Retry if the milestone status isn't immediately reflected in the backend

This ensures the dependency checker has access to the most current milestone statuses and dependencies.

### 2. Improved Dream Data Selection Logic
**File:** `src/screens/DreamPage.tsx`

Enhanced the logic for choosing between `dreamFromStore` and `fullDreamData`:
- Now considers `_lastUpdated` timestamp in addition to milestone count
- Prefers data from the store if it has a more recent timestamp
- This ensures freshly updated dream data (after milestone completion) takes precedence

### 3. Timestamp-Based Freshness Tracking
**Approach:** Added `_lastUpdated` timestamp to dream objects when updating them in the store

This provides a reliable way to determine which data source is more recent when multiple sources are available.

## How It Works Now

1. User completes a milestone
2. `OneTimeGoal` calls the backend API to mark milestone as complete
3. Backend updates milestone status AND recalculates dependencies
4. Frontend force-fetches the updated dream with `fetchDreamDetails`
5. Zustand store is updated with fresh dream data (including updated dependencies)
6. `_lastUpdated` timestamp is set to current time
7. `DreamPage` re-renders and uses the fresh data from store
8. Dependency checker sees the updated dependencies
9. Next milestone unlocks automatically ✅

## Testing
To verify the fix works:
1. Open a dream with sequential milestones
2. Complete the first milestone
3. Observe that the second milestone unlocks immediately
4. The lock icon should disappear and the milestone should be clickable
5. Check console logs for "[OneTimeGoal] Dream updated with fresh milestone data"

## Files Modified
- `src/components/milestonescreen/OneTimeGoal.tsx` - Force refresh dream after completion
- `src/screens/DreamPage.tsx` - Improved data selection logic with timestamp consideration

## Related Code
- `src/utils/dependencyChecker.ts` - Checks milestone dependencies (no changes needed)
- `src/store/authStore.ts` - Zustand store for user data (no changes needed)
- `src/config/api.ts` - API calls (no changes needed)
