import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { BellIcon, AvatarIcon } from "./icons/SVGIcons";
import { LogOut } from "lucide-react-native";
import { Color } from "../constants/GlobalStyles";
import { useAuthStore } from "../store/authStore";

interface TopNavbarProps {
  name?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ name }) => {
  const [showLogout, setShowLogout] = useState(false);
  const { logout, userData } = useAuthStore();

  // Use userData.firstname if available, otherwise fall back to name prop
  const displayName = userData?.firstname || name || "User";

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Log Out",
        onPress: async () => {
          setShowLogout(false);
          await logout();
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 11,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: Color.colorSnow,
      }}>
      <BellIcon size={30} color={Color.colorBlack} />
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          marginLeft: 15,
        }}>
        <Text
          style={{
            fontSize: 24,
            fontFamily: "Inter-Bold",
            fontWeight: "700",
            textAlign: "left",
            color: Color.colorBlack,
            flex: 1,
          }}>
          {displayName}
        </Text>
      </View>

      {/* Avatar with Logout Menu */}
      <View style={{ position: "relative" }}>
        <TouchableOpacity onPress={() => setShowLogout(!showLogout)}>
          <AvatarIcon size={47} color={Color.colorLightsteelblue} />
        </TouchableOpacity>

        {showLogout && (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              position: "absolute",
              right: 0,
              top: 50,
              backgroundColor: Color.colorWhite,
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              minWidth: 120,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 4,
              zIndex: 100,
            }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <LogOut size={18} color="#e74c3c" />
              <Text
                style={{
                  color: "#e74c3c",
                  fontSize: 14,
                  fontFamily: "InstrumentSans-Bold",
                  fontWeight: "600",
                }}>
                Log Out
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
