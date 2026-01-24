import * as React from "react";
import { StyleSheet, View, Text, ScrollView, Image } from "react-native";
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
    <SafeAreaView style={styles.homeScreen}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.view}>
          <View style={styles.child} />

          {/* Top Header Section */}
          <View style={[styles.top, styles.topLayout]}>
            <BellIcon size={30} color={Color.colorBlack} />
            <View style={[styles.profile, styles.topLayout]}>
              <Text style={styles.readyToWin}>Ready to win, Kyla-Marie?</Text>
              <AvatarIcon size={47} color={Color.colorLightsteelblue} />
            </View>
          </View>

          {/*  Hero Card Section */}
          <View style={[styles.microTask1, styles.microTask1Layout]}>
            <Image
              source={require("../assets/images/hero-bg.png")}
              style={styles.heroBgImage}
            />
            <LinearGradient
              style={[styles.card2, styles.card2Position]}
              locations={[0, 1]}
              colors={["#f9f0e4", "#f9f0e4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />

            {/* Up Next Badge */}
            <View style={[styles.upNext, styles.bg2Layout]}>
              <LinearGradient
                style={[styles.bg2, styles.bg2Layout]}
                locations={[0, 1]}
                colors={[Color.colorOrangered, "#f79971"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <Text style={[styles.upNext2, styles.upNext2Position]}>
                Up next
              </Text>
            </View>

            {/* Task Title */}
            <Text style={[styles.seekFeedbackOn, styles.upNext2Typo]}>
              Seek feedback on pilot
            </Text>

            {/* ETA / Time Chip */}
            <View style={[styles.eta, styles.xpLayout]}>
              <View style={[styles.etaChild, styles.childLayout]}>
                <View style={styles.etaIconContainer}>
                  <ClockIcon size={20} color="#000" />
                </View>
                <View style={styles.etaTextContainer}>
                  <Text style={styles.min}>20 min</Text>
                </View>
              </View>
            </View>

            {/* XP Chip */}
            <View style={[styles.xp, styles.xpLayout]}>
              <LinearGradient
                style={[styles.xpChild, styles.childLayout]}
                locations={[0.11, 1]}
                colors={["#bdf1cd", "#bdf1cd"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              <View style={styles.xpIconContainer}>
                <LightningIcon size={20} color="#ff9000" />
              </View>
              <View style={styles.xpTextContainer}>
                <Text style={[styles.xp2, styles.xp2Typo]}>+65 XP</Text>
              </View>
            </View>

            {/* Action Button */}
            <View style={[styles.letsGoo, styles.bg3Layout]}>
              <LinearGradient
                style={[styles.bg4, styles.bg3Layout]}
                locations={[0.38, 1]}
                colors={[Color.colorOrangered, "rgba(247, 153, 113, 0.86)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              <View style={styles.actionTextContainer}>
                <Text style={styles.letsGooo}>LET'S GOOO!</Text>
              </View>
              <View style={styles.actionArrowContainer}>
                <ArrowRightIcon size={20} color="#fff" />
              </View>
            </View>
          </View>

          {/* Recents and Favorites Section */}
          <View style={[styles.recentsAndFavs, styles.communityWinsPosition]}>
            {/* Recents Tab */}
            <View style={[styles.recents, styles.dreamCardLayout1]}>
              <View style={[styles.dreamCard12, styles.dreamCardLayout]} />
              <Text style={[styles.recents2, styles.recents2Position]}>
                Recents
              </Text>
            </View>

            {/* Favorites Tab */}
            <View style={[styles.favorites, styles.dreamCardLayout1]}>
              <View style={[styles.dreamCard1, styles.dreamCardLayout]} />
              <Text style={[styles.inspiration, styles.recents2Position]}>
                Inspiration
              </Text>
            </View>

            {/* Goal Card 1 */}
            <View style={[styles.dream1, styles.dream1Layout]}>
              <GoalBgPlaceholder size={166} color={Color.colorBurlywood} />
              <LinearGradient
                style={[styles.gradient, styles.gradientPosition]}
                colors={[Color.colorBurlywood]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              <View style={styles.progressParent}>
                <Text style={[styles.progress, styles.progressTypo]}>
                  Progress
                </Text>
                <ProgressRingIcon size={30} color="#6B9BD1" />
              </View>
              <Text style={[styles.iWantTo, styles.wantPosition]}>
                I want to start a podcast about tech careers
              </Text>
            </View>

            {/* Goal Card 2 */}
            <View style={[styles.iWantToVisitTheBahamas, styles.dream1Layout]}>
              <GoalBgPlaceholder size={166} color={Color.colorCadetblue} />
              <LinearGradient
                style={[styles.gradient2, styles.gradientPosition]}
                colors={[Color.colorCadetblue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              <View style={[styles.progressGroup, styles.image26IconLayout]}>
                <Text style={[styles.progress2, styles.progressTypo]}>
                  Progress
                </Text>
                <ProgressRingIcon size={30} color="#6dc0c3" />
              </View>
              <Text style={[styles.iWantTo2, styles.wantPosition]}>
                I want to visit the bahamas
              </Text>
            </View>
          </View>

          {/* Community Wins Section */}
          <View style={[styles.communityWins, styles.communityWinsPosition]}>
            <View style={styles.communityWinsChild} />
            <Text style={[styles.justBookedMy, styles.jessicaMTypo]}>
              Just booked my solo {"\n"}trip to Tokyo!
            </Text>
            <Text style={[styles.jessicaM, styles.home2Typo]}>Jessica M.</Text>
            <AvatarIcon size={36} color={Color.colorLightsteelblue} />
            <Text style={[styles.communityWins2, styles.upNext2Typo]}>
              Community Wins
            </Text>
          </View>

          {/* Navbar */}
          <View style={styles.navbar}>
            <View style={[styles.bg, styles.bgBorder]} />
            <View style={[styles.home, styles.homeLayout]}>
              <View style={[styles.homeBtn, styles.card2Position]} />
              <HomeIcon size={31} color={Color.colorWhite} />
              <Text style={[styles.home2, styles.home2Typo]}>Home</Text>
            </View>
            <HomeIcon size={50} color={Color.colorBlack} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  homeScreen: {
    flex: 1,
    backgroundColor: Color.colorWhite,
  },
  scrollView: {
    flex: 1,
  },
  heroBgImage: {
    width: 353,
    height: 184,
    position: "absolute",
    left: 0,
    top: 0,
    borderTopLeftRadius: Border.br_35,
    borderTopRightRadius: Border.br_35,
  },
  communityWinsPosition: {
    left: 17,
    position: "absolute",
  },
  jessicaMTypo: {
    fontFamily: FontFamily.instrumentSansMedium,
    fontWeight: "500",
    color: Color.colorBlack,
  },
  home2Typo: {
    fontSize: FontSize.fs_20,
    textAlign: "left",
    position: "absolute",
  },
  avatar1IconPosition: {
    borderRadius: 114,
    left: "50%",
    position: "absolute",
  },
  upNext2Typo: {
    fontFamily: FontFamily.instrumentSansBold,
    fontWeight: "700",
  },
  bgBorder: {
    alignItems: "center",
    borderTopRightRadius: Border.br_40,
    borderTopLeftRadius: Border.br_40,
    borderWidth: 1,
    borderStyle: "solid",
    top: 0,
  },
  homeLayout: {
    height: 43,
    width: 117,
  },
  card2Position: {
    borderBottomLeftRadius: Border.br_35,
    borderBottomRightRadius: Border.br_35,
    left: 0,
    position: "absolute",
  },
  dreamCardLayout1: {
    height: Height.height_22,
    width: 106,
    top: 0,
    position: "absolute",
  },
  dreamCardLayout: {
    borderRadius: Border.br_35,
    left: 0,
  },
  recents2Position: {
    height: Height.height_6,
    fontSize: FontSize.fs_11,
    marginTop: -6,
    top: "50%",
    left: "50%",
    textAlign: "left",
    position: "absolute",
  },
  dream1Layout: {
    height: 228,
    width: Width.width_166,
    position: "absolute",
  },
  gradientPosition: {
    height: 57,
    borderBottomLeftRadius: Border.br_10,
    borderBottomRightRadius: Border.br_10,
    top: 171,
    width: Width.width_166,
    left: 0,
    position: "absolute",
  },
  progressTypo: {
    height: 18,
    width: 95,
    fontFamily: FontFamily.inriaSansRegular,
    fontSize: FontSize.fs_16,
    top: "50%",
    color: Color.colorWhite,
    left: "50%",
    textAlign: "left",
    position: "absolute",
  },
  iconLayout1: {
    width: Width.width_30,
    height: Height.height_30,
    position: "absolute",
  },
  wantPosition: {
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
  },
  image26IconLayout: {
    height: 37,
    position: "absolute",
  },
  microTask1Layout: {
    height: 317,
    width: 353,
    position: "absolute",
  },
  bg2Layout: {
    height: 42,
    width: 159,
    position: "absolute",
  },
  upNext2Position: {
    top: "50%",
    left: "50%",
  },
  bg3Layout: {
    width: 260,
    height: 50,
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
  },
  letsGoooPosition: {
    marginTop: -10,
    top: "50%",
  },
  xpLayout: {
    height: Height.height_32,
    width: 89,
    top: 209,
    position: "absolute",
  },
  childLayout: {
    borderRadius: Border.br_20,
    height: Height.height_32,
    width: 89,
    top: 0,
    left: 0,
    position: "absolute",
  },
  xp2Typo: {
    fontSize: FontSize.fs_15,
    top: "50%",
    fontFamily: FontFamily.instrumentSansBold,
    fontWeight: "700",
    textAlign: "left",
    position: "absolute",
  },
  iconLayout: {
    height: Height.height_20,
    width: Width.width_20,
    position: "absolute",
  },
  topLayout: {
    height: 86,
    position: "absolute",
  },
  view: {
    width: "100%",
    minHeight: 1000,
    overflow: "hidden",
    backgroundColor: Color.colorWhite,
  },
  child: {
    top: -9,
    left: -3,
    backgroundColor: Color.colorSnow,
    width: 442,
    height: 941,
    position: "absolute",
  },
  communityWins: {
    top: 721,
    width: 167,
    height: 122,
  },
  communityWinsChild: {
    top: 24,
    backgroundColor: Color.colorLavender,
    width: 162,
    height: 98,
    borderRadius: Border.br_10,
    left: 0,
    position: "absolute",
  },
  justBookedMy: {
    top: 74,
    left: 25,
    fontSize: 12,
    textAlign: "left",
    color: Color.colorBlack,
    position: "absolute",
  },
  jessicaM: {
    top: 33,
    left: 54,
    color: Color.colorBlack,
    fontFamily: FontFamily.instrumentSansMedium,
    fontWeight: "500",
  },
  avatar1Icon: {
    marginLeft: -76,
    top: 27,
    width: 36,
    height: 36,
    backgroundColor: Color.colorLightsteelblue,
  },
  communityWins2: {
    top: 0,
    fontSize: FontSize.fs_20,
    textAlign: "left",
    position: "absolute",
    color: Color.colorBlack,
    left: 0,
  },
  navbar: {
    top: 853,
    left: -10,
    height: 79,
    width: 449,
    position: "absolute",
  },
  bg: {
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
  },
  home: {
    top: 19,
    left: 168,
    position: "absolute",
  },
  homeBtn: {
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
  },
  image4Icon: {
    top: 6,
    width: 31,
    height: 31,
    left: 8,
    position: "absolute",
    backgroundColor: Color.colorBlack,
  },
  home2: {
    top: 9,
    left: 49,
    color: Color.colorWhite,
    fontFamily: FontFamily.instrumentSansRegular,
  },
  roadmapIcon: {
    marginLeft: 116,
    top: 12,
    width: 50,
    height: 50,
    left: "50%",
    position: "absolute",
    backgroundColor: Color.colorBlack,
  },
  recentsAndFavs: {
    top: 451,
    width: 346,
    height: 260,
    left: 17,
    position: "absolute",
  },
  favorites: {
    left: 114,
  },
  dreamCard1: {
    height: Height.height_22,
    width: 106,
    top: 0,
    position: "absolute",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: Border.br_35,
    borderColor: Color.colorBlack,
    backgroundColor: Color.colorWhite,
  },
  inspiration: {
    marginLeft: -29,
    width: 63,
    fontFamily: FontFamily.instrumentSansRegular,
    color: Color.colorBlack,
  },
  recents: {
    left: 1,
  },
  dreamCard12: {
    height: Height.height_22,
    width: 106,
    top: 0,
    position: "absolute",
    backgroundColor: Color.colorOrangered,
  },
  recents2: {
    marginLeft: -17,
    width: 46,
    color: Color.colorWhite,
    fontFamily: FontFamily.instrumentSansBold,
    fontWeight: "700",
  },
  dream1: {
    top: 32,
    height: 228,
    width: Width.width_166,
    left: 0,
  },
  card2Icon: {
    top: 0,
    borderRadius: Border.br_10,
    left: 0,
    backgroundColor: Color.colorBurlywood,
  },
  gradient: {
    backgroundColor: Color.colorBurlywood,
  },
  progressParent: {
    marginTop: 74,
    width: 110,
    height: Height.height_30,
    marginLeft: -55,
    top: "50%",
    left: "50%",
    position: "absolute",
  },
  progress: {
    marginTop: -9,
    marginLeft: -55,
    height: 18,
    width: 95,
  },
  progressRing401Icon: {
    left: 80,
    top: 0,
    backgroundColor: Color.colorBlack,
  },
  iWantTo: {
    marginLeft: -73,
  },
  iWantToVisitTheBahamas: {
    left: 180,
    top: 32,
    height: 228,
    width: Width.width_166,
  },
  gradient2: {
    backgroundColor: Color.colorCadetblue,
  },
  progressGroup: {
    marginTop: 69,
    marginLeft: -60,
    width: 119,
    top: "50%",
    left: "50%",
  },
  progress2: {
    marginTop: -8,
    marginLeft: -60,
  },
  image26Icon: {
    left: 82,
    width: 37,
    top: 0,
    backgroundColor: Color.colorBlack,
  },
  iWantTo2: {
    marginLeft: -77,
  },
  microTask1: {
    top: 116,
    left: 37,
  },
  maskGroupIcon: {
    top: 0,
    left: 0,
    backgroundColor: Color.colorSnow,
  },
  card2: {
    top: 166,
    width: 352,
    height: 151,
    backgroundColor: "transparent",
  },
  upNext: {
    top: 11,
    left: 20,
  },
  bg2: {
    backgroundColor: "transparent",
    borderRadius: Border.br_35,
    left: 0,
    top: 0,
  },
  upNext2: {
    marginTop: -12,
    marginLeft: -43,
    width: 88,
    color: Color.colorWhite,
    fontFamily: FontFamily.instrumentSansBold,
    fontWeight: "700",
    fontSize: FontSize.fs_20,
    textAlign: "left",
    position: "absolute",
  },
  letsGoo: {
    left: 33,
    top: 253,
    width: 260,
  },
  bg4: {
    backgroundColor: "transparent",
    top: 0,
    borderRadius: Border.br_10,
    left: 0,
  },
  letsGooo: {
    fontSize: FontSize.fs_16,
    color: Color.colorWhite,
    fontFamily: FontFamily.instrumentSansBold,
    fontWeight: "700",
    textAlign: "center",
  },
  rightArrow1Icon: {
    top: 10,
    left: 213,
    backgroundColor: Color.colorBlack,
  },
  xp: {
    left: 183,
  },
  xpChild: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
  },
  xp2: {
    marginTop: -8,
    color: Color.colorDarkorange,
    left: 8,
  },
  image19Icon: {
    top: 7,
    right: 4,
    backgroundColor: Color.colorBlack,
  },
  eta: {
    left: 74,
  },
  etaChild: {
    backgroundColor: Color.colorDarkgray,
    flexDirection: "row",
    alignItems: "center",
  },
  etaIconContainer: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  etaTextContainer: {
    width: "70%",
    alignItems: "center",
    justifyContent: "center",
  },
  xpIconContainer: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  xpTextContainer: {
    width: "70%",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextContainer: {
    width: "70%",
    alignItems: "center",
    justifyContent: "center",
  },
  actionArrowContainer: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  min: {
    color: Color.colorWhite,
    fontSize: FontSize.fs_15,
    fontFamily: FontFamily.instrumentSansBold,
    fontWeight: "700",
  },
  image18Icon: {
    backgroundColor: Color.colorBlack,
  },
  seekFeedbackOn: {
    top: 181,
    left: 33,
    fontSize: FontSize.fs_20,
    textAlign: "left",
    position: "absolute",
    color: Color.colorBlack,
  },
  top: {
    top: 25,
    left: 11,
    width: 396,
  },
  image21Icon: {
    top: 8,
    left: 366,
    backgroundColor: Color.colorBlack,
  },
  profile: {
    width: 360,
    top: 0,
    left: 0,
  },
  readyToWin: {
    top: 57,
    left: 56,
    fontSize: 24,
    fontFamily: FontFamily.interBold,
    fontWeight: "700",
    textAlign: "left",
    color: Color.colorBlack,
    position: "absolute",
  },
  avatar1Icon2: {
    marginLeft: -180,
    width: 47,
    height: 47,
    top: 0,
    backgroundColor: Color.colorLightsteelblue,
  },
});

export default HomeScreen;
