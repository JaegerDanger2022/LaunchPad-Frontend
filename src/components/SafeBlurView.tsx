import React from "react";
import { Platform, View, ViewStyle, StyleProp } from "react-native";
import { BlurView, BlurViewProps } from "expo-blur";

/**
 * A cross-platform BlurView wrapper.
 * - iOS: Uses expo-blur's BlurView for native blur effects.
 * - Android: Uses a regular View with a semi-transparent background to avoid
 *   the "Software rendering doesn't support hardware bitmaps" crash that occurs
 *   when BlurView's software rendering conflicts with hardware-backed bitmaps
 *   (e.g., from RevenueCat paywalls, react-native-view-shot, etc.).
 */
export const SafeBlurView: React.FC<BlurViewProps> = ({
  intensity,
  tint,
  style,
  children,
  ...rest
}) => {
  if (Platform.OS === "ios") {
    return (
      <BlurView intensity={intensity} tint={tint} style={style} {...rest}>
        {children}
      </BlurView>
    );
  }

  // On Android, approximate the blur with a semi-transparent background.
  // Extract the existing backgroundColor from style to preserve it, or
  // generate a sensible default based on the tint.
  const flatStyle = (Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style || {}) as ViewStyle;
  const fallbackBg =
    tint === "dark"
      ? "rgba(30, 30, 30, 0.85)"
      : "rgba(255, 255, 255, 0.85)";

  return (
    <View
      style={[
        style,
        {
          backgroundColor: flatStyle.backgroundColor || fallbackBg,
        },
      ]}
      {...rest}>
      {children}
    </View>
  );
};
