import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { BaseToast, ErrorToast, InfoToast } from "react-native-toast-message";
import { useThemeStore } from "../store/themeStore";

export const toastConfig = {
  success: (props: any) => {
    const { theme } = useThemeStore();

    return (
      <View style={styles.toastWrapper}>
        <BlurView
          intensity={80}
          tint={theme === "dark" ? "dark" : "light"}
          style={[
            styles.toastContainer,
            {
              borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
              backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
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
              color: theme === "dark" ? "#FFFFFF" : "#000000",
            }}
            text2Style={{
              fontSize: 13,
              fontFamily: "InstrumentSans-Regular",
              color: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
            }}
          />
        </BlurView>
      </View>
    );
  },

  error: (props: any) => {
    const { theme } = useThemeStore();

    return (
      <View style={styles.toastWrapper}>
        <BlurView
          intensity={80}
          tint={theme === "dark" ? "dark" : "light"}
          style={[
            styles.toastContainer,
            {
              borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
              backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
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
              color: theme === "dark" ? "#FFFFFF" : "#000000",
            }}
            text2Style={{
              fontSize: 13,
              fontFamily: "InstrumentSans-Regular",
              color: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
            }}
          />
        </BlurView>
      </View>
    );
  },

  info: (props: any) => {
    const { theme } = useThemeStore();

    return (
      <View style={styles.toastWrapper}>
        <BlurView
          intensity={80}
          tint={theme === "dark" ? "dark" : "light"}
          style={[
            styles.toastContainer,
            {
              borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
              backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
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
              color: theme === "dark" ? "#FFFFFF" : "#000000",
            }}
            text2Style={{
              fontSize: 13,
              fontFamily: "InstrumentSans-Regular",
              color: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
            }}
          />
        </BlurView>
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
