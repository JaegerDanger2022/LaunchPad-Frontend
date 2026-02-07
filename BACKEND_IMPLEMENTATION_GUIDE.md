# Backend Implementation Guide for Custom Dream Creation

## Overview
This guide explains what needs to be implemented on the backend to support the DIY (custom) dream creation feature.

## Frontend Changes Summary
The frontend now supports two ways to create dreams:
1. **Create with Luna** - Existing chatbot flow (no changes needed)
2. **DIY** - New manual dream creation with custom milestones

## Backend Endpoint Required

### Endpoint: `POST /dreams/create-custom`

**Request Body:**
```json
{
  "user_id": "string",
  "dream_title": "string",
  "milestones": [
    {
      "title": "string",
      "description": "string (optional)",
      "challenge_type": "action" | "research" | "reflection",
      "order": 1
    }
  ]
}
```

**Response:**
```json
{
  "thread_id": "string"
}
```

## Backend Implementation Steps

### 1. Create Dream Document
Create a dream document in the `dreams` collection with the following structure:

```python
dream_doc = {
    "user_id": user_id,
    "dream": dream_title,
    "status": "active",
    "category": "custom",  # or determine from title
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow(),
    "is_custom": True,  # Flag to indicate DIY dream
    "roadmap": {
        "status": "active",
        "milestones": []  # Will be populated below
    }
}
```

### 2. Create Milestones
For each milestone in the request:

```python
milestone = {
    "id": generate_unique_id(),  # e.g., uuid4()
    "title": milestone_data["title"],
    "description": milestone_data.get("description", ""),
    "challenge_type": milestone_data["challenge_type"],
    "status": "pending",
    "order": milestone_data["order"],
    "time_estimate": "30 min",  # Default for custom milestones
    "xp_points": 10,  # Default XP
    "streak_eligible": True,
    "dependencies": [],  # Sequential: previous milestone's ID
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow()
}
```

**Important:** Set dependencies sequentially:
- Milestone 1: `dependencies: []` (unlocked)
- Milestone 2: `dependencies: [milestone_1_id]`
- Milestone 3: `dependencies: [milestone_2_id]`
- etc.

### 3. Update User Document
Add dream metadata to user's `dream_metadata` array:

```python
dream_metadata_entry = {
    "thread_id": thread_id,
    "dream": dream_title,
    "status": "active",
    "category": "custom",
    "milestones_count": len(milestones),
    "completed_milestones_count": 0,
    "created_at": datetime.utcnow()
}
```

Update the user document:
```python
db.users.update_one(
    {"user_id": user_id},
    {
        "$push": {"dream_metadata": dream_metadata_entry},
        "$inc": {"dreams_count": 1}
    }
)
```

### 4. Update up_next
Set the first milestone as `up_next` if user doesn't have one:

```python
if not user.get("up_next"):
    up_next = {
        "milestone_id": milestones[0]["id"],
        "milestone_title": milestones[0]["title"],
        "dream_thread_id": thread_id,
        "dream_title": dream_title,
        "time_estimate": "30 min",
        "xp_points": 10,
        "challenge_type": milestones[0]["challenge_type"],
        "streak_eligible": True,
        "updated_at": datetime.utcnow()
    }
    db.users.update_one(
        {"user_id": user_id},
        {"$set": {"up_next": up_next}}
    )
```

### 5. Response
Return the thread_id so the frontend can track the dream creation.

## Example Implementation (Python/FastAPI)

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime
import uuid

router = APIRouter()

class CustomMilestone(BaseModel):
    title: str
    description: str = ""
    challenge_type: Literal["action", "research", "reflection"]
    order: int

class CreateCustomDreamRequest(BaseModel):
    user_id: str
    dream_title: str
    milestones: List[CustomMilestone]

@router.post("/dreams/create-custom")
async def create_custom_dream(request: CreateCustomDreamRequest):
    # Validation
    if not request.milestones:
        raise HTTPException(status_code=400, detail="At least one milestone required")

    # Generate thread_id
    thread_id = str(uuid.uuid4())

    # Create milestone documents
    milestone_docs = []
    prev_milestone_id = None

    for milestone_data in request.milestones:
        milestone_id = str(uuid.uuid4())
        milestone_doc = {
            "id": milestone_id,
            "title": milestone_data.title,
            "description": milestone_data.description,
            "challenge_type": milestone_data.challenge_type,
            "status": "pending",
            "order": milestone_data.order,
            "time_estimate": "30 min",
            "xp_points": 10,
            "streak_eligible": True,
            "dependencies": [prev_milestone_id] if prev_milestone_id else [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        milestone_docs.append(milestone_doc)
        prev_milestone_id = milestone_id

    # Create dream document
    dream_doc = {
        "thread_id": thread_id,
        "user_id": request.user_id,
        "dream": request.dream_title,
        "status": "active",
        "category": "custom",
        "is_custom": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "roadmap": {
            "status": "active",
            "milestones": milestone_docs
        }
    }

    # Insert dream document
    db.dreams.insert_one(dream_doc)

    # Update user document
    dream_metadata_entry = {
        "thread_id": thread_id,
        "dream": request.dream_title,
        "status": "active",
        "category": "custom",
        "milestones_count": len(milestone_docs),
        "completed_milestones_count": 0,
        "created_at": datetime.utcnow()
    }

    db.users.update_one(
        {"user_id": request.user_id},
        {
            "$push": {"dream_metadata": dream_metadata_entry},
            "$inc": {"dreams_count": 1}
        }
    )

    # Update up_next if needed
    user = db.users.find_one({"user_id": request.user_id})
    if not user.get("up_next"):
        first_milestone = milestone_docs[0]
        up_next = {
            "milestone_id": first_milestone["id"],
            "milestone_title": first_milestone["title"],
            "dream_thread_id": thread_id,
            "dream_title": request.dream_title,
            "time_estimate": first_milestone["time_estimate"],
            "xp_points": first_milestone["xp_points"],
            "challenge_type": first_milestone["challenge_type"],
            "streak_eligible": first_milestone["streak_eligible"],
            "updated_at": datetime.utcnow()
        }
        db.users.update_one(
            {"user_id": request.user_id},
            {"$set": {"up_next": up_next}}
        )

    return {"thread_id": thread_id}
```

## Testing the Feature

1. Start your backend server
2. In the frontend app, click the "+" button to create a dream
3. Choose "DIY" option
4. Enter a dream title and add milestones
5. Click "Create Dream"
6. Verify the dream appears in AllDreamsScreen with the loading animation
7. Verify the dream appears with correct milestone count and progress

## Notes

- Custom dreams are marked with `is_custom: True` flag
- Default values for custom milestones: 30 min time estimate, 10 XP points
- Milestones are sequential by default (each depends on the previous one)
- The first milestone becomes `up_next` if the user doesn't have one already
- Category can be "custom" or you can implement logic to categorize based on title/description
