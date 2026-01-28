// API Configuration
// Update this with your backend API URL
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

export interface UserRegistrationData {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface UserData {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  _id?: string;
  created_at?: string;
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
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error("Could not parse error response as JSON");
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("User registered successfully:", result);
  } catch (error: any) {
    console.error("Error registering user to database:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    // Don't throw - registration failure shouldn't block app auth
    // User is still authenticated, just not in database
  }
}

export async function fetchUserData(userId: string): Promise<UserData | null> {
  try {
    console.log(`Attempting to fetch user data for userId: ${userId}`);

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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
    // console.log("User data fetched successfully:", userData);
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
    console.log("Full URL being called:", url);

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
    console.log("Full URL being called:", url);

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
