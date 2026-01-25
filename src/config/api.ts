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
