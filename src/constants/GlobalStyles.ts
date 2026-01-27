/* Fonts */
export const FontFamily = {
  inriaSansBold: "InriaSans-Bold",
  inriaSansRegular: "InriaSans-Regular",
  instrumentSansBold: "InstrumentSans-Bold",
  instrumentSansMedium: "InstrumentSans-Medium",
  instrumentSansRegular: "InstrumentSans-Regular",
  interBold: "Inter-Bold",
};

/* Font sizes */
export const FontSize = {
  fs_11: 11,
  fs_15: 15,
  fs_16: 16,
  fs_20: 20,
};

/* Colors */
export const Color = {
  colorBlack: "#000",
  colorBurlywood: "#eac375",
  colorCadetblue: "#6dc0c3",
  colorDarkgray: "#a29f9b",
  colorDarkorange: "#ff9000",
  colorLavender: "#e0e6f3",
  colorLightsteelblue: "#b4c5fd",
  colorOrangered: "#fb6322",
  colorSnow: "#fff8f5",
  colorWhite: "#fff",
};

/* Challenge Type Colors */
export const ChallengeTypeColors = {
  power_move: "#FF6B6B",
  knowledge_quest: "#4ECDC4",
  prep_ritual: "#FFD93D",
  courage_check: "#FF6B9D",
  skill_flex: "#6BCB77",
  decision_point: "#A78BFA",
  celebration_moment: "#FFA502",
};

/* Challenge Type Names */
export const ChallengeTypeName = {
  power_move: "Power Move",
  knowledge_quest: "Knowledge Quest",
  prep_ritual: "Prep Ritual",
  courage_check: "Courage Check",
  skill_flex: "Skill Flex",
  decision_point: "Decision Point",
  celebration_moment: "Celebration Moment",
};

/* Light Theme */
export const LightTheme = {
  bg_primary: "#fff8f5",
  bg_secondary: "#ffffff",
  text_primary: "#000000",
  text_secondary: "#a29f9b",
  text_tertiary: "#666666",
  border: "rgba(0, 0, 0, 0.1)",
};

/* Dark Theme */
export const DarkTheme = {
  bg_primary: "#050938",
  bg_secondary: "#2B2D56",
  bg_tetiary: "#1b1f52",
  text_primary: "#ffffff",
  text_secondary: "#b0b0b0",
  text_tertiary: "#808080",
  border: "rgba(255, 255, 255, 0.1)",
};

/* Theme helper */
export const getThemeColors = (theme: "light" | "dark") => {
  return theme === "light" ? LightTheme : DarkTheme;
};

/* Border radiuses */
export const Border = {
  br_10: 10,
  br_20: 20,
  br_35: 35,
  br_40: 40,
};

/* Width */
export const Width = {
  width_166: 166,
  width_20: 20,
  width_30: 30,
};

/* Height */
export const Height = {
  height_20: 20,
  height_22: 22,
  height_30: 30,
  height_32: 32,
  height_35: 35,
  height_6: 6,
};
