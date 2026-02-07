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

export type PermissionType = 1 | 2 | 3 | 4;

export interface PermissionSlip {
  id: string;
  victoryCardId: string;
  giverId: string;
  giverDisplayName: string; // "Sarah" or "Anonymous"
  receiverId: string;
  permissionType: PermissionType;
  permissionText: string;
  createdAt: string; // ISO date
}

export interface MeToo {
  id: string;
  victoryCardId: string;
  userId: string;
  createdAt: string; // ISO date
}

export interface VictoryCard {
  id: string;
  userId: string;
  userDisplayName: string; // "Sarah" or "Anonymous"
  userLocation?: string;
  userAge?: number;
  userTimezone?: string; // IANA timezone (e.g., "America/New_York")

  milestoneId: string;
  milestoneTitle: string;
  challengeType?: string; // Optional - milestone challenge type
  dreamId: string;
  dreamCategory: DreamCategory;

  evidenceSnippet?: string; // Optional - can be blank
  confidenceBoost: number; // XP points
  impactLevel: ImpactLevel;

  completedDate: string; // ISO date
  createdAt: string; // ISO date

  courageBoosts: number;
  hasUserBoosted?: boolean; // Client-side tracking

  permissionsCount: number; // Count of permission slips
  permissions?: PermissionSlip[]; // Optional - loaded on demand

  meTooCount: number; // Count of "Me Too" clicks
  hasUserMeTooed?: boolean; // Client-side tracking - has current user clicked Me Too

  isAnonymous: boolean;
}

export interface CourageBoost {
  id: string;
  victoryCardId: string;
  giverId: string;
  receiverId: string;
  createdAt: string;
}

// Union type for community feed items
export type CommunityFeedItem =
  | (VictoryCard & { type: 'victory_card' })
  | (JourneyRecap & { type: 'journey_recap' });

export interface VictoriesResponse {
  victories: VictoryCard[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
}

// New response type for mixed feed
export interface CommunityFeedResponse {
  feed: CommunityFeedItem[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface CreateVictoryRequest {
  milestoneId: string;
  evidenceSnippet?: string; // Optional - can be blank
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

export interface GivePermissionRequest {
  permissionType: PermissionType;
}

export interface GivePermissionResponse {
  success: boolean;
  permissionText: string;
  couragePointsAwarded: number;
}

export interface GetPermissionsResponse {
  permissions: PermissionSlip[];
  count: number;
}

export interface MeTooResponse {
  success: boolean;
  newMeTooCount: number;
  added: boolean; // true if added, false if removed (toggle)
}

export interface JourneyRecap {
  id: string;
  userId: string;
  userDisplayName: string; // "Sarah" or "Anonymous"
  userLocation?: string;
  userAge?: number;
  userTimezone?: string; // IANA timezone (e.g., "America/New_York")

  dreamId: string;
  dreamTitle: string;
  dreamCategory: DreamCategory;

  journeyStory: string; // User's reflection on completing the dream
  totalMilestones: number;
  durationDays: number; // Days from first milestone to completion
  keyMoment?: string; // Optional: Most memorable moment

  completedDate: string; // ISO date - when dream was completed
  createdAt: string; // ISO date - when posted to wall

  courageBoosts: number;
  hasUserBoosted?: boolean; // Client-side tracking

  permissionsCount: number;
  permissions?: PermissionSlip[];

  meTooCount: number;
  hasUserMeTooed?: boolean;

  isAnonymous: boolean;
}

export interface CreateJourneyRecapRequest {
  dreamId: string;
  journeyStory: string;
  keyMoment?: string;
  isAnonymous: boolean;
}

export interface CreateJourneyRecapResponse {
  success: boolean;
  journeyRecapId: string;
  couragePointsAwarded: number;
}
