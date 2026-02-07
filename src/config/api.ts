// API Configuration
// Update this with your backend API URL
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

import { StreakData } from "../types/index";
import { SHOWCASE_UID, getShowcaseUserData, getShowcaseDreamsList, getShowcaseDreamDetail } from "./showcaseSeed";
import {
  VictoryCard,
  VictoriesResponse,
  CreateVictoryRequest,
  CreateVictoryResponse,
  CourageBoostResponse,
  CommunityStats,
  DreamCategory,
} from "../types/community";

export interface UpNextMilestone {
  milestone_id: string;
  milestone_title: string;
  dream_thread_id: string;
  dream_title: string;
  time_estimate: string;
  xp_points: number;
  challenge_type: string;
  streak_eligible: boolean;
  updated_at: string;
}

export interface UserRegistrationData {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  pref_timezone?: string;
}

export interface UserData {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  _id?: string;
  created_at?: string;
  up_next?: UpNextMilestone | null;
  streak?: StreakData;
  [key: string]: any; // Allow additional dynamic fields
}

export async function registerUserToDatabase(
  data: UserRegistrationData,
): Promise<void> {
  try {
    console.log(
      `Attempting to register user to database at ${API_BASE_URL}/users/register`,
    );
    console.log("Payload:", data);

    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        if (errorData.detail && Array.isArray(errorData.detail)) {
          console.error("Validation errors:");
          errorData.detail.forEach((err: any) => {
            console.error(
              `  - Field: ${err.loc?.[1] || "unknown"}, Message: ${err.msg}`,
            );
          });
        }
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        console.error("Could not parse error response as JSON");
      }
      // 409 means the email is already registered — must surface this to the user
      if (response.status === 409) {
        throw new Error(errorMessage);
      }
      // Other failures (network, 500) are logged but don't block auth
      console.error("Registration failed (non-fatal):", errorMessage);
      return;
    }

    const result = await response.json();
    console.log("User registered successfully:", result);
  } catch (error: any) {
    console.error("Error registering user to database:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}

export interface FetchUserDataOptions {
  /**
   * Specify which fields to include in the response
   * 'minimal' - Only basic user info (user_id, email, name)
   * 'essential' - Basic info + up_next, streak, recents (default for app load)
   * 'full' - All data including full dreams array with roadmaps
   */
  fields?: "minimal" | "essential" | "full";
}

export async function fetchUserData(
  userId: string,
  options: FetchUserDataOptions = { fields: "essential" },
): Promise<UserData | null> {
  try {
    // Showcase demo account — return seeded data without hitting the network
    if (userId === SHOWCASE_UID) {
      console.log("[fetchUserData] Returning showcase seed data");
      return getShowcaseUserData() as UserData;
    }

    // Build URL with query parameters
    const url = new URL(`${API_BASE_URL}/users/${userId}`);
    if (options.fields && options.fields !== "full") {
      url.searchParams.append("fields", options.fields);
    }

    console.log(
      `Attempting to fetch user data for userId: ${userId} (fields: ${options.fields || "essential"})`,
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`User not found: ${userId}`);
        return null;
      }

      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        errorMessage = errorData.detail || errorMessage;
      } catch (parseError) {
        console.error("Could not parse error response as JSON");
      }

      throw new Error(errorMessage);
    }

    const userData = await response.json();
    console.log(
      `User data fetched successfully (${options.fields || "essential"} fields)`,
    );
    return userData as UserData;
  } catch (error: any) {
    console.error("Error fetching user data:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    // Return null instead of throwing - user can still use the app
    return null;
  }
}

