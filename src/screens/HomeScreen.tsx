import * as React from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Color,
  FontFamily,
  FontSize,
  Border,
  Height,
  Width,
} from "../constants/GlobalStyles";
import {
  BellIcon,
  HomeIcon,
  ClockIcon,
  LightningIcon,
  ArrowRightIcon,
  ProgressRingIcon,
  AvatarIcon,
  GoalBgPlaceholder,
} from "../components/icons/SVGIcons";

const HomeScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Color.colorWhite }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}>
        <View style={{
          width: "100%",
          minHeight: 1000,
          overflow: "hidden",
          backgroundColor: Color.colorWhite,
        }}>
          <View style={{
            top: -9,
            left: -3,
            backgroundColor: Color.colorSnow,
            width: 442,
            height: 941,
            position: "absolute",
          }} />

          {/* Top Header Section */}
          <View style={{
            top: 25,
            left: 11,
            width: 396,
            height: 86,
            position: "absolute",
          }}>
            <BellIcon size={30} color={Color.colorBlack} />
            <View style={{
              width: 360,
              top: 0,
              left: 0,
              height: 86,
              position: "absolute",
            }}>
              <Text style={{
                top: 57,
                left: 56,
                fontSize: 24,
                fontFamily: FontFamily.interBold,
                fontWeight: "700",
                textAlign: "left",
                color: Color.colorBlack,
                position: "absolute",
              }}>Ready to win, Kyla-Marie?</Text>
              <AvatarIcon size={47} color={Color.colorLightsteelblue} />
            </View>
          </View>

          {/*  Hero Card Section */}
          <View style={{
            top: 116,
            left: 37,
            height: 317,
            width: 353,
            position: "absolute",
          }}>
            <Image
              source={require("../assets/images/hero-bg.png")}
              style={{
                width: 353,
                height: 184,
                position: "absolute",
                left: 0,
                top: 0,
                borderTopLeftRadius: Border.br_35,
                borderTopRightRadius: Border.br_35,
              }}
            />
            <LinearGradient
              style={{
                position: "absolute",
                left: 0,
                top: 166,
                width: 352,
                height: 151,
                borderBottomLeftRadius: Border.br_35,
                borderBottomRightRadius: Border.br_35,
              }}
              locations={[0, 1]}
              colors={["#f9f0e4", "#f9f0e4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />

            {/* Up Next Badge */}
            <View style={{
              top: 11,
              left: 20,
              height: 42,
              width: 159,
              position: "absolute",
            }}>
              <LinearGradient
                style={{
                  backgroundColor: "transparent",
                  borderRadius: Border.br_35,
                  left: 0,
                  top: 0,
                  height: 42,
                  width: 159,
                  position: "absolute",
                }}
                locations={[0, 1]}
                colors={[Color.colorOrangered, "#f79971"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <Text style={{
                marginTop: -12,
                marginLeft: -43,
                width: 88,
                color: Color.colorWhite,
                fontFamily: FontFamily.instrumentSansBold,
                fontWeight: "700",
                fontSize: FontSize.fs_20,
                textAlign: "left",
                position: "absolute",
                top: "50%",
                left: "50%",
              }}>
                Up next
              </Text>
            </View>

            {/* Task Title */}
            <Text style={{
              top: 181,
              left: 33,
              fontSize: FontSize.fs_20,
              textAlign: "left",
              position: "absolute",
              color: Color.colorBlack,
              fontFamily: FontFamily.instrumentSansBold,
              fontWeight: "700",
            }}>
              Seek feedback on pilot
            </Text>

            {/* ETA / Time Chip */}
            <View style={{
              left: 74,
              height: Height.height_32,
              width: 89,
              top: 209,
              position: "absolute",
            }}>
              <View style={{
                backgroundColor: Color.colorDarkgray,
                flexDirection: "row",
                alignItems: "center",
                borderRadius: Border.br_20,
                height: Height.height_32,
                width: 89,
                top: 0,
                left: 0,
                position: "absolute",
              }}>
                <View style={{
                  width: "30%",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <ClockIcon size={20} color="#000" />
                </View>
                <View style={{
                  width: "70%",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Text style={{
                    color: Color.colorWhite,
                    fontSize: FontSize.fs_15,
                    fontFamily: FontFamily.instrumentSansBold,
                    fontWeight: "700",
                  }}>20 min</Text>
                </View>
              </View>
            </View>

            {/* XP Chip */}
            <View style={{
              left: 183,
              height: Height.height_32,
              width: 89,
              top: 209,
              position: "absolute",
            }}>
              <LinearGradient
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 89,
                  height: 32,
                  borderRadius: Border.br_20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                locations={[0.11, 1]}
                colors={["#bdf1cd", "#bdf1cd"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              <View style={{
                width: "30%",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <LightningIcon size={20} color="#ff9000" />
              </View>
              <View style={{
                width: "70%",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Text style={{
                  marginTop: -8,
                  color: Color.colorDarkorange,
                  left: 8,
                  fontSize: FontSize.fs_15,
                  top: "50%",
                  fontFamily: FontFamily.instrumentSansBold,
                  fontWeight: "700",
                  textAlign: "left",
                  position: "absolute",
                }}>+65 XP</Text>
              </View>
            </View>

            {/* Action Button */}
            <View style={{
              left: 33,
              top: 253,
              width: 260,
              height: 50,
              position: "absolute",
              flexDirection: "row",
              alignItems: "center",
            }}>
              <LinearGradient
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: Border.br_10,
                }}
                locations={[0.38, 1]}
                colors={[Color.colorOrangered, "rgba(247, 153, 113, 0.86)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <View style={{
                width: "70%",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Text style={{
                  fontSize: FontSize.fs_16,
                  color: Color.colorWhite,
                  fontFamily: FontFamily.instrumentSansBold,
                  fontWeight: "700",
                  textAlign: "center",
                }}>LET'S GOOO!</Text>
              </View>
              <View style={{
                width: "30%",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <ArrowRightIcon size={20} color="#fff" />
              </View>
            </View>
          </View>

          {/* Recents and Favorites Section */}
          <View style={{
            top: 451,
            width: 346,
            height: 260,
            left: 17,
            position: "absolute",
          }}>
            {/* Recents Tab */}
            <View style={{
              left: 1,
              height: Height.height_22,
              width: 106,
              top: 0,
              position: "absolute",
            }}>
              <View style={{
                backgroundColor: Color.colorOrangered,
                borderRadius: Border.br_35,
                left: 0,
                height: Height.height_22,
                width: 106,
                top: 0,
                position: "absolute",
              }} />
              <Text style={{
                marginLeft: -17,
                width: 46,
                color: Color.colorWhite,
                fontFamily: FontFamily.instrumentSansBold,
                fontWeight: "700",
                height: Height.height_6,
                fontSize: FontSize.fs_11,
                marginTop: -6,
                top: "50%",
                left: "50%",
                textAlign: "left",
                position: "absolute",
              }}>
                Recents
              </Text>
            </View>

            {/* Favorites Tab */}
            <View style={{
              left: 114,
              height: Height.height_22,
              width: 106,
              top: 0,
              position: "absolute",
            }}>
              <View style={{
                height: Height.height_22,
                width: 106,
                top: 0,
                position: "absolute",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: Border.br_35,
                borderColor: Color.colorBlack,
                backgroundColor: Color.colorWhite,
              }} />
              <Text style={{
                marginLeft: -29,
                width: 63,
                fontFamily: FontFamily.instrumentSansRegular,
                color: Color.colorBlack,
                height: Height.height_6,
                fontSize: FontSize.fs_11,
                marginTop: -6,
                top: "50%",
                left: "50%",
                textAlign: "left",
                position: "absolute",
              }}>
                Inspiration
              </Text>
            </View>

            {/* Goal Card 1 */}
            <View style={{
              top: 32,
              height: 228,
              width: Width.width_166,
              left: 0,
              position: "absolute",
            }}>
              <GoalBgPlaceholder size={166} color={Color.colorBurlywood} />
              <LinearGradient
                style={{
                  height: 57,
                  borderBottomLeftRadius: Border.br_10,
                  borderBottomRightRadius: Border.br_10,
                  top: 171,
                  width: Width.width_166,
                  left: 0,
                  position: "absolute",
                  backgroundColor: Color.colorBurlywood,
                }}
                colors={[Color.colorBurlywood, Color.colorBurlywood]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              <View style={{
                marginTop: 74,
                width: 110,
                height: Height.height_30,
                marginLeft: -55,
                top: "50%",
                left: "50%",
                position: "absolute",
              }}>
                <Text style={{
                  marginTop: -9,
                  marginLeft: -55,
                  height: 18,
                  width: 95,
                  fontFamily: FontFamily.inriaSansRegular,
                  fontSize: FontSize.fs_16,
                  top: "50%",
                  color: Color.colorWhite,
                  left: "50%",
                  textAlign: "left",
                  position: "absolute",
                }}>
                  Progress
                </Text>
                <ProgressRingIcon size={30} color="#6B9BD1" />
              </View>
              <Text style={{
                height: 21,
                width: 144,
                marginTop: -111,
                fontFamily: FontFamily.inriaSansBold,
                fontSize: FontSize.fs_15,
                top: "50%",
                color: Color.colorWhite,
                fontWeight: "700",
                left: "50%",
                textAlign: "left",
                position: "absolute",
                marginLeft: -73,
              }}>
                I want to start a podcast about tech careers
              </Text>
            </View>

            {/* Goal Card 2 */}
            <View style={{
              left: 180,
              top: 32,
              height: 228,
              width: Width.width_166,
              position: "absolute",
            }}>
              <GoalBgPlaceholder size={166} color={Color.colorCadetblue} />
              <LinearGradient
                style={{
                  height: 57,
                  borderBottomLeftRadius: Border.br_10,
                  borderBottomRightRadius: Border.br_10,
                  top: 171,
                  width: Width.width_166,
                  left: 0,
                  position: "absolute",
                  backgroundColor: Color.colorCadetblue,
                }}
                colors={[Color.colorCadetblue, Color.colorCadetblue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              <View style={{
                marginTop: 69,
                marginLeft: -60,
                width: 119,
                top: "50%",
                left: "50%",
                height: 37,
                position: "absolute",
              }}>
                <Text style={{
                  marginTop: -8,
                  marginLeft: -60,
                  height: 18,
                  width: 95,
                  fontFamily: FontFamily.inriaSansRegular,
                  fontSize: FontSize.fs_16,
                  top: "50%",
                  color: Color.colorWhite,
                  left: "50%",
                  textAlign: "left",
                  position: "absolute",
                }}>
                  Progress
                </Text>
                <ProgressRingIcon size={30} color="#6dc0c3" />
              </View>
              <Text style={{
                height: 21,
                width: 144,
                marginTop: -111,
                fontFamily: FontFamily.inriaSansBold,
                fontSize: FontSize.fs_15,
                top: "50%",
                color: Color.colorWhite,
                fontWeight: "700",
                left: "50%",
                textAlign: "left",
                position: "absolute",
                marginLeft: -77,
              }}>
                I want to visit the bahamas
              </Text>
            </View>
          </View>

          {/* Community Wins Section */}
          <View style={{
            top: 721,
            width: 167,
            height: 122,
            left: 17,
            position: "absolute",
          }}>
            <View style={{
              top: 24,
              backgroundColor: Color.colorLavender,
              width: 162,
              height: 98,
              borderRadius: Border.br_10,
              left: 0,
              position: "absolute",
            }} />
            <Text style={{
              top: 74,
              left: 25,
              fontSize: 12,
              textAlign: "left",
              color: Color.colorBlack,
              position: "absolute",
            }}>
              Just booked my solo {"\n"}trip to Tokyo!
            </Text>
            <Text style={{
              top: 33,
              left: 54,
              color: Color.colorBlack,
              fontFamily: FontFamily.instrumentSansMedium,
              fontWeight: "500",
              fontSize: FontSize.fs_20,
              textAlign: "left",
              position: "absolute",
            }}>Jessica M.</Text>
            <AvatarIcon size={36} color={Color.colorLightsteelblue} />
            <Text style={{
              top: 0,
              fontSize: FontSize.fs_20,
              textAlign: "left",
              position: "absolute",
              color: Color.colorBlack,
              left: 0,
              fontFamily: FontFamily.instrumentSansBold,
              fontWeight: "700",
            }}>
              Community Wins
            </Text>
          </View>

          {/* Navbar */}
          <View style={{
            top: 853,
            left: -10,
            height: 79,
            width: 449,
            position: "absolute",
          }}>
            <View style={{
              justifyContent: "center",
              borderColor: Color.colorBlack,
              alignItems: "center",
              borderTopRightRadius: Border.br_40,
              borderTopLeftRadius: Border.br_40,
              height: 79,
              width: 449,
              left: 0,
              position: "absolute",
              backgroundColor: Color.colorWhite,
              borderWidth: 1,
              borderStyle: "solid",
              top: 0,
            }} />
            <View style={{
              top: 19,
              left: 168,
              position: "absolute",
              height: 43,
              width: 117,
            }}>
              <View style={{
                borderColor: Color.colorWhite,
                backgroundColor: Color.colorOrangered,
                height: 43,
                width: 117,
                alignItems: "center",
                borderTopRightRadius: Border.br_40,
                borderTopLeftRadius: Border.br_40,
                borderWidth: 1,
                borderStyle: "solid",
                top: 0,
                borderBottomRightRadius: Border.br_35,
                borderBottomLeftRadius: Border.br_35,
                left: 0,
                position: "absolute",
              }} />
              <HomeIcon size={31} color={Color.colorWhite} />
              <Text style={{
                top: 9,
                left: 49,
                color: Color.colorWhite,
                fontFamily: FontFamily.instrumentSansRegular,
                fontSize: FontSize.fs_20,
                textAlign: "left",
                position: "absolute",
              }}>Home</Text>
            </View>
            <HomeIcon size={50} color={Color.colorBlack} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
