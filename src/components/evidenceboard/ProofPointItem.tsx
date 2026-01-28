import React from "react";
import { View } from "react-native";
import Svg, {
  Line,
  Circle,
  Rect,
  Defs,
  Filter,
  FeDropShadow,
  TSpan,
  Text as SvgText,
} from "react-native-svg";

export interface ProofPoint {
  id: number;
  date: string;
  mission: string;
  completed: boolean;
  impact: "critical" | "high" | "medium" | "low";
}

interface ProofPointItemProps {
  point: ProofPoint;
  index: number;
}

const getImpactColor = (impact: ProofPoint["impact"]) => {
  switch (impact) {
    case "critical":
      return "#FBBF24";
    case "high":
      return "#FF5C00";
    case "medium":
      return "#A855F7";
    default:
      return "#14B8A6";
  }
};

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const truncateWithEllipsis = (text: string, maxWidth: number, fontSize: number) => {
  // Estimate character width based on font size
  const charWidth = fontSize * 0.55;
  const maxChars = Math.floor(maxWidth / charWidth);
  const ellipsis = "...";
  const availableForText = maxChars - ellipsis.length;

  if (text.length > availableForText) {
    return text.substring(0, availableForText) + ellipsis;
  }
  return text;
};

export const ProofPointItem: React.FC<ProofPointItemProps> = ({
  point,
  index,
}) => {
  const lineColor = getImpactColor(point.impact);
  const confidenceText =
    point.impact === "critical"
      ? "20% Confidence"
      : point.impact === "high"
        ? "15% Confidence"
        : "10% Confidence";

  return (
    <View style={{ marginBottom: -60 }}>
      <Svg
        width="100%"
        height="120"
        viewBox="0 0 400 120"
        style={{ overflow: "visible" }}>
        {/* Dashed vertical line - extends full height */}
        <Line
          x1="50"
          y1="0"
          x2="50"
          y2="120"
          stroke={lineColor}
          strokeWidth="4"
          strokeDasharray="4,6"
        />

        {/* Timeline circle */}
        <Circle
          cx="50"
          cy="60"
          r="18"
          fill="white"
          stroke={point.completed ? "#22C55E" : lineColor}
          strokeWidth="4"
        />

        {/* Inner circle (filled when completed) */}
        {point.completed && <Circle cx="50" cy="60" r="8" fill="#22C55E" />}

        {/* Content card */}
        <Rect
          x="85"
          y="25"
          width="290"
          height="70"
          rx="12"
          fill="white"
          filter="url(#shadow)"
        />

        {/* Defs for shadow */}
        <Defs>
          <Filter
            id="shadow"
            x="80"
            y="20"
            width="300"
            height="85"
            filterUnits="userSpaceOnUse">
            <FeDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1" />
          </Filter>
        </Defs>

        {/* Title text */}
        <SvgText
          x="100"
          y="50"
          fill="#1A1A1A"
          fontSize="14"
          fontWeight="700"
          fontFamily="sans-serif">
          <TSpan>
            {truncateWithEllipsis(point.mission.toUpperCase(), 260, 14)}
          </TSpan>
        </SvgText>

        {/* Subtitle text */}
        <SvgText
          x="100"
          y="70"
          fill="#666666"
          fontSize="12"
          fontFamily="sans-serif">
          <TSpan>
            {point.completed ? "Completed " : ""}
            {formatDateShort(point.date)}
            {point.completed ? ` • +${confidenceText}` : ""}
          </TSpan>
        </SvgText>

        {/* VIEW EVIDENCE link */}
        {point.completed && (
          <SvgText
            x="100"
            y="85"
            fill="#2D5BFF"
            fontSize="11"
            fontWeight="600"
            fontFamily="sans-serif">
            <TSpan>VIEW EVIDENCE →</TSpan>
          </SvgText>
        )}
      </Svg>
    </View>
  );
};
