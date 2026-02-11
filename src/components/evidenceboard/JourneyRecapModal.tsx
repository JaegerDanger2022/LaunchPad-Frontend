import React, { useRef, useState } from "react";
import { Modal, View, Text, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import Toast from "react-native-toast-message";
import { EvidenceBoardColors, getThemeColors } from "../../constants/GlobalStyles";
import { useThemeStore } from "../../store/themeStore";

// Helper function to calculate duration between two dates
const calculateDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "1 day";
  } else if (diffDays < 7) {
    return `${diffDays} days`;
  } else if (diffDays < 14) {
    return "1 week";
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""}`;
  } else if (diffDays < 60) {
    return "1 month";
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? "s" : ""}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? "s" : ""}`;
  }
};

export interface Dream {
  id: number;
  title: string;
  category: "travel" | "career" | "financial" | "other";
  status: "in-progress" | "completed";
  progress: number;
  startDate: string;
  targetDate?: string;
  completedDate?: string;
  couragePoints: number;
  proofPoints: any[];
  isComplete?: boolean;
}

interface JourneyRecapModalProps {
  visible: boolean;
  dream: Dream | null;
  totalMissions?: number;
  onClose: () => void;
}

export const JourneyRecapModal: React.FC<JourneyRecapModalProps> = ({
  visible,
  dream,
  onClose,
}) => {
  const { theme } = useThemeStore();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";
  const viewRef = useRef<View>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  if (!dream) return null;

  const handleShare = async () => {
    if (isCapturing) return;

    try {
      setIsCapturing(true);

      // Capture the view as an image (use fileName on Android to avoid hardware bitmap crash)
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
        ...(Platform.OS === "android" && { fileName: "journey-share-" + Date.now() }),
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share Your Journey",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Sharing Not Available",
          text2: "Sharing is not supported on this device",
        });
      }
    } catch (error) {
      console.error("Failed to share:", error);
      Toast.show({
        type: "error",
        text1: "Share Failed",
        text2: "Could not share the image",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSave = async () => {
    if (isCapturing) return;

    try {
      setIsCapturing(true);

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Please allow access to save photos",
        });
        setIsCapturing(false);
        return;
      }

      // Capture the view as an image (use fileName on Android to avoid hardware bitmap crash)
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
        ...(Platform.OS === "android" && { fileName: "journey-save-" + Date.now() }),
      });

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(uri);

      Toast.show({
        type: "success",
        text1: "Saved!",
        text2: "Journey saved to your photos",
      });
    } catch (error) {
      console.error("Failed to save:", error);
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: "Could not save the image",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 400,
          }}>
          <View
            ref={viewRef}
            renderToHardwareTextureAndroid
            style={{
              width: "100%",
              maxWidth: 400,
              backgroundColor: isDark ? colors.bg_secondary : EvidenceBoardColors.white,
              borderRadius: 32,
              overflow: "hidden",
              position: "relative",
            }}>
          {!isDark && (
          <LinearGradient
            colors={["#FEE2E2", "#FEF3C7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          )}

          <TouchableOpacity
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={onClose}>
            <Text
              style={{
                fontSize: 32,
                color: isDark ? colors.text_secondary : EvidenceBoardColors.text.secondary,
                fontWeight: "300",
              }}>
              ×
            </Text>
          </TouchableOpacity>

          <View style={{ padding: 32 }}>
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <LinearGradient
                colors={isDark
                  ? ["rgba(168, 85, 247, 0.3)", "rgba(99, 102, 241, 0.3)"]
                  : ["#FBBF24", "#FB7185"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                <Text style={{ fontSize: 32 }}>🏆</Text>
              </LinearGradient>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: isDark ? colors.text_primary : EvidenceBoardColors.text.primary,
                  marginBottom: 4,
                }}>
                You Did It!
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: isDark ? colors.text_secondary : EvidenceBoardColors.text.secondary,
                }}>
                Journey Complete
              </Text>
            </View>

            <View
              style={{
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : EvidenceBoardColors.white,
                borderRadius: 24,
                padding: 24,
                marginBottom: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? colors.border : "transparent",
              }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? colors.text_secondary : EvidenceBoardColors.text.secondary,
                  }}>
                  Time taken
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: isDark ? colors.text_primary : EvidenceBoardColors.text.primary,
                  }}>
                  {calculateDuration(dream.startDate, dream.completedDate || new Date().toISOString())}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? colors.text_secondary : EvidenceBoardColors.text.secondary,
                  }}>
                  Missions completed
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: isDark ? colors.text_primary : EvidenceBoardColors.text.primary,
                  }}>
                  {dream.proofPoints.length} actions
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? colors.text_secondary : EvidenceBoardColors.text.secondary,
                  }}>
                  Courage earned
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: isDark ? "#FBBF24" : "#B45309",
                  }}>
                  {dream.couragePoints} points
                </Text>
              </View>
            </View>

            <View
              style={{
                borderRadius: 24,
                paddingHorizontal: 24,
                paddingVertical: 20,
                marginBottom: 24,
              }}>
              <Text
                style={{
                  fontSize: 14,
                  fontStyle: "italic",
                  color: isDark ? colors.text_secondary : "#374151",
                  lineHeight: 22,
                  marginBottom: 12,
                }}>
                "When you started, this was just a dream. Today, it's your
                reality. You showed up, took action, and proved to yourself what
                you're capable of."
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isDark ? colors.text_tertiary : EvidenceBoardColors.text.secondary,
                  textAlign: "right",
                }}>
                — Gabby
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={handleShare}
                disabled={isCapturing}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? "rgba(168, 85, 247, 0.2)" : "transparent",
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? "rgba(168, 85, 247, 0.3)" : "transparent",
                  opacity: isCapturing ? 0.6 : 1,
                }}>
                {isCapturing ? (
                  <ActivityIndicator size="small" color={isDark ? "#A855F7" : EvidenceBoardColors.text.primary} />
                ) : (
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: isDark ? "#A855F7" : EvidenceBoardColors.text.primary,
                    }}>
                    Share
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isCapturing}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : EvidenceBoardColors.white,
                  borderRadius: 12,
                  borderWidth: isDark ? 1 : 2,
                  borderColor: isDark ? colors.border : EvidenceBoardColors.gray400,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: isCapturing ? 0.6 : 1,
                }}>
                {isCapturing ? (
                  <ActivityIndicator size="small" color={isDark ? colors.text_primary : "#374151"} />
                ) : (
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: isDark ? colors.text_primary : "#374151"
                    }}>
                    Save to Photos
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
