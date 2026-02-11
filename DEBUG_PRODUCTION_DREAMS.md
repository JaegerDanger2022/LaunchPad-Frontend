# Debug: Production Build Can't Read Dreams from MongoDB

## Quick Diagnostic Script

Add this to your HomeScreen or wherever you can trigger it to see the actual API response:

```typescript
// Temporary debug function
const debugFetchDreams = async () => {
  const userId = user?.uid;
  if (!userId) {
    console.log('[DEBUG] No user ID');
    return;
  }

  console.log('[DEBUG] User ID:', userId);
  console.log('[DEBUG] API URL:', API_BASE_URL);

  try {
    // Test user data fetch
    const userData = await fetchUserData(userId, { fields: 'essential' });
    console.log('[DEBUG] User data response:', JSON.stringify(userData, null, 2));

    // Test dreams list fetch
    const dreamsData = await fetchDreamsList(userId, { summary: true });
    console.log('[DEBUG] Dreams list response:', JSON.stringify(dreamsData, null, 2));
  } catch (error) {
    console.error('[DEBUG] Error:', error);
  }
};
```

## Common Issues

### 1. Wrong API URL in Production
**Check:** Your eas.json production environment
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://packslight-expo-backend-production.up.railway.app/api"
      }
    }
  }
}
```

**Verify:** Add this to your app to see what URL is being used:
```typescript
console.log('[DEBUG] API_BASE_URL:', API_BASE_URL);
console.log('[DEBUG] process.env.EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
```

### 2. Backend Not Connecting to MongoDB
**Check Railway logs:**
```bash
# Look for connection errors
- MongoDB connection timeout
- Authentication failed
- Network error
```

**Test backend directly:**
```bash
# Test if backend is responding
curl https://packslight-expo-backend-production.up.railway.app/api/users/[YOUR_USER_ID]
```

### 3. User Document Has No Dreams
**Possible reasons:**
- User was created but never created any dreams
- Dreams are in the `dreams` collection but not linked to user
- `dreams_summary` field is missing on user document

**Check MongoDB directly:**
```javascript
// In MongoDB Atlas or Compass
db.users.findOne({ user_id: "YOUR_USER_ID" })
// Look for dreams_summary field

db.dreams.find({ user_id: "YOUR_USER_ID" })
// Check if dreams exist in dreams collection
```

### 4. Silent Error in refreshDreamsFromCrud
The error is caught and logged but doesn't show up unless you check console:

```typescript
// Line 657-659 in authStore.ts
catch (e) {
  console.error('[refreshDreamsFromCrud] Failed:', e);
}
```

**Look for this log message in your production console**

## Fix Steps

### Quick Fix: Force Reload Dreams
Add this button temporarily to force refresh:

```typescript
<TouchableOpacity
  onPress={async () => {
    if (user?.uid) {
      await useAuthStore.getState().refreshDreamsFromCrud(user.uid);
    }
  }}
>
  <Text>Force Refresh Dreams</Text>
</TouchableOpacity>
```

### Check if it's a caching issue
Clear app data and reinstall:
1. Uninstall the app
2. Reinstall from store
3. Login again
4. Check if dreams appear

### Verify Backend Endpoints
Test these endpoints manually:
```bash
# 1. Get user data
GET https://packslight-expo-backend-production.up.railway.app/api/users/{userId}?fields=essential

# 2. Get dreams list
GET https://packslight-expo-backend-production.up.railway.app/api/dreams-crud?user_id={userId}&summary=true
```

## Next Steps

1. **Add debug logging** to see which step is failing
2. **Check Railway backend logs** for errors
3. **Verify MongoDB connection** in backend
4. **Test API endpoints** manually with your user_id
5. **Check if dreams exist** in MongoDB for your test user

## Temporary Workaround

If dreams exist in DB but won't load, add a manual refresh button:

```typescript
import { useAuthStore } from '../store/authStore';

// In your screen
const { user, refreshDreamsFromCrud } = useAuthStore();

<Button
  title="Refresh Dreams"
  onPress={() => user?.uid && refreshDreamsFromCrud(user.uid)}
/>
```
