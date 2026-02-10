# Lottie Frame-Based Segment Looping Implementation

This document details the frame-based segment looping logic implemented for Lottie animations to replicate the original video behavior.

## Overview

All video (.mp4) files have been replaced with Lottie (.json) animations. To maintain the original behavior where specific segments of the videos would loop based on application state, we've implemented frame-based looping using Lottie's `play(startFrame, endFrame)` method.

## Chatbox Animation (Luna Chat Head)

### Animation Specs
- **File**: `src/assets/animations/chatbox/Chatbox.json`
- **Frame Rate**: 30 fps
- **Total Frames**: 429 (14.3 seconds)

### Segment Mapping

| State | Time Range | Frame Range | Description |
|-------|-----------|-------------|-------------|
| **rendering** | 0s - 4.5s | 0 - 135 | AI is typing/generating response |
| **waiting** | 5s - 9.5s | 150 - 285 | Waiting for user input |
| **sending** | 11s - 14s | 330 - 420 | Processing user message |

### Implementation

#### [CreateDreamModal.tsx](../src/components/CreateDreamModal.tsx)
```tsx
const ANIMATION_SEGMENTS = {
  rendering: { start: 0, end: 135 },      // 0s - 4.5s
  waiting: { start: 150, end: 285 },      // 5s - 9.5s
  sending: { start: 330, end: 420 },      // 11s - 14s
};

const [chatStatus, setChatStatus] = useState<ChatStatus>('waiting');

// Control animation based on state
useEffect(() => {
  if (!lottieRef.current) return;
  const segment = ANIMATION_SEGMENTS[chatStatus];
  lottieRef.current.play(segment.start, segment.end);
}, [chatStatus]);
```

**State Transitions**:
1. **Modal opens** → `setChatStatus('sending')` → Loading initial greeting
2. **AI message starts typing** → `setChatStatus('rendering')` → Shows typing animation
3. **Typewriter finishes** → `setChatStatus('waiting')` → Waiting for user
4. **User sends message** → `setChatStatus('sending')` → Processing message
5. **Modal closes** → `setChatStatus('waiting')` → Reset state

#### [LunaChatHeader.tsx](../src/components/LunaChatHeader.tsx)
Reusable component that accepts `chatStatus` prop:
```tsx
interface LunaChatHeaderProps {
  chatStatus?: ChatStatus;
  borderColor?: string;
}
```

## Luna Floating Animation (Onboarding)

### Animation Specs
- **File**: `src/assets/animations/ondoarding/Luna floating.json`
- **Frame Rate**: 16 fps
- **Total Frames**: 100 (6.25 seconds)

### Looping Strategy
- **Initial play**: Frames 0-100 (full animation, plays once)
- **Loop segment**: Frames 32-96 (2s-6s, repeats continuously)

This creates a smooth intro where Luna floats in from the start, then continuously loops the middle floating section.

### Implementation

#### [SignupScreen.tsx](../src/screens/auth/SignupScreen.tsx)
```tsx
const isFirstPlay = useRef(true);

const handleAnimationFinish = () => {
  if (isFirstPlay.current) {
    isFirstPlay.current = false;
    lottieRef.current?.play(32, 96); // Start looping middle section
  } else {
    lottieRef.current?.play(32, 96); // Continue looping
  }
};

<LottieView
  ref={lottieRef}
  autoPlay
  loop={false}
  onAnimationFinish={handleAnimationFinish}
  // ...
/>
```

#### [DreamChoiceModal.tsx](../src/components/DreamChoiceModal.tsx)
Same strategy as SignupScreen, but also handles play/pause based on modal visibility:
```tsx
useEffect(() => {
  if (visible && lottieRef.current) {
    if (isFirstPlay.current) {
      lottieRef.current.play(); // Play full animation first time
    } else {
      lottieRef.current.play(32, 96); // Resume loop segment
    }
  } else if (!visible && lottieRef.current) {
    lottieRef.current.pause();
  }
}, [visible]);
```

## Frame Calculation Formula

To convert time ranges to frame ranges:

```
frameNumber = timeInSeconds * framesPerSecond
```

**Example (Chatbox at 30fps)**:
- 4.5s × 30fps = 135 frames
- 9.5s × 30fps = 285 frames

**Example (Luna floating at 16fps)**:
- 2s × 16fps = 32 frames
- 6s × 16fps = 96 frames

## Benefits Over Video

1. **Precise Control**: Frame-accurate seeking without video player quirks
2. **No Seeking Delays**: Instant frame jumps vs. video seek operations
3. **Smaller Bundle**: Lottie JSON files compress better than MP4
4. **No Audio Handling**: No need for `muted` or `audioMixingMode` settings
5. **Consistent Playback**: Same behavior across all platforms
6. **Simpler Code**: No complex video event listeners or seek state management

## Testing Checklist

### Chatbox Animation
- [ ] **CreateDreamModal** - Verify all 3 states show correct animations:
  - [ ] Opening modal shows "sending" animation
  - [ ] AI typing shows "rendering" animation
  - [ ] Waiting for user shows "waiting" animation
  - [ ] User sends message shows "sending" animation
- [ ] **LunaChatHeader** (if used) - Verify chatStatus prop controls animation

### Luna Floating Animation
- [ ] **SignupScreen** - Animation plays once fully, then loops middle section smoothly
- [ ] **DreamChoiceModal** - Animation plays on modal open, pauses on close
- [ ] No stuttering or frame skips during loop transitions

## Troubleshooting

### Animation doesn't loop
- Check that `loop={false}` is set on the LottieView
- Verify `onAnimationFinish` callback is properly connected
- Ensure `lottieRef.current` is not null before calling `play()`

### Wrong segment plays
- Double-check frame calculations (time × fps)
- Verify animation segments in JSON match expected durations
- Use `console.log` to debug chatStatus transitions

### Animation stutters
- Ensure only one `play()` call happens at a time
- Check that state transitions don't trigger multiple useEffects
- Add `resizeMode="cover"` to prevent layout shifts

## Related Files

- ✅ [CreateDreamModal.tsx](../src/components/CreateDreamModal.tsx)
- ✅ [LunaChatHeader.tsx](../src/components/LunaChatHeader.tsx)
- ✅ [SignupScreen.tsx](../src/screens/auth/SignupScreen.tsx)
- ✅ [DreamChoiceModal.tsx](../src/components/DreamChoiceModal.tsx)
- ✅ [AnimatedSplashScreen.tsx](../src/components/animations/AnimatedSplashScreen.tsx) (simple loop)
- ✅ [DreamCompleteVideoOverlay.tsx](../src/components/animations/DreamCompleteVideoOverlay.tsx) (simple play-once)
