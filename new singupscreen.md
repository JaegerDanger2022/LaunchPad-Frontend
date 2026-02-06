# Task: Build "Luna" Onboarding Screen for Expo

Replicate the Gentler Streak onboarding experience using **React Native**, **Expo**, **Reanimated**, and **Expo-AV**.

## 1. Visual Architecture

- **Background Layer:** A full-screen `Video` component (using `expo-av`) playing `luna_mascot.mp4` on a loop.
- **UI Layer:** A `KeyboardAvoidingView` containing a card-style input area at the bottom.
- **Styling:** Use "Soft UI" principles: high border-radius (30+), heavy typography (Inter-Black or System Bold), and subtle shadows.

## 2. Dynamic Text for Luna (Mascot)

Luna should "speak" to the user. Use a state-based system to change the header text based on which field is being filled.

| Field        | Luna's Dialogue (Header Text)                                        |
| :----------- | :------------------------------------------------------------------- |
| **Name**     | "Hi! I'm Luna. What should I call you?"                              |
| **Email**    | "Nice to e-meet you {name}! Where can I send your progress reports?" |
| **Password** | "Let's keep your data safe. Pick a strong password!"                 |
| **Success**  | "Perfect! You're all set to start your journey."                     |

## 3. Technical Requirements

### Animation Logic

- Use **React Native Reanimated** (or Moti) to animate the text box appearance.
- When the user moves to the next field, the text should "fade and slide" up.
- The `TextInput` should have a floating label effect.

### Components to Use:

1. **Video Background:**
   - Source: `require('./assets/animations/ondoarding/Luna floating.mp4')`
   - Props: `isLooping`, `shouldPlay`, `isMuted`, `resizeMode="cover"`
2. **Custom Input:**
   - A `View` acting as a text box with a large font size.
   - Use `selectionColor` matching the brand (e.g., `#FF5A36`).

## 4. Code Structure Guide

- Create a `steps` array containing the questions.
- Maintain a `currentStep` index state.
- Use a "Next" button that validates the current field before incrementing the index.

## 5. Styling Specs (Gentler Streak Style)

- **Background Color:** Match the video background hex (e.g., `#F7F7F7`).
- **Card Background:** White with 0.9 opacity.
- **Typography:**
  - Header: `fontSize: 28`, `fontWeight: '900'`, `lineHeight: 34`.
  - Input: `fontSize: 20`, `padding: 15`.

---

**Deliverable:** Please provide the full code for `SignupScreen.js` and any necessary custom hooks for the typewriter/fade animations.
