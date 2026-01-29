import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Animated,
  FlatList,
  useWindowDimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { Color, getThemeColors } from "../constants/GlobalStyles";
import { GoalCard, type GoalCardData } from "../components/GoalCard";
import { BottomNavbar } from "../components/BottomNavbar";
import { CreateDreamModal } from "../components/CreateDreamModal";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";

const AllDreamsScreen = ({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const { width } = useWindowDimensions();
  const [isCreateDreamModalVisible, setIsCreateDreamModalVisible] = useState(false);

  // Get user data from auth store
  const { userData, addToRecents } = useAuthStore();
  const { theme } = useThemeStore();
  const themeColors = getThemeColors(theme);

  // Calculate column width (2 columns with 17px margins on each side and 14px gap)
  const columnWidth = (width - 34 - 14) / 2;

  useEffect(() => {
    // Update status bar based on theme
    StatusBar.setBarStyle(theme === "light" ? "dark-content" : "light-content", true);
  }, [theme]);

  useEffect(() => {
    // Fade in and slide up on mount
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const convertBinaryToImage = (binaryData: string) => {
    try {
      return `data:image/jpeg;base64,${binaryData}`;
    } catch (error) {
      console.error("Error converting binary to image:", error);
      return null;
    }
  };

  // Sort dreams with active status first
  const sortedDreams: GoalCardData[] = useMemo(() => {
    if (!userData?.dreams || !Array.isArray(userData.dreams)) {
      return [];
    }

    // Separate active and non-active dreams
    const activeDreams = userData.dreams.filter((dream: any) => dream.status === "active");
    const inactiveDreams = userData.dreams.filter((dream: any) => dream.status !== "active");

    // Combine with active first
    const sorted = [...activeDreams, ...inactiveDreams];

    return sorted.map((dream: any) => ({
      title: dream.dream || "",
      bgImage: dream.dream_image_bytes
        ? { uri: convertBinaryToImage(dream.dream_image_bytes) }
        : require("../assets/images/goal-podcast.png"),
      bgColor: dream.dream_card_bg || Color.colorBurlywood,
      progressColor: "#6B9BD1",
      threadId: dream.thread_id,
      status: dream.status,
    }));
  }, [userData?.dreams]);

  const handleGoalCardPress = (threadId: string, status: string) => {
    // Add to recents if status is active
    if (status === "active") {
      addToRecents(threadId);
    }
    onNavigate("Dream");
  };

  const hasDreams = sortedDreams.length > 0;

  if (!hasDreams) {
    return (
      <>
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>
          <BottomNavbar onNavigate={onNavigate} activeTab="dreams" />
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
            {/* Empty State */}
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: "#F0F0F0",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}>
                <Text style={{ fontSize: 60, opacity: 0.6 }}>🌙</Text>
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: themeColors.text_primary,
                  fontFamily: "InstrumentSans-Bold",
                  marginBottom: 12,
                  textAlign: "center",
                }}>
                No Dreams Yet
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: themeColors.text_secondary,
                  fontFamily: "InstrumentSans-Regular",
                  textAlign: "center",
                  lineHeight: 20,
                  marginBottom: 40,
                }}>
                Create your first dream to get started on your journey
              </Text>

              {/* Add New Dream Button */}
              <TouchableOpacity
                onPress={() => setIsCreateDreamModalVisible(true)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: Color.colorOrangered,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: Color.colorOrangered,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}>
                <Plus size={28} color={Color.colorWhite} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
        <CreateDreamModal
          visible={isCreateDreamModalVisible}
          onClose={() => setIsCreateDreamModalVisible(false)}
          onDreamCreated={() => setIsCreateDreamModalVisible(false)}
        />
      </>
    );
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg_primary }}>
        <BottomNavbar onNavigate={onNavigate} activeTab="dreams" />

        {/* Dreams Grid */}
        <Animated.ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginHorizontal: 17,
              marginTop: 20,
            }}>
            <FlatList
              data={sortedDreams}
              renderItem={({ item }) => (
                <View style={{ width: columnWidth }}>
                  <GoalCard
                    data={item}
                    onPress={() => handleGoalCardPress(item.threadId || "", item.status || "")}
                  />
                </View>
              )}
              keyExtractor={(_, index) => index.toString()}
              numColumns={2}
              columnWrapperStyle={{ gap: 14, marginBottom: 14 }}
              scrollEnabled={false}
              nestedScrollEnabled={false}
            />
          </Animated.View>
        </Animated.ScrollView>

        {/* Floating Add Button */}
        <View
          style={{
            position: "absolute",
            bottom: 100,
            left: 0,
            right: 0,
            alignItems: "center",
          }}>
          <TouchableOpacity
            onPress={() => setIsCreateDreamModalVisible(true)}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Color.colorOrangered,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: Color.colorOrangered,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}>
            <Plus size={28} color={Color.colorWhite} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <CreateDreamModal
        visible={isCreateDreamModalVisible}
        onClose={() => setIsCreateDreamModalVisible(false)}
        onDreamCreated={() => setIsCreateDreamModalVisible(false)}
      />
    </>
  );
};

export default AllDreamsScreen;
