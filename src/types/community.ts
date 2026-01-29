// Community Feature Types

export type DreamCategory =
  | 'career_professional'
  | 'personal_development'
  | 'health_wellness'
  | 'creative_expression'
  | 'relationships_community'
  | 'travel_exploration'
  | 'finance_security'
  | 'lifestyle_hobbies'
  | 'courage_challenges'
  | 'achievement_goals';

export type ImpactLevel = 'critical' | 'high' | 'medium' | 'low';

export interface VictoryCard {
  id: string;
  userId: string;
  userDisplayName: string; // "Sarah" or "Anonymous"
  userLocation?: string;
  userAge?: number;

  milestoneId: string;
  milestoneTitle: string;
  dreamId: string;
  dreamTitle: string;
  dreamCategory: DreamCategory;

  evidenceSnippet: string;
  confidenceBoost: number; // XP points
  impactLevel: ImpactLevel;

  completedDate: string; // ISO date
  createdAt: string; // ISO date

  courageBoosts: number;
  hasUserBoosted?: boolean; // Client-side tracking

  isAnonymous: boolean;
}

export interface CourageBoost {
  id: string;
  victoryCardId: string;
  giverId: string;
  receiverId: string;
  createdAt: string;
}

export interface VictoriesResponse {
  victories: VictoryCard[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface CreateVictoryRequest {
  milestoneId: string;
  evidenceSnippet: string;
  isAnonymous: boolean;
  impact?: ImpactLevel;
}

export interface CreateVictoryResponse {
  success: boolean;
  victoryId: string;
  couragePointsAwarded: number;
}

export interface CourageBoostRequest {
  userId: string;
}

export interface CourageBoostResponse {
  success: boolean;
  newBoostCount: number;
  couragePointsAwarded: number;
}

export interface CommunityStats {
  victoriesShared: number;
  boostsReceived: number;
  boostsGiven: number;
  couragePoints: number;
}

export interface CommunityFilters {
  categories: DreamCategory[];
  timeframe: 'all' | 'week' | 'month';
}
