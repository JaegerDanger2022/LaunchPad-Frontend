import React from "react";
import { View, Text } from "react-native";
import { BellIcon, AvatarIcon } from "./icons/SVGIcons";
import { Color } from "../constants/GlobalStyles";

interface TopNavbarProps {
  title: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ title }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 11,
        paddingTop: 25,
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
          {title}
        </Text>
      </View>
      <AvatarIcon size={47} color={Color.colorLightsteelblue} />
    </View>
  );
};
