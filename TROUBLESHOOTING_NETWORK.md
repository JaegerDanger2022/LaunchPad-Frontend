# Network Troubleshooting Guide

## Problem: "Network request failed" errors

This occurs when your mobile device/emulator cannot reach the backend server.

## Diagnostic Steps

### 1. Check Backend Status
```bash
# Test backend connectivity from your computer
npx ts-node scripts/test-backend-connection.ts
```

### 2. Verify Environment Variables
Check your `.env` file:
```
EXPO_PUBLIC_API_URL=https://launchpad-backend-production.up.railway.app/api
```

### 3. Check Device Internet Connection
- Open browser on device
- Visit: https://launchpad-backend-production.up.railway.app/docs
- If this fails, your device has no internet

## Solutions by Platform

### Physical Device (Expo Go)

**Option A: Same WiFi Network**
- Ensure your phone and computer are on the **same WiFi network**
- Restart Expo dev server: `npx expo start --clear`

**Option B: Backend is Sleeping**
Railway free tier apps sleep after inactivity. Wake it up:
```bash
curl https://launchpad-backend-production.up.railway.app/docs
```

**Option C: DNS Issues**
Some networks block external domains. Try:
1. Switch to mobile data (4G/5G)
2. Or use a different WiFi network

### iOS Simulator

**Issue: SSL Certificate Errors**
iOS Simulator might have certificate issues with Railway. Solutions:

1. **Use localhost backend** (if running locally):
   ```bash
   # In backend repo
   cd C:\Users\mkmen\Documents\GitHub\BUSINESS_REPOS\LaunchPad-Backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 5000
   ```

   Then update `.env`:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:5000/api
   ```

2. **Clear simulator cache**:
   ```bash
   npx expo start --clear
   # Then reset simulator: Device > Erase All Content and Settings
   ```

### Android Emulator

**Issue: localhost/127.0.0.1 won't work**

Android emulator uses `10.0.2.2` to access host machine's localhost.

1. **Run backend locally**:
   ```bash
   cd C:\Users\mkmen\Documents\GitHub\BUSINESS_REPOS\LaunchPad-Backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 5000
   ```

2. **Update `.env`**:
   ```
   EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
   ```

3. **Restart Expo**:
   ```bash
   npx expo start --clear
   ```

## Debug Mode

Enable detailed network logging in your app:

1. Open `src/config/api.ts`
2. All network calls already log to console
3. Check Metro bundler logs for detailed errors

## Test Script

Run this to verify connectivity:
```bash
npx ts-node scripts/test-backend-connection.ts
```

## Common Error Messages

### "Network request failed"
- Device has no internet
- Backend is sleeping (Railway)
- Wrong URL in `.env`

### "TypeError: Network request failed"
- DNS resolution failed
- Firewall blocking requests
- SSL/TLS handshake failed

### "HTTP 404 Not Found"
- Endpoint path is wrong
- Backend route doesn't exist

### "HTTP 500 Internal Server Error"
- Backend code error
- Database connection failed
- Check Railway logs

## Still Having Issues?

1. **Check Railway logs**: https://railway.app/dashboard
2. **Verify backend is deployed**: Visit `/docs` endpoint in browser
3. **Test with Postman/Insomnia**: Make requests to backend directly
4. **Check firewall**: Disable temporarily to test

## Development Workflow

For smooth development:

1. **Run backend locally** when possible:
   ```bash
   cd LaunchPad-Backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 5000
   ```

2. **Use ngrok** for external access:
   ```bash
   ngrok http 5000
   # Use the https URL in EXPO_PUBLIC_API_URL
   ```

3. **Keep Railway backend as production** fallback
