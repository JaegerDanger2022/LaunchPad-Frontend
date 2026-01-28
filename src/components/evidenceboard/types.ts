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
      return ["#14B8A6", "#06B6D4"]; // teal to cyan
    case "career":
      return ["#F43F5E", "#EC4899"]; // rose to pink
    case "financial":
      return ["#F59E0B", "#F97316"]; // amber to orange
    default:
      return ["#A855F7", "#6366F1"]; // purple to indigo
  }
};

export const getImpactColor = (impact: ImpactLevel) => {
  switch (impact) {
    case "critical":
      return "#FBBF24"; // amber-400
    case "high":
      return "#FB7185"; // rose-400
    case "medium":
      return "#A855F7"; // purple-400
    default:
      return "#14B8A6"; // teal-400
  }
};
