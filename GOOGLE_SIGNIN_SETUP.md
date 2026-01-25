# Google Sign-In Setup Guide

## ✅ Implementation Complete

Google Sign-In has been integrated into your PacksLight authentication system. Users can now sign in with their Google account on both Login and Signup screens.

## 📦 What Was Installed

- `@react-native-google-signin/google-signin` - Native Google Sign-In library for React Native

## 📂 Files Created/Modified

### New Features
- **LoginScreen**: "Sign in with Google" button with divider
- **SignupScreen**: "Sign up with Google" button with divider
- **authStore**: `googleSignIn()` method and Google error handling
- **firebase.ts**: Google Sign-In initialization

## 🔧 Next Steps: Get Google OAuth Credentials

### 1. Get Your Web Client ID

For the app to work, you need to obtain your Google OAuth Web Client ID from your Firebase project.

**Steps:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **dream-to-do-70d09** project
3. Click **Settings** (gear icon) in the top-left
4. Go to **Project settings** tab
5. Scroll down to **Your apps** section
6. Look for your **Web** app (if none exists, click the web icon to add)
7. Copy the following from the Firebase config:
   - `apiKey` (already in firebase.ts)
   - Look for OAuth configuration (may need to check Google Cloud Console)

### 2. Create Google OAuth Credentials (if not auto-created)

If Firebase doesn't show OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Make sure **dream-to-do-70d09** project is selected
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Choose **Web application** as the application type
6. Add authorized JavaScript origins:
   - `http://localhost:8081`
   - `http://localhost:8080`
   - `http://localhost:3000`
7. Add authorized redirect URIs:
   - `http://localhost:8081/callback`
   - `http://localhost:8080/callback`
8. Copy the **Client ID**

### 3. Update Firebase Config

Open `src/config/firebase.ts` and replace the `GOOGLE_WEB_CLIENT_ID`:

```typescript
// Replace this:
export const GOOGLE_WEB_CLIENT_ID = "191645644567-1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6j.apps.googleusercontent.com";

// With your actual Web Client ID from Google Cloud Console
```

### 4. Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **dream-to-do-70d09** project
3. Navigate to **Authentication** > **Sign-in method**
4. Look for **Google** in the list
5. Click the toggle to **Enable** it
6. Select the default public project or keep as is
7. Click **Save**

## 🚀 How It Works

### Login Flow with Google

1. User taps "Sign in with Google" on Login screen
2. Google Sign-In popup appears (device-native)
3. User selects their Google account or signs in
4. App receives Google ID token
5. Firebase exchanges token for auth credential
6. User is logged in and navigated to Home screen

### Signup Flow with Google

1. User taps "Sign up with Google" on Signup screen
2. Same Google authentication flow as above
3. If account doesn't exist, Firebase creates new account
4. User is logged in and navigated to Home screen

### Error Handling

If Google Sign-In fails, users see friendly error messages:
- **"Sign-in cancelled"** - User cancelled the Google Sign-In dialog
- **"Sign-in in progress"** - Another sign-in is already happening
- **"Google Play Services not available"** - Device missing required services
- **Other errors** - Firebase or network issues

## 🧪 Testing Google Sign-In

### Test Login with Google

1. Open app → Login screen is shown
2. Tap "Sign in with Google"
3. Select a Google account (or sign in if not logged in)
4. Should navigate to Home screen
5. Check Firebase Console → Authentication → Users
6. New user with Google account should appear

### Test Signup with Google

1. Open app → Login screen
2. Tap "Sign Up"
3. Tap "Sign up with Google"
4. Select Google account
5. Should navigate to Home screen
6. Check Firebase Console → New user should appear with Google provider

### Test Account Linking (Same Email)

If user signs up with email, then tries Google Sign-In with same email:
- Firebase will link the accounts together automatically
- User can login with either email or Google

## 🔐 Security Features

✅ **Secure Token Exchange** - Google tokens exchanged for Firebase credentials
✅ **No Password Exposure** - Users login via Google, no password sent to app
✅ **Account Linking** - Same email across methods automatically linked
✅ **Error Handling** - Graceful error messages for Google services issues
✅ **Device-Native Flow** - Uses device's native Google Sign-In (more secure)

## 📱 Platform-Specific Notes

### iOS Setup

For iOS devices, you may need to add Google Sign-In configuration to your Expo app:

1. Add to `app.json` (or `app.config.js` if using config file):

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosClientId": "YOUR_IOS_CLIENT_ID"
        }
      ]
    ]
  }
}
```

2. Get iOS Client ID from Google Cloud Console:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth 2.0 Client ID**
   - Choose **iOS** as application type
   - Follow the steps to create iOS credentials
   - Copy the generated Client ID

### Android Setup

For Android, Google Play Services are required:
- If Google Play Services aren't installed, users will see error
- Most modern Android devices have it, but older devices may not

## 🐛 Troubleshooting

### Google Sign-In button not working

1. Check that `GOOGLE_WEB_CLIENT_ID` is set correctly in `src/config/firebase.ts`
2. Verify Google Sign-In is enabled in Firebase Console
3. Check browser console/Expo logs for errors
4. Try clearing Metro cache: `npx expo start --clear`

### "Google Play Services not available" error (Android)

- User's Android device doesn't have Google Play Services installed
- This is rare on modern devices
- Consider alternative auth methods for those users

### "Sign-in cancelled" message appears

- User intentionally cancelled Google Sign-In dialog
- No error occurred, just user choice
- User can try again or use email/password login

### Account not created in Firebase Console

- Google Sign-In succeeded but account not visible
- Wait a few seconds and refresh Firebase Console
- Check that you're looking in the correct Firebase project
- Verify Google provider is enabled in Firebase Authentication

### Getting different errors on iOS vs Android

- iOS and Android have different Google Play Services implementations
- iOS requires iOS Client ID to be configured
- Android requires Google Play Services on device
- Test on both platforms with different Google accounts

## 🔗 Quick Links

- [Firebase Console](https://console.firebase.google.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Google Sign-In Docs](https://developers.google.com/identity/sign-in)
- [React Native Google Sign-In Docs](https://react-native-google-signin.github.io/)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)

## 📝 Notes

- Google Web Client ID is stored in `src/config/firebase.ts` - this is safe (not a secret)
- Keep your Firebase project secure - don't share it publicly
- For production, always use environment variables for sensitive credentials
- Google Sign-In requires internet connection
- Users can link multiple auth methods to same email

## 🚀 Next Steps

After testing Google Sign-In works:
1. Consider adding other social providers (Apple, GitHub)
2. Add email verification for new accounts
3. Add user profile completion flow
4. Consider biometric authentication
5. Add rate limiting to prevent abuse

---

**Implementation Date:** January 25, 2026
**Status:** ✅ Ready for Testing (Pending Web Client ID Configuration)

