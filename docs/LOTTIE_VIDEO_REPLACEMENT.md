# Luna Floating Animation - MP4 to Lottie Conversion

## Summary
Replaced the Luna floating MP4 video with a Lottie JSON animation to reduce app size and improve performance.

## Changes Made

### Files Modified:

1. **[src/screens/auth/SignupScreen.tsx](../src/screens/auth/SignupScreen.tsx)**
   - ❌ Removed: `expo-video` imports (`VideoView`, `useVideoPlayer`)
   - ✅ Added: `lottie-react-native` import (`LottieView`)
   - Replaced video player setup with simple Lottie ref
   - Changed from `VideoView` component to `LottieView` component
   - Set `autoPlay` and `loop` props on Lottie animation

2. **[src/components/DreamChoiceModal.tsx](../src/components/DreamChoiceModal.tsx)**
   - ❌ Removed: `expo-video` imports and `useEventListener` from expo
   - ✅ Added: `lottie-react-native` import (`LottieView`)
   - Removed complex video looping logic (seeking between 2s-6s)
   - Simplified to basic Lottie play/pause based on modal visibility
   - Changed from `VideoView` component to `LottieView` component

### Asset Files:
- **Source**: `src/assets/animations/ondoarding/Luna floating.json` (541.7KB)
- **Replaced**: `src/assets/animations/ondoarding/Luna floating.mp4` (can be deleted)

## Benefits

### 1. **Smaller App Size**
- Lottie JSON is typically smaller than MP4 video files
- Better compression and optimization

### 2. **No Video Permissions Needed**
- Removes dependency on `expo-video` for this use case
- Helps avoid confusion with foreground service permissions

### 3. **Better Performance**
- Lottie animations are vector-based
- Lower memory usage
- Smoother rendering on low-end devices

### 4. **Simpler Code**
- No complex video player setup
- No manual loop management with seek points
- Just `autoPlay` and `loop` props

## Code Comparison

### Before (Video):
```tsx
import { VideoView, useVideoPlayer } from 'expo-video';

const player = useVideoPlayer(videoSource, (player) => {
  player.loop = false;
  player.muted = true;
  player.audioMixingMode = 'mixWithOthers';
  player.play();
});

<VideoView
  player={player}
  style={styles.videoBackground}
  contentFit="cover"
  nativeControls={false}
/>
```

### After (Lottie):
```tsx
import LottieView from 'lottie-react-native';

const lottieRef = useRef<LottieView>(null);

<LottieView
  ref={lottieRef}
  source={require('../../assets/animations/ondoarding/Luna floating.json')}
  autoPlay
  loop
  style={styles.videoBackground}
  resizeMode="cover"
/>
```

## Testing Checklist
- [ ] SignupScreen displays Luna floating animation
- [ ] Animation loops smoothly
- [ ] Animation plays automatically on screen load
- [ ] DreamChoiceModal shows Luna animation in the circle
- [ ] Animation pauses when modal closes
- [ ] Animation resumes when modal reopens
- [ ] No performance issues on low-end devices
- [ ] Builds successfully with `eas build`

## Next Steps
1. Test the animations on both iOS and Android
2. Consider removing the MP4 file if no longer needed:
   ```bash
   git rm "src/assets/animations/ondoarding/Luna floating.mp4"
   ```
3. Check if other video files can also be converted to Lottie

## Related Files
- ✅ Already using Lottie in other places (lottie-react-native v7.3.1 installed)
- Still using `expo-video` for:
  - `src/components/CreateDreamModal.tsx` (Chatbox.mp4)
  - `src/components/animations/DreamCompleteVideoOverlay.tsx` (FinalCelebration.mp4)
  - `src/components/animations/AnimatedSplashScreen.tsx` (Splash.mp4)
