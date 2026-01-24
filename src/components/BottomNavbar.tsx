import React from "react";
import { View, Text } from "react-native";
import { HomeIcon } from "./icons/SVGIcons";
import { Color } from "../constants/GlobalStyles";

export const BottomNavbar: React.FC = () => {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        backgroundColor: Color.colorWhite,
        borderWidth: 1,
        borderColor: Color.colorBlack,
        borderStyle: "solid",
        gap: 20,
        zIndex: 20,
      }}>
      {/* Active Home Tab */}
      <View
        style={{
          backgroundColor: Color.colorOrangered,
          height: 43,
          width: 117,
          alignItems: "center",
          justifyContent: "center",
          borderTopRightRadius: 40,
          borderTopLeftRadius: 40,
          borderBottomRightRadius: 35,
          borderBottomLeftRadius: 35,
          borderWidth: 1,
          borderColor: Color.colorWhite,
          borderStyle: "solid",
          flexDirection: "row",
          gap: 8,
        }}>
        <HomeIcon size={31} color={Color.colorWhite} />
        <Text
          style={{
            color: Color.colorWhite,
            fontFamily: "InstrumentSans-Regular",
            fontSize: 20,
            textAlign: "center",
          }}>
          Home
        </Text>
      </View>

      {/* Inactive Home Icon */}
      <HomeIcon size={50} color={Color.colorBlack} />
    </View>
  );
};
