# MessageBubble Component - Design Specifications

## Overview
A premium glassmorphic chat message bubble component with asymmetric shapes and mascot avatar integration.

## Visual Design

### Mascot Message (Left-aligned)
```
┌─────────────────────────────────────┐
│   🌙                                │  ← Circular avatar (36x36)
│   ╭──────────────────────────────╮  │     with video or emoji
│   │  Hey there! I'm Luna, your  │  │
│   │  dream companion.            │  │  ← Glassmorphic bubble
│   │                              │  │     with gradient background
│   ╰──────────────────────────────╯  │     Sharp bottom-right corner
└─────────────────────────────────────┘
```

### User Message (Right-aligned)
```
┌─────────────────────────────────────┐
│                 ╭─────────────────╮ │
│                 │  I want to      │ │  ← Glassmorphic bubble
│                 │  learn web dev! │ │     No avatar
│                 ╰─────────────────╯ │     Sharp bottom-left corner
└─────────────────────────────────────┘
```

## Technical Specifications

### Dimensions
- **Max width**: 85% of screen width
- **Min height**: 44px
- **Padding**: 16px horizontal, 12px vertical
- **Avatar size**: 36x36 (circular)
- **Avatar spacing**: 10px right margin

### Border Radius
- **Standard corners**: 20px
- **Sharp corner (Mascot)**: bottom-right = 4px
- **Sharp corner (User)**: bottom-left = 4px

### Colors

#### Dark Theme
- **Blur tint**: 'dark'
- **Blur intensity**: 40
- **Text color**: `#ffffff`
- **Border**: `rgba(255, 255, 255, 0.15)`
- **User bubble background**: `rgba(43, 45, 86, 0.85)`
- **Mascot gradient**:
  - Start: `rgba(251, 99, 34, 0.9)` (soft orange)
  - End: `rgba(247, 153, 113, 0.9)` (gold)

#### Light Theme
- **Blur tint**: 'light'
- **Blur intensity**: 80
- **Text color**: `#1F2937`
- **Border**: `rgba(0, 0, 0, 0.1)`
- **User bubble background**: `rgba(255, 255, 255, 0.85)`
- **Mascot gradient**:
  - Start: `#fb6322` (vibrant orange)
  - End: `#f79971` (vibrant gold)

### Typography
- **Font**: InstrumentSans-Regular
- **Size**: 15px
- **Line height**: 22px

### Shadow & Elevation
- **Shadow color**: `#000`
- **Shadow offset**: `{ width: 0, height: 2 }`
- **Shadow opacity**: 0.15
- **Shadow radius**: 8
- **Elevation**: 4 (Android)

### Avatar Glow
- **Shadow color**: `#fb6322` (orange)
- **Shadow offset**: `{ width: 0, height: 0 }`
- **Shadow opacity**: 0.4
- **Shadow radius**: 6
- **Elevation**: 3 (Android)

## Component Props

```typescript
interface MessageBubbleProps {
  role: 'user' | 'mascot';           // Required: determines layout
  text: string;                       // Required: message content
  theme?: 'light' | 'dark';          // Optional: defaults to 'dark'
  mascotVideoSource?: any;            // Optional: video for avatar
  videoStyle?: ViewStyle;             // Optional: avatar video styling
  onVideoLoad?: () => void;           // Optional: video load callback
}
```

## Usage Example

```tsx
import { MessageBubble } from './components/MessageBubble';
import { useThemeStore } from './store/themeStore';

const ChatScreen = () => {
  const { theme } = useThemeStore();

  return (
    <ScrollView>
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          role={msg.role === 'user' ? 'user' : 'mascot'}
          text={msg.text}
          theme={theme}
          mascotVideoSource={
            msg.role === 'assistant'
              ? require('../assets/animations/chatbox/Chatbox.mp4')
              : undefined
          }
        />
      ))}
    </ScrollView>
  );
};
```

## Glassmorphism Implementation

### Layer Structure (Mascot Message)
```
┌─────────────────────────────────────┐
│  1. LinearGradient (background)     │
│     ├─ Soft orange to gold          │
│     └─ Full coverage                │
│                                     │
│  2. BlurView (frosted glass effect) │
│     ├─ Blur intensity: 40/80        │
│     ├─ Tint: dark/light             │
│     └─ Contains text                │
│                                     │
│  3. Border (subtle outline)         │
│     └─ Semi-transparent white/black │
└─────────────────────────────────────┘
```

### Layer Structure (User Message)
```
┌─────────────────────────────────────┐
│  1. BlurView (main container)       │
│     └─ Tint: dark/light             │
│                                     │
│  2. Background (inside BlurView)    │
│     └─ Semi-transparent bg color    │
│                                     │
│  3. Text                            │
│     └─ Theme-aware color            │
└─────────────────────────────────────┘
```

## Dependencies
- `expo-blur`: For glassmorphism effect
- `expo-linear-gradient`: For mascot gradient
- `expo-av`: For video avatar playback

## Integration Checklist
- [x] Create MessageBubble.tsx component
- [x] Implement glassmorphism with expo-blur
- [x] Add asymmetric border radius
- [x] Integrate LinearGradient for mascot messages
- [x] Add avatar slot with video support
- [x] Refactor CreateDreamModal to use MessageBubble
- [x] Update memory documentation
- [x] Create usage examples and design specs

## File Locations
- **Component**: `src/components/MessageBubble.tsx`
- **Example**: `src/components/MessageBubbleExample.tsx`
- **Integration**: `src/components/CreateDreamModal.tsx`
- **Design Specs**: `docs/MessageBubble-Design-Specs.md`
