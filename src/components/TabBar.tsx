import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Color } from "../constants/GlobalStyles";

export type TabType = "recents" | "inspiration";

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const handleTabPress = (tab: TabType) => {
    onTabChange(tab);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
      }}>
      {/* Recents Tab */}
      <TouchableOpacity
        onPress={() => handleTabPress("recents")}
        activeOpacity={0.7}>
        <View
          style={{
            backgroundColor:
              activeTab === "recents" ? Color.colorOrangered : Color.colorWhite,
            borderRadius: 35,
            height: activeTab === "recents" ? 36 : 30,
            paddingHorizontal: activeTab === "recents" ? 16 : 14,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: activeTab === "recents" ? 0 : 1,
            borderStyle: "solid",
            borderColor: Color.colorBlack,
          }}>
          <Text
            style={{
              color:
                activeTab === "recents" ? Color.colorWhite : Color.colorBlack,
              fontFamily: "InstrumentSans-Bold",
              fontWeight: "700",
              fontSize: activeTab === "recents" ? 16 : 15,
              textAlign: "center",
            }}>
            Recents
          </Text>
        </View>
      </TouchableOpacity>

      {/* Inspiration Tab */}
      <TouchableOpacity
        onPress={() => handleTabPress("inspiration")}
        activeOpacity={0.7}>
        <View
          style={{
            backgroundColor:
              activeTab === "inspiration"
                ? Color.colorOrangered
                : Color.colorWhite,
            borderRadius: 35,
            height: activeTab === "inspiration" ? 36 : 30,
            paddingHorizontal: activeTab === "inspiration" ? 16 : 14,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: activeTab === "inspiration" ? 0 : 1,
            borderStyle: "solid",
            borderColor: Color.colorBlack,
          }}>
          <Text
            style={{
              color:
                activeTab === "inspiration"
                  ? Color.colorWhite
                  : Color.colorBlack,
              fontFamily: "InstrumentSans-Bold",
              fontWeight: "700",
              fontSize: activeTab === "inspiration" ? 16 : 15,
              textAlign: "center",
            }}>
            Inspiration
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
