import { EvidenceBoardColors } from "../../constants/GlobalStyles";

export type DreamCategory = "travel" | "career" | "financial" | "other";
export type DreamStatus = "in-progress" | "completed";
export type ImpactLevel = "critical" | "high" | "medium" | "low";

export interface ProofPoint {
  id: number;
  date: string;
  mission: string;
  completed: boolean;
  impact: ImpactLevel;
}

export interface Dream {
  id: number;
  title: string;
  category: DreamCategory;
  status: DreamStatus;
  progress: number;
  startDate: string;
  targetDate?: string;
  completedDate?: string;
  couragePoints: number;
  proofPoints: ProofPoint[];
  dream_card_bg?: string;
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const getCategoryGradient = (
  category: DreamCategory
): [string, string, ...string[]] => {
  switch (category) {
    case "travel":
      return [EvidenceBoardColors.gradient.travelStart, EvidenceBoardColors.gradient.travelEnd];
    case "career":
      return [EvidenceBoardColors.gradient.careerStart, EvidenceBoardColors.gradient.careerEnd];
    case "financial":
      return [EvidenceBoardColors.gradient.financialStart, EvidenceBoardColors.gradient.financialEnd];
    default:
      return [EvidenceBoardColors.gradient.defaultStart, EvidenceBoardColors.gradient.defaultEnd];
  }
};

export const getImpactColor = (impact: ImpactLevel) => {
  switch (impact) {
    case "critical":
      return EvidenceBoardColors.amber400;
    case "high":
      return EvidenceBoardColors.rose400;
    case "medium":
      return EvidenceBoardColors.purple400;
    default:
      return EvidenceBoardColors.teal400;
  }
};
