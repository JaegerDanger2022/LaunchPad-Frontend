import React from "react";
import Svg, { Path, Circle } from "react-native-svg";
import { View } from "react-native";

interface IconProps {
  size?: number;
  color?: string;
}

export const BellIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#000",
}) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
        fill={color}
      />
    </Svg>
  </View>
);

export const HomeIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#000",
}) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={color} />
    </Svg>
  </View>
);

export const MenuIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#000",
}) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        fill={color}
      />
    </Svg>
  </View>
);

export const ClockIcon: React.FC<IconProps> = ({
  size = 20,
  color = "#000",
}) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 17V12H15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

export const LightningIcon: React.FC<IconProps> = ({
  size = 20,
  color = "#ffffff",
}) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={color} />
    </Svg>
  </View>
);

export const ArrowRightIcon: React.FC<IconProps> = ({
  size = 20,
  color = "#fff",
}) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 11.25C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H13.25V18C13.25 18.3034 13.4327 18.5768 13.713 18.6929C13.9932 18.809 14.3158 18.7449 14.5303 18.5304L20.5303 12.5304C20.671 12.3897 20.75 12.1989 20.75 12C20.75 11.8011 20.671 11.6103 20.5303 11.4697L14.5303 5.46969C14.3158 5.25519 13.9932 5.19103 13.713 5.30711C13.4327 5.4232 13.25 5.69668 13.25 6.00002V11.25H4Z"
        fill={color}
      />
    </Svg>
  </View>
);

interface ProgressRingIconProps extends IconProps {
  progress?: number; // 0–100
}

export const ProgressRingIcon: React.FC<ProgressRingIconProps> = ({
  size = 30,
  progress = 0,
}) => {
  const radius = 13;
  const circumference = 2 * Math.PI * radius; // ≈ 81.68
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const offset = circumference * (1 - clampedProgress / 100);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
        {/* Background circle fill */}
        <Circle cx="15" cy="15" r={radius} fill="#22C55E" fillOpacity="0.15" />
        {/* Background track stroke */}
        <Circle
          cx="15"
          cy="15"
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          fill="none"
        />
        {/* Progress arc — rotated so 0% starts at 12 o'clock */}
        <Circle
          cx="15"
          cy="15"
          r={radius}
          stroke="#22C55E"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 15 15)"
          fill="none"
        />
      </Svg>
    </View>
  );
};

export const AvatarIcon: React.FC<IconProps> = ({
  size = 47,
  color = "#b4c5fd",
}) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </Svg>
  </View>
);

export const HeroBgPlaceholder: React.FC<IconProps> = ({
  size = 353,
  color = "#fff8f5",
}) => (
  <View style={{ width: size, height: 184 }}>
    <Svg width={size} height={184} viewBox="0 0 353 184" fill="none">
      <Path d="M0 0h353v184H0z" fill={color} />
      <Circle cx="50" cy="50" r="8" fill="#eac375" opacity="0.3" />
      <Circle cx="300" cy="100" r="12" fill="#6dc0c3" opacity="0.2" />
      <Path
        d="M100 150 L150 130 L200 150"
        stroke="#fb6322"
        strokeWidth="2"
        opacity="0.2"
        fill="none"
      />
    </Svg>
  </View>
);

export const GoalBgPlaceholder: React.FC<IconProps> = ({
  size = 166,
  color = "#eac375",
}) => (
  <View style={{ width: size, height: 120 }}>
    <Svg width={size} height={120} viewBox="0 0 166 120" fill="none">
      <Path d="M0 0h166v120H0z" fill={color} opacity="0.3" />
      <Circle cx="83" cy="60" r="30" fill="#fff" opacity="0.2" />
    </Svg>
  </View>
);

export const DreamsIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#000",
}) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 11H4V5h16m0-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-10 7l-3-4-3 4h10l-4-5z"
        fill={color}
      />
    </Svg>
  </View>
);

export const EvidenceIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#000",
}) => (
  <View style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        fill={color}
      />
    </Svg>
  </View>
);
