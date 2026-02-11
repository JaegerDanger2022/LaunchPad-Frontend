import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { SafeBlurView } from "./SafeBlurView";
import { BaseToast, ErrorToast, InfoToast } from "react-native-toast-message";
import { useThemeStore } from "../store/themeStore";

const isAndroid = Platform.OS === "android";

export const toastConfig = {
  success: (props: any) => {
    const { theme } = useThemeStore();
    const isDark = theme === "dark";

    return (
      <View style={styles.toastWrapper}>
        <SafeBlurView
          intensity={80}
          experimentalBlurMethod="dimezisBlurView"
          tint={isDark ? "dark" : "light"}
          style={[
            styles.toastContainer,
            {
              borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
              backgroundColor: isAndroid
                ? (isDark ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)")
                : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"),
            },
          ]}>
          <BaseToast
            {...props}
            style={{
              borderLeftColor: "#00D4AA",
              borderLeftWidth: 5,
              backgroundColor: "transparent",
              height: undefined,
              paddingVertical: 12,
            }}
            contentContainerStyle={{
              paddingHorizontal: 15,
              backgroundColor: "transparent",
            }}
            text1Style={{
              fontSize: 15,
              fontWeight: "700",
              fontFamily: "InstrumentSans-Bold",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
            text2Style={{
              fontSize: 13,
              fontFamily: "InstrumentSans-Regular",
              color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
            }}
          />
        </SafeBlurView>
      </View>
    );
  },

  error: (props: any) => {
    const { theme } = useThemeStore();
    const isDark = theme === "dark";

    return (
      <View style={styles.toastWrapper}>
        <SafeBlurView
          intensity={80}
          experimentalBlurMethod="dimezisBlurView"
          tint={isDark ? "dark" : "light"}
          style={[
            styles.toastContainer,
            {
              borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
              backgroundColor: isAndroid
                ? (isDark ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)")
                : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"),
            },
          ]}>
          <ErrorToast
            {...props}
            style={{
              borderLeftColor: "#FF6B6B",
              borderLeftWidth: 5,
              backgroundColor: "transparent",
              height: undefined,
              paddingVertical: 12,
            }}
            contentContainerStyle={{
              paddingHorizontal: 15,
              backgroundColor: "transparent",
            }}
            text1Style={{
              fontSize: 15,
              fontWeight: "700",
              fontFamily: "InstrumentSans-Bold",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
            text2Style={{
              fontSize: 13,
              fontFamily: "InstrumentSans-Regular",
              color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
            }}
          />
        </SafeBlurView>
      </View>
    );
  },

  info: (props: any) => {
    const { theme } = useThemeStore();
    const isDark = theme === "dark";

    return (
      <View style={styles.toastWrapper}>
        <SafeBlurView
          intensity={80}
          experimentalBlurMethod="dimezisBlurView"
          tint={isDark ? "dark" : "light"}
          style={[
            styles.toastContainer,
            {
              borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
              backgroundColor: isAndroid
                ? (isDark ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)")
                : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"),
            },
          ]}>
          <InfoToast
            {...props}
            style={{
              borderLeftColor: "#4A90E2",
              borderLeftWidth: 5,
              backgroundColor: "transparent",
              height: undefined,
              paddingVertical: 12,
            }}
            contentContainerStyle={{
              paddingHorizontal: 15,
              backgroundColor: "transparent",
            }}
            text1Style={{
              fontSize: 15,
              fontWeight: "700",
              fontFamily: "InstrumentSans-Bold",
              color: isDark ? "#FFFFFF" : "#000000",
            }}
            text2Style={{
              fontSize: 13,
              fontFamily: "InstrumentSans-Regular",
              color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
            }}
          />
        </SafeBlurView>
      </View>
    );
  },
};

const styles = StyleSheet.create({
  toastWrapper: {
    width: "90%",
    paddingHorizontal: 16,
  },
  toastContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
