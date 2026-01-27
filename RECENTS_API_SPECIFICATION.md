# Recents Array API Specification

## Overview
This document describes how to implement the backend endpoint for updating the user's recents dreams array. The frontend tracks the 3 most recently accessed active dreams and needs to persist this to the database.

## Frontend Behavior (Reference)
The frontend maintains a `recents` array in the user document with the following logic:
- **Max 3 items**: Only stores up to 3 dream thread IDs
- **LIFO ordering**: Most recently accessed dream is at index 0
- **Active only**: Only dreams with `status === "active"` can be added
- **Deduplication**: If a dream is already in recents and accessed again, it moves to the front

Example:
```
User accesses dreams in order: Dream A, Dream B, Dream C, Dream A
Result: recents = ["A", "C", "B"]  // A moved to front
```

## Database Schema Update

### User Document Structure
Add a `recents` field to your user collection:

```json
{
  "_id": ObjectId,
  "user_id": "firebase_uid",
  "firstname": "string",
  "lastname": "string",
  "email": "string",
  "dreams": [...],
  "recents": ["thread_id_1", "thread_id_2", "thread_id_3"],
  "created_at": ISODate,
  "updated_at": ISODate
}
```

**Field Details:**
- `recents`: Array of strings (dream thread IDs)
- Default: `[]` (empty array for new users)
- Max length: 3 items
- Valid values: Must reference existing dream `thread_id` values where `status === "active"`

## API Endpoint Design

### Endpoint: Update Recents Array
**Method:** `PUT`
**Path:** `/users/{userId}/recents`

### Request

```
PUT /users/{userId}/recents
Content-Type: application/json

{
  "thread_id": "the_dream_thread_id"
}
```

**Parameters:**
- `userId` (path parameter): Firebase user ID
- `thread_id` (body): The thread_id of the dream being accessed

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Recents updated successfully",
  "recents": ["thread_id_1", "thread_id_2"]
}
```

**Error Cases:**

1. **Dream not found (404):**
```json
{
  "success": false,
  "message": "Dream not found"
}
```

2. **Dream is not active (400):**
```json
{
  "success": false,
  "message": "Cannot add inactive dream to recents"
}
```

3. **User not found (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

4. **Invalid input (400):**
```json
{
  "success": false,
  "message": "thread_id is required"
}
```

## Backend Implementation Logic

### Algorithm to Update Recents

```pseudocode
function updateRecents(userId, threadId):
  1. Validate userId and threadId exist

  2. Find user by userId
     if not found: return 404 error

  3. Find dream by threadId in user.dreams
     if not found: return 404 error

  4. Check if dream.status === "active"
     if not: return 400 error (cannot add inactive dreams)

  5. Get current recents array (or empty array if doesn't exist)

  6. Remove threadId from recents if it already exists
     recents = recents.filter(id => id !== threadId)

  7. Add threadId to beginning
     recents.unshift(threadId)

  8. Keep only first 3 items
     recents = recents.slice(0, 3)

  9. Update user document:
     user.recents = recents
     user.updated_at = now()

  10. Return success response with updated recents array
```

### Example Implementation (Python/Flask)
```python
@app.route('/users/<user_id>/recents', methods=['PUT'])
def update_recents(user_id):
    data = request.json
    thread_id = data.get('thread_id')

    # Validate input
    if not thread_id:
        return jsonify({'success': False, 'message': 'thread_id is required'}), 400

    # Find user
    user = db.users.find_one({'user_id': user_id})
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    # Find dream
    dream = None
    for d in user.get('dreams', []):
        if d.get('thread_id') == thread_id:
            dream = d
            break

    if not dream:
        return jsonify({'success': False, 'message': 'Dream not found'}), 404

    # Check if dream is active
    if dream.get('status') != 'active':
        return jsonify({'success': False, 'message': 'Cannot add inactive dream to recents'}), 400

    # Update recents array
    recents = user.get('recents', [])
    recents = [id for id in recents if id != thread_id]  # Remove if exists
    recents.insert(0, thread_id)  # Add to front
    recents = recents[:3]  # Keep only first 3

    # Update database
    db.users.update_one(
        {'user_id': user_id},
        {
            '$set': {
                'recents': recents,
                'updated_at': datetime.utcnow()
            }
        }
    )

    return jsonify({
        'success': True,
        'message': 'Recents updated successfully',
        'recents': recents
    }), 200
```

### Example Implementation (Node.js/Express)
```javascript
router.put('/users/:userId/recents', async (req, res) => {
  const { userId } = req.params;
  const { thread_id } = req.body;

  // Validate input
  if (!thread_id) {
    return res.status(400).json({
      success: false,
      message: 'thread_id is required'
    });
  }

  try {
    // Find user
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find dream
    const dream = user.dreams.find(d => d.thread_id === thread_id);
    if (!dream) {
      return res.status(404).json({
        success: false,
        message: 'Dream not found'
      });
    }

    // Check if dream is active
    if (dream.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add inactive dream to recents'
      });
    }

    // Update recents array
    let recents = user.recents || [];
    recents = recents.filter(id => id !== thread_id); // Remove if exists
    recents.unshift(thread_id); // Add to front
    recents = recents.slice(0, 3); // Keep only first 3

    // Update user
    user.recents = recents;
    user.updated_at = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Recents updated successfully',
      recents: recents
    });
  } catch (error) {
    console.error('Error updating recents:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
```

## Frontend Integration

Once the endpoint is ready, add this to `src/config/api.ts`:

```typescript
export async function updateRecents(
  userId: string,
  threadId: string,
): Promise<UpdateRecentsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/recents`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ thread_id: threadId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error updating recents:', error);
    throw error;
  }
}
```

Then call it in `src/store/authStore.ts` `addToRecents` action:

```typescript
addToRecents: (threadId: string) => {
  set((state) => {
    if (!state.userData?.dreams) return state;

    const dreamToAdd = state.userData.dreams.find(
      (dream: any) => dream.thread_id === threadId
    );

    if (!dreamToAdd || dreamToAdd.status !== 'active') {
      return state;
    }

    const updatedUserData = JSON.parse(JSON.stringify(state.userData));

    if (!updatedUserData.recents) {
      updatedUserData.recents = [];
    }

    updatedUserData.recents = updatedUserData.recents.filter(
      (id: string) => id !== threadId
    );

    updatedUserData.recents.unshift(threadId);
    updatedUserData.recents = updatedUserData.recents.slice(0, 3);

    // Call API to persist to database
    if (state.user?.uid) {
      updateRecents(state.user.uid, threadId).catch((error) => {
        console.error('Failed to update recents in database:', error);
      });
    }

    return { userData: updatedUserData };
  });
},
```

## Testing Checklist

- [ ] Dream with `status !== "active"` cannot be added to recents
- [ ] Recents array never exceeds 3 items
- [ ] Adding the same dream twice moves it to the front
- [ ] Most recently added dream is always at index 0
- [ ] Invalid `thread_id` returns 404 error
- [ ] Invalid `user_id` returns 404 error
- [ ] Missing `thread_id` in request body returns 400 error
- [ ] Response includes updated recents array
- [ ] `updated_at` timestamp is set when recents are updated

## Notes

- This endpoint should be idempotent (calling it multiple times with the same `thread_id` produces the same result)
- Consider adding authentication/authorization middleware to ensure users can only update their own recents
- The frontend keeps a local copy of recents in Zustand store, so the API update can be asynchronous