export async function createDream(
  userId: string,
  userRequest: string,
): Promise<string | null> {
  try {
    console.log(`Attempting to create dream for userId: ${userId}`);
    console.log("User request:", userRequest);

    const dreamPayload = {
      user_id: userId,
      user_request: userRequest,
      user_profile: {
        traits: {
          work_style: "deep_work",
          completion_style: "self_driven",
        },
        preferences: {
          preferred_time: "morning",
        },
      },
    };

    console.log("Dream payload:", dreamPayload);

    const response = await fetch(`${API_BASE_URL}/dreams/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dreamPayload),
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        if (errorData.detail && Array.isArray(errorData.detail)) {
          console.error("Validation errors:");
          errorData.detail.forEach((err: any) => {
            console.error(
              `  - Field: ${err.loc?.[1] || "unknown"}, Message: ${err.msg}`,
            );
          });
        }
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error("Could not parse error response as JSON");
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Dream created successfully:", result);
    // Extract thread_id from the wrapped response
    const threadId = result?.thread_id || null;
    console.log("Thread ID:", threadId);
    return threadId;
  } catch (error: any) {
    console.error("Error creating dream:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}

/**
 * Create a custom dream with user-defined title and milestones.
 * The backend will create a dream document and add custom milestones to it.
 */
export interface CustomMilestoneInput {
  title: string;
  description?: string;
  challengeType: 'action' | 'research' | 'reflection';
}

export async function createCustomDream(
  userId: string,
  dreamTitle: string,
  milestones: CustomMilestoneInput[]
): Promise<string> {
  try {
    console.log('[API] Creating custom dream for userId:', userId);
    console.log('[API] Dream title:', dreamTitle);
    console.log('[API] Milestones:', milestones);

    const payload = {
      user_id: userId,
      dream_title: dreamTitle,
      milestones: milestones.map((m, index) => ({
        title: m.title,
        description: m.description || '',
        challenge_type: m.challengeType,
        order: index + 1,
      })),
    };

    const response = await fetch(`${API_BASE_URL}/dreams/create-custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log(`[API] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('[API] Error response data:', errorData);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        console.error('[API] Could not parse error response as JSON');
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('[API] Custom dream created successfully:', result);
    const threadId = result?.thread_id || null;
    console.log('[API] Thread ID:', threadId);

    if (!threadId) {
      throw new Error('No thread_id returned from server');
    }

    return threadId;
  } catch (error: any) {
    console.error('[API] Error creating custom dream:', error);
    throw error;
  }
}

// ============================================================================
// CONVERSATION ENDPOINTS (dream chat before roadmap creation)
// ============================================================================

export interface StartConversationResponse {
  session_id: string;
  ai_message: string;
  conversation_complete: boolean;
}

export interface ConversationTurnDonePayload {
  session_id: string;
  conversation_complete: boolean;
  enriched_context: Record<string, any> | null;
}

export async function startConversation(
  userId: string,
  prefTimezone?: string,
): Promise<StartConversationResponse> {
  const payload: { user_id: string; pref_timezone?: string } = { user_id: userId };
  if (prefTimezone) {
    payload.pref_timezone = prefTimezone;
  }

  const response = await fetch(`${API_BASE_URL}/conversation/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Send a message and stream the AI reply back via SSE.
 * @param onChunk  Called with each text chunk as it arrives — use this to update the UI live.
 * @returns        Resolves with the metadata from the final "done" event once the stream closes.
 */
export async function sendConversationTurn(
  sessionId: string,
  userId: string,
  message: string,
  onChunk: (text: string) => void,
): Promise<ConversationTurnDonePayload> {
  // React Native's fetch doesn't support response.body streaming, and XHR
  // onprogress is unreliable across platforms.  Fetch the full SSE payload,
  // then replay all chunk events into onChunk so the UI still updates.
  const response = await fetch(`${API_BASE_URL}/conversation/turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, user_id: userId, message }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }

  const text = await response.text();
  let donePayload: ConversationTurnDonePayload | null = null;

  // Parse all SSE events from the complete response body
  const parts = text.split("\n\n");
  for (const part of parts) {
    if (!part.trim()) continue;

    let eventType = "message";
    let dataLine = "";

    for (const line of part.split("\n")) {
      if (line.startsWith("event:")) {
        eventType = line.slice("event:".length).trim();
      } else if (line.startsWith("data:")) {
        dataLine = line.slice("data:".length).trim();
      }
    }

    if (!dataLine) continue;

    if (eventType === "chunk") {
      const parsed = JSON.parse(dataLine);
      onChunk(parsed.text);
    } else if (eventType === "done") {
      donePayload = JSON.parse(dataLine);
    }
  }

  if (!donePayload) {
    throw new Error("Stream ended without a done event");
  }

  return donePayload;
}

export interface UpdateRecentsRequest {
  thread_id: string;
}

export interface UpdateRecentsResponse {
  success: boolean;
  message: string;
  recents: string[];
}

export interface UpdateMilestoneRequest {
  status: string;
}

export interface UpdateMilestoneResponse {
  success: boolean;
  message: string;
  milestone: any;
  isComplete?: boolean;
  dreamCompleted?: boolean; // NEW: true if this milestone completion finished the dream
  dreamStats?: {
    // NEW: optional, useful for Journey Recap
    totalMilestones: number;
    completedMilestones: number;
    completionPercentage: number;
    dreamStartDate: string;
    dreamCompletedDate?: string; // Only present if dreamCompleted = true
  };
}

export async function updateRecents(
  userId: string,
  threadId: string,
): Promise<UpdateRecentsResponse> {
  try {
    console.log(
      `Attempting to update recents for userId: ${userId}, threadId: ${threadId}`,
    );

    const payload: UpdateRecentsRequest = {
      thread_id: threadId,
    };

    const url = `${API_BASE_URL}/users/${userId}/recents`;
    // console.log("Full URL being called:", url);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        console.error("Could not parse error response as JSON");
      }
      console.error("Error updating recents:", errorMessage);
      // Don't throw - allow app to continue even if recents update fails
      return { success: false, message: errorMessage, recents: [] };
    }

    const result = await response.json();
    console.log("Recents updated successfully:", result);
    return result as UpdateRecentsResponse;
  } catch (error: any) {
    console.error("Error updating recents:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    // Don't throw - allow app to continue even if recents update fails
    return { success: false, message: error.message, recents: [] };
  }
}

export async function updateMilestoneStatus(
  userId: string,
  threadId: string,
  milestoneId: string,
  status: string,
): Promise<UpdateMilestoneResponse> {
  try {
    console.log(
      `Attempting to update milestone status for userId: ${userId}, threadId: ${threadId}, milestoneId: ${milestoneId}, status: ${status}`,
    );

    const payload: UpdateMilestoneRequest = {
      status,
    };

    const url = `${API_BASE_URL}/milestone/update-status/${userId}/${threadId}/${milestoneId}`;
    // console.log("Full URL being called:", url);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error("Could not parse error response as JSON");
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Milestone status updated successfully:", result);
    return result as UpdateMilestoneResponse;
  } catch (error: any) {
    console.error("Error updating milestone status:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}

export interface UpdateUpNextRequest {
  up_next: UpNextMilestone | null;
}

export interface UpdateUpNextResponse {
  success: boolean;
  message: string;
  up_next: UpNextMilestone | null;
}

export async function updateUpNext(
  userId: string,
  upNext: UpNextMilestone | null,
): Promise<UpdateUpNextResponse> {
  try {
    console.log(`Attempting to update up_next for userId: ${userId}`);

    const payload: UpdateUpNextRequest = {
      up_next: upNext,
    };

    const url = `${API_BASE_URL}/users/${userId}/up_next`;
    // console.log("Full URL being called:", url);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        console.error("Could not parse error response as JSON");
      }
      console.error("Error updating up_next:", errorMessage);
      // Don't throw - allow app to continue even if up_next update fails
      return { success: false, message: errorMessage, up_next: null };
    }

    const result = await response.json();
    console.log("Up next updated successfully:", result);
    return result as UpdateUpNextResponse;
  } catch (error: any) {
    console.error("Error updating up_next:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    // Don't throw - allow app to continue
    return { success: false, message: error.message, up_next: null };
  }
}

export interface UpdateStreakRequest {
  milestone_id: string;
  completion_date: string;
  is_streak_eligible: boolean;
}

export interface UpdateStreakResponse {
  success: boolean;
  message: string;
  streak_data: StreakData | null;
  streak_increased: boolean;
  streak_broken: boolean;
  milestone_achieved?: "3_day" | "7_day" | "30_day" | null;
}

export async function updateStreak(
  userId: string,
  data: UpdateStreakRequest,
): Promise<UpdateStreakResponse> {
  try {
    const url = `${API_BASE_URL}/users/${userId}/streak/update`;
    console.log("[updateStreak] Calling streak endpoint:", url);
    console.log("[updateStreak] Request data:", data);

    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("[updateStreak] Response status:", response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      console.error("[updateStreak] Error response:", errorMessage);
      // Don't throw - allow app to continue even if streak update fails
      return {
        success: false,
        message: errorMessage,
        streak_data: null,
        streak_increased: false,
        streak_broken: false,
      };
    }

    const result = await response.json();
    console.log("[updateStreak] Success response:", result);
    return result as UpdateStreakResponse;
  } catch (error: any) {
    console.error("[updateStreak] Exception:", error.message);
    // Don't throw - allow app to continue
    return {
      success: false,
      message: error.message,
      streak_data: null,
      streak_increased: false,
      streak_broken: false,
    };
  }
}

export interface GetStreakResponse {
  success: boolean;
  message: string;
  streak_data: StreakData | null;
  streak_broken: boolean;
  recalculated: boolean;
}

export async function getStreak(userId: string): Promise<GetStreakResponse> {
  try {
    // Showcase demo account — return seeded streak without hitting the network
    if (userId === SHOWCASE_UID) {
      return {
        success: true,
        message: "showcase seed",
        streak_data: getShowcaseUserData().streak,
        streak_broken: false,
        recalculated: false,
      };
    }

    const url = `${API_BASE_URL}/users/${userId}/streak`;
    // console.log("[getStreak] Fetching streak for user:", userId);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    // console.log("[getStreak] Response status:", response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      // console.error("[getStreak] Error response:", errorMessage);
      // Don't throw - allow app to continue even if streak fetch fails
      return {
        success: false,
        message: errorMessage,
        streak_data: null,
        streak_broken: false,
        recalculated: false,
      };
    }

    const result = await response.json();
    // console.log("[getStreak] Success response:", result);
    return result as GetStreakResponse;
  } catch (error: any) {
    // console.error("[getStreak] Exception:", error.message);
    // Don't throw - allow app to continue
    return {
      success: false,
      message: error.message,
      streak_data: null,
      streak_broken: false,
      recalculated: false,
    };
  }
}

export async function updatePlan(userId: string, plan: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/plan`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    console.log(`[updatePlan] Plan updated to: ${plan}`);
  } catch (error: any) {
    console.error("[updatePlan] Error:", error.message);
    // Don't throw — plan sync failure shouldn't block the app
  }
}

/**
 * Update user's preferred timezone
 */
export async function updateUserTimezone(
  userId: string,
  timezone: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/timezone`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pref_timezone: timezone }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    console.log(`[updateUserTimezone] Timezone updated to: ${timezone}`);
  } catch (error: any) {
    console.error("[updateUserTimezone] Error:", error.message);
    throw error;
  }
}

// ============================================================================
// COMMUNITY ENDPOINTS (Victory Wall)
// ============================================================================

export interface FetchVictoriesParams {
  page?: number;
  limit?: number;
  categories?: DreamCategory[];
  timeframe?: "week" | "month";
}

export async function fetchVictories(
  params: FetchVictoriesParams,
): Promise<import("../types/community").CommunityFeedResponse> {
  try {
    const url = new URL(`${API_BASE_URL}/victories`);

    if (params.page) url.searchParams.append("page", params.page.toString());
    if (params.limit) url.searchParams.append("limit", params.limit.toString());
    if (params.categories && params.categories.length > 0) {
      url.searchParams.append("categories", params.categories.join(","));
    }
    if (params.timeframe)
      url.searchParams.append("timeframe", params.timeframe);

    console.log("[fetchVictories] Fetching from:", url.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("[fetchVictories] Response status:", response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Handle both old format (victories array) and new format (feed array)
    // For backwards compatibility with backend that hasn't been updated yet
    if (result.feed) {
      // New format: mixed feed with victories and journey recaps
      console.log(
        "[fetchVictories] Success, got",
        result.feed.length,
        "feed items",
      );
      return result as import("../types/community").CommunityFeedResponse;
    } else {
      // Old format: only victories - convert to new format
      console.log(
        "[fetchVictories] Success, got",
        result.victories.length,
        "victories (old format)",
      );
      return {
        feed: result.victories.map((v: any) => ({
          ...v,
          type: "victory_card" as const,
        })),
        pagination: result.pagination,
      };
    }
  } catch (error: any) {
    console.error("[fetchVictories] Error:", error.message);
    throw error;
  }
}

export async function createVictory(
  data: CreateVictoryRequest,
): Promise<CreateVictoryResponse> {
  try {
    const url = `${API_BASE_URL}/victories`;
    console.log("[createVictory] Creating victory at:", url);
    console.log("[createVictory] Payload:", data);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("[createVictory] Response status:", response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[createVictory] Success:", result);
    return result as CreateVictoryResponse;
  } catch (error: any) {
    console.error("[createVictory] Error:", error.message);
    throw error;
  }
}

export async function giveCourageBoost(
  victoryId: string,
  userId: string,
): Promise<CourageBoostResponse> {
  try {
    // Backend expects giver_user_id as a query parameter
    const url = `${API_BASE_URL}/victories/${victoryId}/boost?giver_user_id=${encodeURIComponent(userId)}`;

    if (__DEV__) {
      console.log("[giveCourageBoost] Boosting victory at:", url);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (__DEV__) {
      console.log("[giveCourageBoost] Response status:", response.status);
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData = null;
      try {
        errorData = await response.json();
        if (__DEV__) {
          console.error("[giveCourageBoost] Error response data:", errorData);
        }
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        if (__DEV__) {
          console.error("[giveCourageBoost] Could not parse error response");
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    if (__DEV__) {
      console.log("[giveCourageBoost] Success:", result);
    }
    return result as CourageBoostResponse;
  } catch (error: any) {
    if (__DEV__) {
      console.error("[giveCourageBoost] Error:", error);
      console.error("[giveCourageBoost] Error details:", {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      });
    }
    throw error;
  }
}

export async function givePermissionSlip(
  victoryId: string,
  userId: string,
  data: import("../types/community").GivePermissionRequest,
): Promise<import("../types/community").GivePermissionResponse> {
  try {
    // Backend expects giver_user_id as a query parameter
    const url = `${API_BASE_URL}/victories/${victoryId}/permission?giver_user_id=${encodeURIComponent(userId)}`;

    if (__DEV__) {
      console.log("[givePermissionSlip] Giving permission at:", url);
      console.log("[givePermissionSlip] Payload:", data);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (__DEV__) {
      console.log("[givePermissionSlip] Response status:", response.status);
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData = null;
      try {
        errorData = await response.json();
        if (__DEV__) {
          console.error("[givePermissionSlip] Error response data:", errorData);
        }
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        if (__DEV__) {
          console.error("[givePermissionSlip] Could not parse error response");
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    if (__DEV__) {
      console.log("[givePermissionSlip] Success:", result);
    }
    return result as import("../types/community").GivePermissionResponse;
  } catch (error: any) {
    if (__DEV__) {
      console.error("[givePermissionSlip] Error:", error);
    }
    throw error;
  }
}

export async function getVictoryPermissions(
  victoryId: string,
): Promise<import("../types/community").GetPermissionsResponse> {
  try {
    const url = `${API_BASE_URL}/victories/${victoryId}/permissions`;
    console.log("[getVictoryPermissions] Fetching permissions from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("[getVictoryPermissions] Response status:", response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log(
      "[getVictoryPermissions] Success, got",
      result.count,
      "permissions",
    );
    return result as import("../types/community").GetPermissionsResponse;
  } catch (error: any) {
    console.error("[getVictoryPermissions] Error:", error.message);
    throw error;
  }
}

export async function toggleMeToo(
  victoryId: string,
  userId: string,
): Promise<import("../types/community").MeTooResponse> {
  try {
    const url = `${API_BASE_URL}/victories/${victoryId}/metoo?user_id=${encodeURIComponent(userId)}`;
    if (__DEV__) {
      console.log("[toggleMeToo] Toggling Me Too at:", url);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (__DEV__) {
      console.log("[toggleMeToo] Response status:", response.status);
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (__DEV__) {
          console.error("[toggleMeToo] Error response:", errorData);
        }
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    if (__DEV__) {
      console.log("[toggleMeToo] Success:", result);
    }
    return result as import("../types/community").MeTooResponse;
  } catch (error: any) {
    if (__DEV__) {
      console.error("[toggleMeToo] Error:", error.message);
    }
    throw error;
  }
}

export async function getUserCommunityStats(
  userId: string,
): Promise<CommunityStats> {
  try {
    const url = `${API_BASE_URL}/users/${userId}/community-stats`;
    console.log("[getUserCommunityStats] Fetching stats from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("[getUserCommunityStats] Response status:", response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[getUserCommunityStats] Success:", result);
    return result as CommunityStats;
  } catch (error: any) {
    console.error("[getUserCommunityStats] Error:", error.message);
    throw error;
  }
}

export async function fetchInspirationVictories(
  userId: string,
): Promise<VictoriesResponse> {
  try {
    const url = `${API_BASE_URL}/users/${userId}/inspiration`;

    if (__DEV__) {
      console.log("[fetchInspirationVictories] Fetching from:", url);
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (__DEV__) {
      console.log(
        "[fetchInspirationVictories] Response status:",
        response.status,
      );
    }

    if (!response.ok) {
      // If endpoint doesn't exist yet (404), return empty array gracefully
      if (response.status === 404) {
        if (__DEV__) {
          console.warn(
            "[fetchInspirationVictories] Endpoint not implemented yet, returning empty array",
          );
        }
        return {
          victories: [],
          pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
        };
      }

      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    if (__DEV__) {
      console.log("[fetchInspirationVictories] Success:", result);
    }
    return result as VictoriesResponse;
  } catch (error: any) {
    if (__DEV__) {
      console.error("[fetchInspirationVictories] Error:", error.message);
    }
    // Return empty array instead of throwing for better UX
    return {
      victories: [],
      pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 },
    };
  }
}

// Journey Recap Interaction APIs

export async function boostJourneyRecap(
  journeyRecapId: string,
  giverUserId: string,
): Promise<import("../types/community").CourageBoostResponse> {
  try {
    const url = `${API_BASE_URL}/journey-recaps/${journeyRecapId}/boost?giver_user_id=${encodeURIComponent(giverUserId)}`;
    console.log("[boostJourneyRecap] Boosting at:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    console.log("[boostJourneyRecap] Response status:", response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[boostJourneyRecap] Success:", result);
    return result as import("../types/community").CourageBoostResponse;
  } catch (error: any) {
    console.error("[boostJourneyRecap] Error:", error.message);
    throw error;
  }
}

export async function giveJourneyRecapPermission(
  journeyRecapId: string,
  giverUserId: string,
  data: import("../types/community").GivePermissionRequest,
): Promise<import("../types/community").GivePermissionResponse> {
  try {
    const url = `${API_BASE_URL}/journey-recaps/${journeyRecapId}/permission?giver_user_id=${encodeURIComponent(giverUserId)}`;
    console.log("[giveJourneyRecapPermission] Giving permission at:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log(
      "[giveJourneyRecapPermission] Response status:",
      response.status,
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[giveJourneyRecapPermission] Success:", result);
    return result as import("../types/community").GivePermissionResponse;
  } catch (error: any) {
    console.error("[giveJourneyRecapPermission] Error:", error.message);
    throw error;
  }
}

export async function toggleJourneyRecapMeToo(
  journeyRecapId: string,
  userId: string,
): Promise<import("../types/community").MeTooResponse> {
  try {
    const url = `${API_BASE_URL}/journey-recaps/${journeyRecapId}/metoo?user_id=${encodeURIComponent(userId)}`;
    console.log("[toggleJourneyRecapMeToo] Toggling at:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    console.log("[toggleJourneyRecapMeToo] Response status:", response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[toggleJourneyRecapMeToo] Success:", result);
    return result as import("../types/community").MeTooResponse;
  } catch (error: any) {
    console.error("[toggleJourneyRecapMeToo] Error:", error.message);
    throw error;
  }
}

export async function getJourneyRecapPermissions(
  journeyRecapId: string,
): Promise<import("../types/community").GetPermissionsResponse> {
  try {
    const url = `${API_BASE_URL}/journey-recaps/${journeyRecapId}/permissions`;
    console.log("[getJourneyRecapPermissions] Fetching from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log(
      "[getJourneyRecapPermissions] Response status:",
      response.status,
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[getJourneyRecapPermissions] Success:", result);
    return result as import("../types/community").GetPermissionsResponse;
  } catch (error: any) {
    console.error("[getJourneyRecapPermissions] Error:", error.message);
    throw error;
  }
}

/**
 * Fetch full dream data including roadmap and milestones
 * Use this when user navigates to a specific dream detail screen
 *
 * NEW: Uses dreams collection endpoint (/dreams/{thread_id})
 */
/**
 * Helper function to check if a roadmap needs sequential dependencies auto-generated
 * Returns true if ALL milestones have no dependencies (empty or missing)
 */
function needsSequentialDependencies(milestones: any[]): boolean {
  if (!milestones || milestones.length === 0) return false;

  // Check if ALL milestones have no dependencies
  return milestones.every(
    (m: any) => !m.dependencies || (Array.isArray(m.dependencies) && m.dependencies.length === 0)
  );
}

/**
 * Auto-generate sequential dependencies for a roadmap
 * First milestone has no deps, each subsequent milestone depends on the previous one
 */
function generateSequentialDependencies(milestones: any[]): any[] {
  if (!milestones || milestones.length === 0) return milestones;

  return milestones.map((milestone, index) => {
    if (index === 0) {
      // First milestone has no dependencies
      return { ...milestone, dependencies: [] };
    } else {
      // Each milestone depends on the previous one
      return {
        ...milestone,
        dependencies: [milestones[index - 1].id],
      };
    }
  });
}

/**
 * Update dream's roadmap dependencies in the backend
 */
async function updateDreamDependencies(
  threadId: string,
  milestones: any[]
): Promise<void> {
  try {
    console.log(`[API] Updating dependencies for dream ${threadId}`);

    const response = await fetch(`${API_BASE_URL}/dreams-crud/${threadId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roadmap: {
          milestones: milestones,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update dependencies: ${response.status}`);
    }

    console.log(`[API] Successfully updated sequential dependencies for dream ${threadId}`);
  } catch (error: any) {
    console.error("[API] Error updating dream dependencies:", error.message);
    // Don't throw - we can still use the local version with dependencies
  }
}

export async function fetchDreamDetails(
  _userId: string,
  threadId: string,
): Promise<any> {
  try {
    // Showcase demo account — return seeded detail without hitting the network
    if (_userId === SHOWCASE_UID) {
      const detail = getShowcaseDreamDetail(threadId);
      if (detail) {
        console.log("[fetchDreamDetails] Returning showcase seed for", threadId);
        return detail;
      }
    }

    console.log(`Fetching dream details for threadId: ${threadId}`);

    // Fetch from dreams CRUD collection endpoint
    const response = await fetch(`${API_BASE_URL}/dreams-crud/${threadId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const dreamData = await response.json();
    console.log("Dream details fetched successfully");

    // Auto-generate sequential dependencies if needed
    if (dreamData?.roadmap?.milestones) {
      const milestones = dreamData.roadmap.milestones;

      if (needsSequentialDependencies(milestones)) {
        console.log(`[API] Dream ${threadId} has no dependencies - auto-generating sequential dependencies`);

        const updatedMilestones = generateSequentialDependencies(milestones);

        // Update in backend (fire and forget)
        updateDreamDependencies(threadId, updatedMilestones).catch(err => {
          console.warn('[API] Failed to persist sequential dependencies:', err);
        });

        // Update local copy immediately
        dreamData.roadmap.milestones = updatedMilestones;

        console.log('[API] Sequential dependencies generated:', {
          milestoneCount: updatedMilestones.length,
          sample: updatedMilestones.slice(0, 3).map((m: any) => ({
            id: m.id,
            title: m.title?.substring(0, 30),
            dependencies: m.dependencies,
          })),
        });
      }
    }

    return dreamData;
  } catch (error: any) {
    console.error("Error fetching dream details:", error.message);
    throw error;
  }
}

/**
 * Fetch dreams list with summary info only (no full roadmaps)
 * Use this for displaying dreams list without heavy data
 *
 * NEW: Uses dreams collection endpoint (/dreams?user_id={userId})
 */
export async function fetchDreamsList(
  userId: string,
  options?: {
    status?: "active" | "completed";
    page?: number;
    limit?: number;
    summary?: boolean;
  },
): Promise<any> {
  try {
    // Showcase demo account — return seeded list without hitting the network
    if (userId === SHOWCASE_UID) {
      console.log("[fetchDreamsList] Returning showcase seed data");
      return getShowcaseDreamsList();
    }

    console.log(`Fetching dreams list for userId: ${userId}`);

    // Build query parameters
    const params = new URLSearchParams({
      user_id: userId,
      summary: (options?.summary !== false).toString(), // Default to true
    });

    if (options?.status) {
      params.append("status", options.status);
    }
    if (options?.page) {
      params.append("page", options.page.toString());
    }
    if (options?.limit) {
      params.append("limit", options.limit.toString());
    }

    // Fetch from dreams CRUD collection endpoint
    const response = await fetch(
      `${API_BASE_URL}/dreams-crud?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Return the dreams array (backend returns { dreams: [...], pagination: {...} })
    const dreams = result.dreams || [];
    console.log(`Dreams list fetched successfully (${dreams.length} dreams)`);

    return result; // Return full response with pagination
  } catch (error: any) {
    console.error("Error fetching dreams list:", error.message);
    // Return empty result instead of throwing
    return {
      dreams: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}

// ============================================================================
// CUSTOM MILESTONE ENDPOINTS
// ============================================================================

export interface AddMilestoneRequest {
  title: string;
  challenge_type: string;
  description?: string;
}

export interface AddMilestoneResponse {
  success: boolean;
  milestone: any;
  milestones: any[];
}

export async function addMilestoneToRoadmap(
  threadId: string,
  data: AddMilestoneRequest,
): Promise<AddMilestoneResponse> {
  try {
    const url = `${API_BASE_URL}/dreams-crud/${threadId}/milestones`;
    console.log("[addMilestoneToRoadmap] POST:", url, data);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("[addMilestoneToRoadmap] Response status:", response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[addMilestoneToRoadmap] Success:", result);
    return result as AddMilestoneResponse;
  } catch (error: any) {
    console.error("[addMilestoneToRoadmap] Error:", error.message);
    throw error;
  }
}

export async function createJourneyRecap(
  data: import("../types/community").CreateJourneyRecapRequest,
  userId: string,
): Promise<import("../types/community").CreateJourneyRecapResponse> {
  try {
    const url = `${API_BASE_URL}/journey-recaps?user_id=${encodeURIComponent(userId)}`;
    console.log("[createJourneyRecap] Creating journey recap at:", url);
    console.log("[createJourneyRecap] Payload:", data);

    // Clean up undefined values - convert to null or remove them
    const cleanedData: any = {
      dreamId: data.dreamId,
      journeyStory: data.journeyStory,
      isAnonymous: data.isAnonymous,
    };

    // Only include keyMoment if it has a value
    if (data.keyMoment && data.keyMoment.trim()) {
      cleanedData.keyMoment = data.keyMoment;
    }

    console.log("[createJourneyRecap] Cleaned payload:", cleanedData);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanedData),
    });

    console.log("[createJourneyRecap] Response status:", response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[createJourneyRecap] Success:", result);
    return result as import("../types/community").CreateJourneyRecapResponse;
  } catch (error: any) {
    console.error("[createJourneyRecap] Error:", error.message);
    throw error;
  }
}

// ============================================================================
// NOTIFICATION ENDPOINTS
// ============================================================================

/**
 * Save user's push token to backend
 */
export async function savePushToken(
  userId: string,
  pushToken: string,
): Promise<void> {
  try {
    console.log(`[savePushToken] Saving push token for user: ${userId}`);

    const response = await fetch(`${API_BASE_URL}/users/${userId}/push-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pushToken }),
    });

    console.log(`[savePushToken] Response status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[savePushToken] Success:", result);
  } catch (error: any) {
    console.error("[savePushToken] Error:", error.message);
    // Don't throw - allow app to continue even if token save fails
  }
}

/**
 * Update user's last activity timestamp
 */
export async function updateLastActivity(userId: string): Promise<void> {
  try {
    console.log(
      `[updateLastActivity] Updating last activity for user: ${userId}`,
    );

    const response = await fetch(`${API_BASE_URL}/users/${userId}/activity`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        last_activity: new Date().toISOString(),
      }),
    });

    console.log(`[updateLastActivity] Response status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[updateLastActivity] Success:", result);
  } catch (error: any) {
    console.error("[updateLastActivity] Error:", error.message);
    // Don't throw - allow app to continue
  }
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: {
    dailyCheckIn: boolean;
    comebackAlert: boolean;
    preferredTime: string;
  },
): Promise<void> {
  try {
    console.log(
      `[updateNotificationPreferences] Updating preferences for user: ${userId}`,
    );

    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/notification-preferences`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      },
    );

    console.log(
      `[updateNotificationPreferences] Response status: ${response.status}`,
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (parseError) {
        // Silent fail
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("[updateNotificationPreferences] Success:", result);
  } catch (error: any) {
    console.error("[updateNotificationPreferences] Error:", error.message);
    throw error;
  }
}
