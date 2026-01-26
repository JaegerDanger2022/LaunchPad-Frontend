# Dark Mode Implementation Plan

## Overview
Implement a complete dark mode feature with #040726 as the main background color, including a toggle switch in the TopNavbar to switch between light and dark themes.

## Architecture

### 1. Theme Management Store
**File**: `src/store/themeStore.ts` (NEW)
- Create a Zustand store to manage theme state
- Store theme preference (light/dark)
- Functions to toggle theme
- Persist theme preference to AsyncStorage

### 2. Color Palette Expansion
**File**: `src/constants/GlobalStyles.ts` (MODIFY)
- Create a theme object structure
- Define light mode colors (existing palette)
- Define dark mode colors:
  - Primary background: #040726 (dark navy)
  - Secondary backgrounds (darker variants)
  - Text colors (white/light variants)
  - Component colors adjusted for dark backgrounds

### 3. Components to Update
All components that use `Color.colorSnow`, `Color.colorWhite`, `Color.colorBlack` need to be theme-aware:

**Priority 1 (High Impact)**:
- [HomeScreen.tsx](src/screens/HomeScreen.tsx) - Main background
- [TopNavbar.tsx](src/components/TopNavbar.tsx) - Add toggle switch + theme colors
- [BottomNavbar.tsx](src/components/BottomNavbar.tsx) - Navigation background
- [GoalCard.tsx](src/components/GoalCard.tsx) - Card styling + glass effect adjustment

**Priority 2**:
- All screens using background colors
- All text color assignments
- All icons that reference Color.colorBlack

### 4. TopNavbar Changes
- Add a Sun/Moon icon toggle button
- Position it next to or near the avatar
- Connect to themeStore toggle function
- Update navbar background color based on theme

### 5. Glass Effect Adjustment for Dark Mode
- The current liquid glass effect uses white overlays
- For dark mode, will need inverted approach (dark overlays on dark backgrounds)
- Update [GoalCard.tsx](src/components/GoalCard.tsx) LinearGradient colors to be theme-aware

## Implementation Steps

1. **Create Theme Store** (`src/store/themeStore.ts`)
   - Define store interface with theme state
   - Add toggle and set functions
   - Add AsyncStorage persistence

2. **Update GlobalStyles** (`src/constants/GlobalStyles.ts`)
   - Create light and dark color palettes
   - Create theme helper object
   - Export theme object and utility functions

3. **Add Icon** (if needed)
   - Import or create Sun/Moon icon for toggle
   - Add to [TopNavbar.tsx](src/components/TopNavbar.tsx)

4. **Update TopNavbar** (`src/components/TopNavbar.tsx`)
   - Connect to themeStore
   - Add toggle button with icon
   - Update colors to use theme

5. **Update HomeScreen** (`src/screens/HomeScreen.tsx`)
   - Use theme colors for backgrounds
   - Update all color references
   - Test glass effect in dark mode

6. **Update GoalCard** (`src/components/GoalCard.tsx`)
   - Create theme-aware glass effect
   - Adjust gradients for dark mode
   - Test visibility and contrast

7. **Update Other Components**
   - SafeAreaView backgrounds
   - Text colors
   - Icon colors
   - Component backgrounds

8. **Testing**
   - Verify theme toggle works
   - Check persistence across app restarts
   - Validate contrast ratios for accessibility
   - Test glass effect in both modes
   - Ensure all screens look good in both themes

## Color Reference

### Dark Mode Palette
- Main Background: #040726
- Secondary Background: #0D0E2B (slightly lighter for cards)
- Text Primary: #FFFFFF
- Text Secondary: #B0B0B0
- Accent colors: Keep existing warm colors (orange, cadet blue, etc.)

### Light Mode Palette (Existing)
- Background: #fff8f5 (colorSnow)
- Text Primary: #000000 (colorBlack)
- Text Secondary: #a29f9b (colorDarkgray)

## Files to Create
- `src/store/themeStore.ts`

## Files to Modify
- `src/constants/GlobalStyles.ts`
- `src/components/TopNavbar.tsx`
- `src/screens/HomeScreen.tsx`
- `src/components/GoalCard.tsx`
- `src/components/BottomNavbar.tsx`
- (Other screens and components as discovered)

## Dependencies
- zustand (already installed)
- expo-constants or AsyncStorage for persistence

## Notes
- Use a context/provider pattern OR pass theme through store
- Consider lazy loading theme on app startup
- Test on both Android and iOS
