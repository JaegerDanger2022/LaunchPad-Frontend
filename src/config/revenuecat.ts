import Purchases, { LOG_LEVEL, PurchasesPackage } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { Linking, Platform } from "react-native";
import Constants from "expo-constants";

// RevenueCat Configuration
// const REVENUECAT_API_KEY = Constants.expoConfig?.extra?.REVENUECAT_API_KEY || process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "";
const REVENUECAT_API_KEY = "test_QBNWPiBhdYTPiRTtNxgeFJLVdWr";

/**
 * Initialize RevenueCat SDK
 * Call this early in your app lifecycle, ideally in App.tsx
 */
export async function configureRevenueCat(userId?: string): Promise<void> {
  try {
    // Set up Purchases configuration
    Purchases.setLogLevel(LOG_LEVEL.INFO);

    if (!REVENUECAT_API_KEY) {
      console.warn(
        "[RevenueCat] API key not configured. Set REVENUECAT_API_KEY in .env",
      );
      return;
    }

    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    console.log("[RevenueCat] SDK configured successfully");

    // If user is already logged in, identify them
    if (userId) {
      await Purchases.logIn(userId);
      console.log(`[RevenueCat] User identified: ${userId}`);
    }
  } catch (error) {
    console.error("[RevenueCat] Configuration error:", error);
  }
}

/**
 * Identify a user in RevenueCat
 * Call this after successful authentication
 */
export async function identifyRevenueCatUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
    console.log(`[RevenueCat] User identified: ${userId}`);
  } catch (error) {
    console.error("[RevenueCat] Error identifying user:", error);
    throw error;
  }
}

/**
 * Log out the current user
 * Call this when user signs out
 */
export async function logoutRevenueCatUser(): Promise<void> {
  try {
    await Purchases.logOut();
    console.log("[RevenueCat] User logged out");
  } catch (error) {
    console.error("[RevenueCat] Error logging out user:", error);
  }
}

/**
 * Get available offerings (products/subscriptions)
 */
export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();

    if (
      offerings.current !== null &&
      offerings.current.availablePackages.length > 0
    ) {
      console.log(
        "[RevenueCat] Available offerings:",
        offerings.current.availablePackages.length,
      );
      return offerings.current.availablePackages;
    }

    console.warn("[RevenueCat] No offerings available");
    return [];
  } catch (error) {
    console.error("[RevenueCat] Error fetching offerings:", error);
    throw error;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(packageToPurchase: PurchasesPackage) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    console.log("[RevenueCat] Purchase successful:", customerInfo);
    return customerInfo;
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error("[RevenueCat] Purchase error:", error);
    }
    throw error;
  }
}

/**
 * Check if user has active entitlement
 */
export async function checkEntitlement(
  entitlementId: string,
): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[entitlementId];
    return entitlement !== undefined;
  } catch (error) {
    console.error("[RevenueCat] Error checking entitlement:", error);
    return false;
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases() {
  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log("[RevenueCat] Purchases restored:", customerInfo);
    return customerInfo;
  } catch (error) {
    console.error("[RevenueCat] Error restoring purchases:", error);
    throw error;
  }
}

/**
 * Present RevenueCat's Customer Center in-app UI for subscription management.
 * Falls back to the platform's subscription settings if Customer Center fails.
 */
export async function showManageSubscriptions(): Promise<boolean> {
  try {
    await RevenueCatUI.presentCustomerCenter();
    console.log("[RevenueCat] Presented Customer Center");
    return true;
  } catch (error) {
    console.warn("[RevenueCat] Customer Center failed, falling back:", error);

    // Fallback: open the platform's subscription settings directly
    try {
      const fallbackUrl =
        Platform.OS === "ios"
          ? "https://apps.apple.com/account/subscriptions"
          : "https://play.google.com/store/account/subscriptions";
      await Linking.openURL(fallbackUrl);
      return true;
    } catch (fallbackError) {
      console.error("[RevenueCat] Fallback also failed:", fallbackError);
      return false;
    }
  }
}
