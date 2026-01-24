import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Color } from "../constants/GlobalStyles";
import { SafeAreaView } from "react-native-safe-area-context";

interface SubtaskCard {
  id: string;
  title: string;
  bgColor: string;
  tags: string[];
  duration: string;
  image: any;
}

const DreamPage = () => {
  const goalTitle = "I want to visit the bahamas";

  const subtasks: SubtaskCard[] = [
    {
      id: "1",
      title: "Find & book flights",
      bgColor: "#537787",
      tags: ["Planning", "Decision"],
      duration: "60 mins",
      image: require("../assets/images/placeholder-flights.png"),
    },
    {
      id: "2",
      title: "Book lodging",
      bgColor: "#E6BD6E",
      tags: ["Planning", "Decision"],
      duration: "60 mins",
      image: require("../assets/images/placeholder-lodging.png"),
    },
    {
      id: "3",
      title: "Share plans and get feedback",
      bgColor: "#206A77",
      tags: ["Planning", "Decision"],
      duration: "60 mins",
      image: require("../assets/images/placeholder-feedback.png"),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F5" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{ paddingHorizontal: 22, paddingTop: 30, paddingBottom: 40 }}>
          {/* Back Button */}
          <TouchableOpacity
            style={{
              width: 30,
              height: 30,
              marginBottom: 30,
              alignItems: "center",
              justifyContent: "center",
            }}>
            <Text
              style={{
                fontSize: 24,
                color: Color.colorBlack,
                fontWeight: "600",
              }}>
              ←
            </Text>
          </TouchableOpacity>

          {/* Goal Header */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "400",
              color: Color.colorBlack,
              marginBottom: 40,
            }}>
            Goal: <Text style={{ fontWeight: "400" }}>{goalTitle}</Text>
          </Text>

          {/* Subtasks Grid - 2 Items Per Row */}
          <View style={{ gap: 16 }}>
            {Array.from({ length: Math.ceil(subtasks.length / 2) }).map(
              (_, rowIndex) => {
                const rowItems = subtasks.slice(rowIndex * 2, rowIndex * 2 + 2);
                return (
                  <View
                    key={rowIndex}
                    style={{ flexDirection: "row", gap: 16 }}>
                    {rowItems.map((subtask) => (
                      <View
                        key={subtask.id}
                        style={{
                          flex: 1,
                          height: 280,
                          borderRadius: 10,
                          overflow: "hidden",
                          backgroundColor: subtask.bgColor,
                        }}>
                        {/* Image */}
                        <Image
                          source={subtask.image}
                          style={{
                            width: "100%",
                            height: 160,
                          }}
                        />

                        {/* Card Content with Gradient */}
                        <LinearGradient
                          style={{
                            flex: 1,
                            paddingHorizontal: 15,
                            paddingVertical: 15,
                            borderBottomLeftRadius: 10,
                            borderBottomRightRadius: 10,
                            justifyContent: "space-between",
                          }}
                          colors={[subtask.bgColor, subtask.bgColor]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}>
                          {/* Title */}
                          <Text
                            style={{
                              fontFamily: "InriaSans-Bold",
                              fontSize: 15,
                              color: Color.colorWhite,
                              fontWeight: "700",
                            }}>
                            {subtask.title}
                          </Text>

                          {/* Tags and Duration */}
                          <View style={{ gap: 8 }}>
                            <View
                              style={{
                                flexDirection: "row",
                                gap: 12,
                              }}>
                              {subtask.tags.map((tag, index) => (
                                <View
                                  key={index}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                  }}>
                                  <View
                                    style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: 1,
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.6)",
                                    }}
                                  />
                                  <Text
                                    style={{
                                      color: Color.colorWhite,
                                      fontSize: 12,
                                      fontWeight: "400",
                                      fontFamily: "InriaSans-Regular",
                                    }}>
                                    {tag}
                                  </Text>
                                </View>
                              ))}
                            </View>

                            {/* Duration */}
                            <Text
                              style={{
                                color: Color.colorWhite,
                                fontSize: 15,
                                fontFamily: "InriaSans-Regular",
                                fontWeight: "300",
                              }}>
                              {subtask.duration}
                            </Text>
                          </View>
                        </LinearGradient>
                      </View>
                    ))}

                    {/* Spacer for odd-numbered rows */}
                    {rowItems.length === 1 && <View style={{ flex: 1 }} />}
                  </View>
                );
              },
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DreamPage;
