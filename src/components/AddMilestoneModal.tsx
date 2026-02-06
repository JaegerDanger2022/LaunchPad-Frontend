import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X } from "lucide-react-native";
import { ChallengeTypeColors, Color, getThemeColors } from "../constants/GlobalStyles";
import { useThemeStore } from "../store/themeStore";

// Selectable challenge types – exclude celebration_moment (reserved for the final milestone)
const SELECTABLE_TYPES = (
  Object.keys(ChallengeTypeColors) as (keyof typeof ChallengeTypeColors)[]
).filter((k) => k !== "celebration_moment");

interface AddMilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, challengeType: string, description?: string) => void;
}

// Inline overlay instead of <Modal> — avoids the nested-Modal-in-transparentModal
// issue where RN Modal doesn't render inside a transparentModal screen.
export const AddMilestoneModal = ({
  visible,
  onClose,
  onSubmit,
}: AddMilestoneModalProps) => {
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState<string>(SELECTABLE_TYPES[0]);

  if (!visible) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit(title.trim(), selectedType, description.trim() || undefined);
    setTitle("");
    setDescription("");
    setSelectedType(SELECTABLE_TYPES[0]);
  };

  return (
    <View
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 500,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.45)",
      }}>
      {/* Backdrop tap to dismiss */}
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={onClose}
        activeOpacity={1}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ width: "100%" }}>
        <View
          style={{
            backgroundColor: themeColors.bg_secondary,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 40,
          }}>
          {/* Drag pill */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme === "dark" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)",
              }}
            />
          </View>

          {/* Header row */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: themeColors.text_primary,
                fontFamily: "InstrumentSans-Bold",
              }}>
              Add Milestone
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <X size={22} color={themeColors.text_secondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Title input */}
          <Text
            style={{
              fontSize: 13,
              color: themeColors.text_secondary,
              fontFamily: "InstrumentSans-Medium",
              marginBottom: 8,
            }}>
            Milestone title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Research flight options"
            placeholderTextColor={themeColors.text_secondary}
            style={{
              fontSize: 15,
              color: themeColors.text_primary,
              fontFamily: "InstrumentSans-Regular",
              borderBottomWidth: 1,
              borderBottomColor: themeColors.border,
              paddingVertical: 10,
              marginBottom: 28,
            }}
            autoCapitalize="sentences"
            autoCorrect
            maxLength={60}
          />

          {/* Description input */}
          <Text
            style={{
              fontSize: 13,
              color: themeColors.text_secondary,
              fontFamily: "InstrumentSans-Medium",
              marginBottom: 8,
            }}>
            Description (optional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add details about this milestone..."
            placeholderTextColor={themeColors.text_secondary}
            multiline
            numberOfLines={3}
            style={{
              fontSize: 15,
              color: themeColors.text_primary,
              fontFamily: "InstrumentSans-Regular",
              borderWidth: 1,
              borderColor: themeColors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 28,
              minHeight: 80,
              textAlignVertical: "top",
            }}
            autoCapitalize="sentences"
            autoCorrect
            maxLength={200}
          />

          {/* Color picker */}
          <Text
            style={{
              fontSize: 13,
              color: themeColors.text_secondary,
              fontFamily: "InstrumentSans-Medium",
              marginBottom: 12,
            }}>
            Color
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
            {SELECTABLE_TYPES.map((type) => {
              const color = ChallengeTypeColors[type];
              const isSelected = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedType(type)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: color,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: Color.colorWhite,
                    shadowColor: isSelected ? color : "transparent",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isSelected ? 0.5 : 0,
                    shadowRadius: isSelected ? 6 : 0,
                    elevation: isSelected ? 4 : 0,
                  }}
                />
              );
            })}
          </View>

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!title.trim()}
            style={{
              backgroundColor: title.trim() ? ChallengeTypeColors[selectedType as keyof typeof ChallengeTypeColors] : "rgba(0,0,0,0.12)",
              paddingVertical: 15,
              borderRadius: 14,
              alignItems: "center",
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: Color.colorWhite,
                fontFamily: "InstrumentSans-Bold",
              }}>
              Add Milestone
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
