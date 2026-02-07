# The ACTUAL Fix: Cross-Dream Milestone ID Collision

## The Real Problem (Found in Logs!)

The logs revealed the **actual issue**: The dependency checker was finding milestones from **OTHER dreams** with the same milestone IDs!

### Evidence from Logs:

1. **Duplicate milestones with same ID but different titles:**
```
[DepChecker] Found dependencies: [
  {"id": "m_0_micro", "status": "completed", "title": "Write 'My Bakery Ideas' on a s"},  // Bakery dream
  {"id": "m_0_micro", "status": "completed", "title": "Search 'perfume making basics'"}  // Perfume dream!
]
WARN [DepChecker] WARNING: Not all dependencies found! {"expected": 1, "found": 2}
```

2. **Wrong milestone blocking the dependency:**
```
Checking m_2 (bakery dream) which depends on m_1 (bakery dream):

[DepChecker] BLOCKED - dependency not completed: {
  "blockingMilestoneId": "m_1",
  "blockingMilestoneTitle": "Explore perfume making concepts",  // ← WRONG DREAM!
  "blockingMilestoneStatus": "pending"
}

Should have found:
{
  "blockingMilestoneId": "m_1",
  "blockingMilestoneTitle": "List out your bakery dreams",  // ← Correct milestone
  "blockingMilestoneStatus": "completed"
}
```

## Why This Happened

You have **multiple dreams** (bakery, perfume, etc.), and the backend generates milestone IDs like:
- `m_0_micro`, `m_1`, `m_2`, etc.

These IDs are **NOT globally unique** - each dream has its own `m_1`, `m_2`, etc.

The old dependency checker was searching through **ALL dreams** to find dependencies, which caused it to find the wrong `m_1` from a different dream!

## The Fix

Changed [dependencyChecker.ts](src/utils/dependencyChecker.ts#L80-L102) to only search within the **same dream**:

### Before (WRONG):
```typescript
// Search all dreams for the dependency milestones
for (const dream of dreams) {
  if (dream.roadmap?.milestones && Array.isArray(dream.roadmap.milestones)) {
    for (const m of dream.roadmap.milestones) {
      if (dependencyIds.includes(m.id)) {
        // Found it! But might be from a DIFFERENT dream!
```

### After (CORRECT):
```typescript
// IMPORTANT: Search for dependencies ONLY in the same dream (ownerMilestones)
// This prevents false matches with milestones from other dreams that have the same ID
for (const m of ownerMilestones) {
  if (dependencyIds.includes(m.id)) {
    // Found it in the SAME dream!
```

## Why This Works

1. **Milestone IDs are unique within a dream, not globally**
2. **Dependencies are always within the same dream** (intra-dream, not cross-dream)
3. By searching only in `ownerMilestones`, we ensure we find the correct `m_1` for this specific dream

## Expected Behavior Now

When checking if milestone `m_2` (bakery) can unlock:
1. ✅ Look for dependency `m_1` ONLY in the bakery dream's milestones
2. ✅ Find "List out your bakery dreams" with status="completed"
3. ✅ Unlock `m_2`!

NOT:
1. ❌ Look for dependency `m_1` in ALL dreams
2. ❌ Find "Explore perfume making concepts" (perfume dream) with status="pending"
3. ❌ Keep `m_2` locked

## Files Modified

1. **[src/utils/dependencyChecker.ts:80-110](src/utils/dependencyChecker.ts#L80-L110)** - Only search within same dream
2. **[src/screens/DreamPage.tsx:334](src/screens/DreamPage.tsx#L334)** - Use fresh `dream` data for dep checking
3. **[src/components/milestonescreen/OneTimeGoal.tsx:121-170](src/components/milestonescreen/OneTimeGoal.tsx#L121-L170)** - Force refresh dream data after completion
4. **[src/screens/DreamPage.tsx:88-107](src/screens/DreamPage.tsx#L88-L107)** - Improved dream data selection

## Testing

Complete milestone `m_1` in the bakery dream and check logs:
```
[DepChecker] Checking dependencies for milestone: { milestoneId: "m_2", dependencyIds: ["m_1"] }
[DepChecker] Found dependencies: [{ id: "m_1", title: "List out your bakery dreams", status: "completed" }]
[DepChecker] All dependencies completed - UNLOCKED
```

✅ Should now find the correct `m_1` from the bakery dream, NOT the perfume dream!
