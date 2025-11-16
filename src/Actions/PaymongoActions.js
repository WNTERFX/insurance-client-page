// Actions/PayMongoActions.js
import { db } from "../dbServer";

/**
 * Create a PayMongo payment intent and get checkout URL
 */
export async function createPayMongoCheckout(paymentId) {
  try {
    console.log("Creating checkout for payment ID:", paymentId);
    
    // ✅ Smart origin detection
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    // If on localhost AND no env var set, use localhost
    // If on production OR env var is set, use that
    let finalOrigin;
    
    if (isLocalhost) {
      // Check if we want to test with production URLs from localhost
      finalOrigin = process.env.REACT_APP_PRODUCTION_URL || window.location.origin;
    } else {
      // In production, always use production URL (never localhost)
      finalOrigin = process.env.REACT_APP_PRODUCTION_URL || 
                    'https://insurance-client-page.vercel.app';
    }
    
    // Construct URLs
    const successUrl = `${finalOrigin}/insurance-client-page/main-portal/payment/success`;
    const failureUrl = `${finalOrigin}/insurance-client-page/main-portal/payment/failure`;
    
 /*    console.log("=== Payment URLs ===");
    console.log("Current Location:", window.location.href);
    console.log("Hostname:", window.location.hostname);
    console.log("Is Localhost:", isLocalhost);
    console.log("Env Variable:", process.env.REACT_APP_PRODUCTION_URL);
    console.log("Final Origin:", finalOrigin);
    console.log("Success URL:", successUrl);
    console.log("Failure URL:", failureUrl);
     */

    
    const requestBody = {
      payment_id: paymentId,
      payment_method_allowed: ['gcash', 'paymaya', 'grab_pay', 'card'],
      success_url: successUrl,
      failure_url: failureUrl,
    };
    
    console.log("Request body:", JSON.stringify(requestBody, null, 2));
    
    const { data, error } = await db.functions.invoke('paymongo-create-payment', {
      body: requestBody
    });
    
    console.log('=== Supabase Function Invoke Result ===');
    console.log('data:', data);
    console.log('error:', error);
    
    if (!data) {
      throw new Error('No data returned from Supabase function');
    }
    if (!data.success) {
      throw new Error(data.error || 'Function did not succeed');
    }
    if (!data.checkout_url) {
      throw new Error('No checkout URL returned');
    }
    
    return data;
  } catch (err) {
    console.error('createPayMongoCheckout() failed:', err);
    throw err;
  }
}

/**
 * Attach payment method to payment intent (for card payments)
 */
export async function attachPaymentMethod(paymentIntentId, paymentMethodId, clientKey) {
  try {
    const { data, error } = await db.functions.invoke('paymongo-attach-payment', {
      body: {
        payment_intent_id: paymentIntentId,
        payment_method_id: paymentMethodId,
        client_key: clientKey,
      }
    });
    
    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Failed to attach payment method');
    
    return data;
  } catch (error) {
    console.error('PayMongo attach error:', error);
    throw error;
  }
}

/**
 * Check payment transaction status
 */
export async function checkPaymentTransaction(paymentId) {
  const { data, error } = await db
    .from('paymongo_transactions')
    .select('*')
    .eq('payment_id', paymentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking transaction:', error);
    return null;
  }
  
  // ✅ Don't reuse checkout URLs if they're from a different origin
  if (data?.checkout_url) {
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    const savedUrlIsLocalhost = data.checkout_url.includes('localhost') || 
                                 data.checkout_url.includes('127.0.0.1');
    
    // If origins don't match, treat as no existing transaction
    if (isLocalhost !== savedUrlIsLocalhost) {
      console.log('🔄 Existing transaction has wrong origin, creating new checkout');
      return null;
    }
  }
  
  return data;
}