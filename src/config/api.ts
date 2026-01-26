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
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text();
        console.error("Response body (text):", text);
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${text}`,
        );
      }
      console.error("Error response data:", errorData);
      if (errorData.detail && Array.isArray(errorData.detail)) {
        console.error("Validation errors:");
        errorData.detail.forEach((err: any) => {
          console.error(`  - Field: ${err.loc?.[1] || 'unknown'}, Message: ${err.msg}`);
        });
      }
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      );
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

      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text();
        console.error("Response body (text):", text);
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${text}`,
        );
      }

      console.error("Error response data:", errorData);
      throw new Error(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    const userData = await response.json();
    console.log("User data fetched successfully:", userData);
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
    console.log(
      `Attempting to create dream for userId: ${userId}`,
    );
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
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text();
        console.error("Response body (text):", text);
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${text}`,
        );
      }
      console.error("Error response data:", errorData);
      if (errorData.detail && Array.isArray(errorData.detail)) {
        console.error("Validation errors:");
        errorData.detail.forEach((err: any) => {
          console.error(`  - Field: ${err.loc?.[1] || 'unknown'}, Message: ${err.msg}`);
        });
      }
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    const result = await response.json();
    console.log("Dream created successfully:", result);
    return result.thread_id || null;
  } catch (error: any) {
    console.error("Error creating dream:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}

export async function updateDreamThreadId(
  userId: string,
  dreamId: string,
  threadId: string,
): Promise<void> {
  try {
    console.log(
      `Attempting to update dream thread_id for userId: ${userId}, dreamId: ${dreamId}`,
    );

    const response = await fetch(`${API_BASE_URL}/dreams/${dreamId}/thread`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        thread_id: threadId,
      }),
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text();
        console.error("Response body (text):", text);
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${text}`,
        );
      }
      console.error("Error response data:", errorData);
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    console.log("Dream thread_id updated successfully");
  } catch (error: any) {
    console.error("Error updating dream thread_id:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}
