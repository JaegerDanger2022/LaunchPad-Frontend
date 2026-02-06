/**
 * MessageBubble Component - Usage Examples
 *
 * This file demonstrates how to use the premium glassmorphic MessageBubble component
 * with various configurations.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { MessageBubble } from './MessageBubble';

export const MessageBubbleExample: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Example 1: Basic mascot message with video avatar */}
      <MessageBubble
        role="mascot"
        text="Hey there! 👋 I'm Luna, your dream companion. Let's create something amazing together!"
        theme="dark"
        mascotVideoSource={require('../assets/animations/chatbox/Chatbox.mp4')}
      />

      {/* Example 2: User message */}
      <MessageBubble
        role="user"
        text="I want to learn web development and build my first app!"
        theme="dark"
      />

      {/* Example 3: Mascot message without video (shows emoji placeholder) */}
      <MessageBubble
        role="mascot"
        text="That's a fantastic goal! Web development is an exciting journey. What specific technologies are you interested in?"
        theme="dark"
      />

      {/* Example 4: Longer user message */}
      <MessageBubble
        role="user"
        text="I'm thinking about learning React and TypeScript. I've heard they're really popular and powerful for building modern web applications."
        theme="dark"
      />

      {/* Example 5: Light theme examples */}
      <View style={{ marginTop: 20 }}>
        <MessageBubble
          role="mascot"
          text="Perfect choice! React and TypeScript are excellent for building scalable applications."
          theme="light"
          mascotVideoSource={require('../assets/animations/chatbox/Chatbox.mp4')}
        />

        <MessageBubble
          role="user"
          text="Thanks! When should I start?"
          theme="light"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050938', // Dark theme background
  },
  content: {
    padding: 20,
  },
});

/**
 * INTEGRATION GUIDE
 *
 * To integrate MessageBubble into your chat screen:
 *
 * 1. Import the component:
 *    import { MessageBubble } from './components/MessageBubble';
 *
 * 2. Get your theme:
 *    const { theme } = useThemeStore();
 *
 * 3. Map your messages:
 *    {messages.map((msg, i) => (
 *      <MessageBubble
 *        key={i}
 *        role={msg.role === 'user' ? 'user' : 'mascot'}
 *        text={msg.text}
 *        theme={theme}
 *        mascotVideoSource={
 *          msg.role === 'assistant'
 *            ? require('../assets/animations/chatbox/Chatbox.mp4')
 *            : undefined
 *        }
 *      />
 *    ))}
 *
 * 4. Optional: Handle video loading events:
 *    <MessageBubble
 *      role="mascot"
 *      text="Hello!"
 *      theme={theme}
 *      mascotVideoSource={videoSource}
 *      onVideoLoad={() => console.log('Video loaded!')}
 *      videoStyle={{ transform: [{ scale: 1.2 }] }}
 *    />
 *
 * FEATURES:
 * - Glassmorphism effect using expo-blur
 * - LinearGradient for mascot messages (soft orange to gold)
 * - Asymmetric shapes (sharp corner on bottom-left for user, bottom-right for mascot)
 * - Small circular avatar slot for mascot video (36x36)
 * - Theme-aware colors (light/dark mode support)
 * - Subtle shadows and glows for premium feel
 * - Responsive to different text lengths
 */
