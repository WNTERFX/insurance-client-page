import { db } from "../dbServer";

/**
 * Create a PayMongo payment intent and get checkout URL.
 * This will ALWAYS create checkout URLs matching the current environment.
 */
export async function createPayMongoCheckout(paymentId) {
  try {
    console.log("=== CREATE PAYMONGO CHECKOUT ===");
    console.log("Payment ID:", paymentId);

    // Detect current environment
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // Determine origin based on environment
    let finalOrigin = window.location.origin;
    console.log(
      isLocalhost
        ? "✅ Running on LOCALHOST"
        : `✅ Running on PRODUCTION (Origin: ${finalOrigin})`
    );

    // Construct redirect URLs
    const successUrl = `${finalOrigin}/insurance-client-page/main-portal/payment/success`;
    const failureUrl = `${finalOrigin}/insurance-client-page/main-portal/payment/failure`;

    console.log("Environment:", isLocalhost ? "LOCALHOST" : "PRODUCTION");
    console.log("Final Origin:", finalOrigin);
    console.log("Success URL:", successUrl);
    console.log("Failure URL:", failureUrl);

    // Safety check
    if (
      !isLocalhost &&
      (successUrl.includes("localhost") || failureUrl.includes("localhost"))
    ) {
      console.error(
        "🚨 CRITICAL ERROR: Production trying to use localhost URLs!"
      );
      throw new Error("Invalid redirect URLs detected");
    }

    const requestBody = {
      payment_id: paymentId,
      payment_method_allowed: ["gcash", "paymaya", "grab_pay", "card"],
      success_url: successUrl,
      failure_url: failureUrl,
    };

    console.log("Calling Edge Function with:", requestBody);

    const { data, error } = await db.functions.invoke(
      "paymongo-create-payment",
      { body: requestBody }
    );

    console.log("Edge Function Response:", { data, error });

    if (error) throw new Error(`Edge Function error: ${error.message}`);
    if (!data) throw new Error("No data returned from Edge Function");
    if (!data.success) throw new Error(data.error || "Function did not succeed");
    if (!data.checkout_url) throw new Error("No checkout URL returned");

    console.log("✅ Checkout created successfully:", data.checkout_url);

    return data;
  } catch (err) {
    console.error("❌ createPayMongoCheckout() failed:", err);
    throw err;
  }
}

/**
 * Check payment transaction status.
 * Only returns transactions from the SAME environment.
 */
export async function checkPaymentTransaction(paymentId) {
  try {
    const { data, error } = await db
      .from("paymongo_transactions")
      .select("*")
      .eq("payment_id", paymentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error checking transaction:", error);
      return null;
    }

    if (!data) {
      console.log("ℹ️ No existing transaction found");
      return null;
    }

    console.log("🔍 Found existing transaction:", {
      id: data.id,
      status: data.status,
      created_at: data.created_at,
      checkout_url: data.checkout_url?.substring(0, 50) + "...",
    });

    // Environment check
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    const savedUrlIsLocalhost =
      data.checkout_url?.includes("localhost") ||
      data.checkout_url?.includes("127.0.0.1");

    const storedOrigin = data.raw_response?._metadata?.request_origin;
    const storedOriginIsLocalhost =
      storedOrigin?.includes("localhost") ||
      storedOrigin?.includes("127.0.0.1");

    console.log("🌐 Environment Check:", {
      currentEnv: isLocalhost ? "LOCALHOST" : "PRODUCTION",
      savedEnv: savedUrlIsLocalhost ? "LOCALHOST" : "PRODUCTION",
      storedOrigin: storedOrigin || "not available",
    });

    // Reject if different environments
    if (isLocalhost !== savedUrlIsLocalhost) {
      console.log("❌ ENVIRONMENT MISMATCH - Creating new checkout");
      return null;
    }

    // Check if payment is pending
    const pendingStatuses = [
      "awaiting_payment_method",
      "awaiting_next_action",
      "processing",
    ];

    if (!pendingStatuses.includes(data.status)) {
      console.log("⏭️ Payment status changed:", data.status);
      return null;
    }

    // Check expiration (1 hour)
    const createdAt = new Date(data.created_at);
    const now = new Date();
    const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

    if (hoursSinceCreation > 1) {
      console.log("⏰ Checkout expired:", hoursSinceCreation.toFixed(2), "hours old");
      return null;
    }

    console.log("✅ Transaction valid for reuse (same environment)");
    return data;
  } catch (error) {
    console.error("Error in checkPaymentTransaction:", error);
    return null;
  }
}

/**
 * Attach payment method to payment intent (for cards)
 */
export async function attachPaymentMethod(
  paymentIntentId,
  paymentMethodId,
  clientKey
) {
  try {
    const { data, error } = await db.functions.invoke(
      "paymongo-attach-payment",
      {
        body: {
          payment_intent_id: paymentIntentId,
          payment_method_id: paymentMethodId,
          client_key: clientKey,
        },
      }
    );

    if (error) throw error;
    if (!data.success) throw new Error(data.error || "Failed to attach payment method");

    return data;
  } catch (error) {
    console.error("PayMongo attach error:", error);
    throw error;
  }
}
