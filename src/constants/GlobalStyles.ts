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
  bg_primary: "#040726",
  bg_secondary: "#0D0E2B",
  text_primary: "#ffffff",
  text_secondary: "#b0b0b0",
  text_tertiary: "#808080",
  border: "rgba(255, 255, 255, 0.1)",
};

/* Theme helper */
export const getThemeColors = (theme: 'light' | 'dark') => {
  return theme === 'light' ? LightTheme : DarkTheme;
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
