# Debug Guide: Milestone Unlock Issue

## How Dependencies Work

The system uses a **dependency-based unlock mechanism**, NOT a removal mechanism:

1. **Dependencies Stay in Place**: When you complete a milestone, its ID remains in the `dependencies` array of dependent milestones
2. **Status Check**: The dependency checker looks at the `status` field of each dependency milestone
3. **Unlock Logic**: A milestone unlocks when ALL its dependencies have `status === "completed"`

### Example:
```javascript
Milestone 1: { id: "m1", status: "pending", dependencies: [] }
Milestone 2: { id: "m2", status: "pending", dependencies: ["m1"] }

// After completing Milestone 1:
Milestone 1: { id: "m1", status: "completed", dependencies: [] }
Milestone 2: { id: "m2", status: "pending", dependencies: ["m1"] }  // Still has "m1", but checker sees m1.status === "completed"
```

## Debugging Steps

### 1. Enable Console Logging
The code now has extensive logging enabled. Look for these console logs:

#### After completing a milestone (from OneTimeGoal.tsx):
```
[OneTimeGoal] Force refetching dream details after milestone completion
[OneTimeGoal] Fetched updated dream from backend: { threadId, milestoneCount, milestones: [...] }
[OneTimeGoal] Dream updated in Zustand store with fresh milestone data
[OneTimeGoal] Updated milestones in store: [...]
```

#### When viewing the DreamPage (from DreamPage.tsx):
```
[DreamPage] Milestone 1 debug: { milestoneId, milestoneTitle, dependencies, status, dependenciesMet, isLocked, ... }
[DreamPage] Milestone 2 debug: { ... }
[DreamPage] Milestone 3 debug: { ... }
```

#### During dependency checking (from dependencyChecker.ts):
```
[DepChecker] Checking dependencies for milestone: { milestoneId, milestoneTitle, dependencyIds, dependencyCount }
[DepChecker] Found dependencies: [{ id, title, status }, ...]
[DepChecker] All dependencies completed - UNLOCKED
```

OR if blocked:
```
[DepChecker] BLOCKED - dependency not completed: { blockingMilestoneId, blockingMilestoneTitle, blockingMilestoneStatus }
```

### 2. Check What Data is Being Used

Look at the `dreamSource` in DreamPage logs:
- `'store'` = Using fresh data from Zustand store (good!)
- `'fullData'` = Using older cached data (might be stale)

Check the timestamps:
- `storeTimestamp` should be more recent after milestone completion
- If `storeTimestamp` > `fullDataTimestamp`, store data will be used

### 3. Verify Backend Response

Check the backend logs for:
```
[OneTimeGoal] Fetched updated dream from backend: {
  threadId: "...",
  milestoneCount: 5,
  milestones: [
    { id: "m1", title: "First Milestone", status: "completed", dependencies: [] },
    { id: "m2", title: "Second Milestone", status: "pending", dependencies: ["m1"] },
    ...
  ]
}
```

**Key things to verify:**
- ✅ The completed milestone has `status: "completed"`
- ✅ The next milestone still has its dependencies array
- ✅ The dependencies array contains the ID of the just-completed milestone

### 4. Common Issues and Solutions

#### Issue: Next milestone stays locked after completion

**Check 1: Is the status actually "completed" in the backend?**
```
[DepChecker] BLOCKED - dependency not completed: { blockingMilestoneStatus: "pending" }
```
- If status is still "pending", the backend didn't update it
- Check backend logs for errors in the update-status endpoint

**Check 2: Are dependencies missing from the fetched data?**
```
[DepChecker] WARNING: Not all dependencies found! { expected: 1, found: 0, missing: ["m1"] }
```
- This means the dependency milestone was not found in the dreams array
- The dream data might not be fully loaded or the fetch failed

**Check 3: Is stale data being used?**
```
[DreamPage] Milestone 2 debug: {
  dreamSource: 'fullData',  // Bad - using old cached data
  storeTimestamp: 1234567890,
  fullDataTimestamp: 1234567999  // Higher = newer, so fullData wins
}
```
- If `fullDataTimestamp` is higher but the data is actually stale, there's a timestamp issue
- Check that `_lastUpdated` is being set correctly in OneTimeGoal.tsx

**Check 4: Is the fetch failing silently?**
```
[OneTimeGoal] Failed to refetch dream details: [error details]
```
- If you see this error, the fetch failed and stale data is still in the store
- Check network connectivity and backend availability

### 5. Expected Flow After Completing Milestone

1. User clicks "Mark as complete" button
2. Backend API updates milestone status to "completed"
3. OneTimeGoal fetches fresh dream data with `fetchDreamDetails`
4. Fresh data shows completed milestone with updated status
5. Zustand store is updated with fresh data and new timestamp
6. DreamPage re-renders and uses fresh data from store (because timestamp is newer)
7. Dependency checker finds dependency milestone with status "completed"
8. Next milestone unlocks automatically

## Testing Checklist

- [ ] Complete first milestone in a dream
- [ ] Wait 2 seconds for fetch to complete
- [ ] Check console for "[OneTimeGoal] Dream updated in Zustand store"
- [ ] Navigate back to DreamPage
- [ ] Check console for "[DreamPage] Milestone 2 debug" with `dependenciesMet: true`
- [ ] Verify second milestone is clickable (no lock icon)
- [ ] Check console for "[DepChecker] All dependencies completed - UNLOCKED"

## Quick Fix Checklist

If next milestone doesn't unlock:

1. **Check console logs** - Look for any errors or warnings
2. **Verify backend response** - Check the fetched milestone data in logs
3. **Check data freshness** - Verify `storeTimestamp` is more recent
4. **Force refresh** - Navigate away and back to the dream page
5. **Check network** - Ensure the fetch request completed successfully

## Code Flow Summary

```
OneTimeGoal.tsx (user completes milestone)
  ↓
  updateMilestoneStatus() → Backend API
  ↓
  fetchDreamDetails() → Get fresh data
  ↓
  useAuthStore.setState() → Update Zustand with fresh data + timestamp
  ↓
DreamPage.tsx (re-renders automatically)
  ↓
  Uses dreamFromStore (because timestamp is newer)
  ↓
  areDependenciesCompleted() → Check each dependency's status
  ↓
  Milestone unlocks if all dependencies have status === "completed"
```
