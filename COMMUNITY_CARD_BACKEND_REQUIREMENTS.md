# Community Card Backend Requirements

## Issue
Victory cards in the Community feed are missing the challenge type chip that appears in the preview.

## Root Cause
The backend `/victories` endpoint is not returning the `challenge_type` field for each victory card.

## Required Changes

### Backend Endpoint: `GET /victories`

The endpoint must include the `challenge_type` field in each victory card response.

**Current Response Format (missing challenge_type):**
```json
{
  "feed": [
    {
      "id": "...",
      "userId": "...",
      "milestoneId": "...",
      "milestoneTitle": "Set a budget range",
      "dreamCategory": "finance_security",
      "evidenceSnippet": "...",
      "confidenceBoost": 30,
      "impactLevel": "high",
      // MISSING: challengeType field
      ...
    }
  ]
}
```

**Required Response Format (with challenge_type):**
```json
{
  "feed": [
    {
      "id": "...",
      "userId": "...",
      "milestoneId": "...",
      "milestoneTitle": "Set a budget range",
      "challengeType": "prep_ritual",  // ← REQUIRED: Add this field
      "dreamCategory": "finance_security",
      "evidenceSnippet": "...",
      "confidenceBoost": 30,
      "impactLevel": "high",
      ...
    }
  ]
}
```

### Challenge Type Values
The `challengeType` field should be one of:
- `"power_move"`
- `"knowledge_quest"`
- `"prep_ritual"`
- `"courage_check"`
- `"skill_flex"`
- `"decision_point"`
- `"celebration_moment"`

### Data Source
The `challenge_type` should be fetched from the milestone document that the victory card references via `milestoneId`.

### Implementation Steps (Backend)

1. **Locate the `/victories` endpoint** in `LaunchPad-Backend/api/victories.py`

2. **Update the victory card aggregation** to include milestone's `challenge_type`:
   - When fetching victory cards from the database
   - Join with the milestones collection using `milestone_id`
   - Include `challenge_type` field from the milestone document

3. **Update the VictoryCard schema/model** to include:
   ```python
   challenge_type: Optional[str] = None  # Challenge type from milestone
   ```

4. **Populate the challenge_type field** when creating victory card responses

### Frontend (Already Implemented)
The frontend is already set up to:
- ✅ Receive `challengeType` field in VictoryCard interface
- ✅ Display challenge type chip with proper color coding
- ✅ Use challenge type color for the accent strip gradient
- ✅ Format challenge type for display (e.g., "prep_ritual" → "Prep Ritual")

### Testing
After backend changes, verify:
1. Victory cards in the feed show the challenge type chip (e.g., "Prep Ritual", "Power Move")
2. The chip uses the correct color from ChallengeTypeColors
3. The accent strip gradient uses the challenge type color
4. Challenge types match the original milestone's type

## Color Mapping (Reference)
```typescript
ChallengeTypeColors = {
  power_move: '#8B5CF6',      // Purple
  knowledge_quest: '#3B82F6',  // Blue
  prep_ritual: '#10B981',      // Green
  courage_check: '#F59E0B',    // Amber
  skill_flex: '#EC4899',       // Pink
  decision_point: '#6366F1',   // Indigo
  celebration_moment: '#F97316' // Orange
}
```

## Example Backend Query (Pseudo-code)

```python
# When fetching victory cards
victory_cards = victories_collection.aggregate([
    {
        "$lookup": {
            "from": "milestones",
            "localField": "milestone_id",
            "foreignField": "id",
            "as": "milestone_data"
        }
    },
    {
        "$addFields": {
            "challenge_type": {"$arrayElemAt": ["$milestone_data.challenge_type", 0]}
        }
    },
    # ... rest of aggregation pipeline
])
```
