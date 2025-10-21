// Actions/PayMongoActions.js
import { db } from "../dbServer";

/**
 * Create a PayMongo payment intent and get checkout URL
 */
export async function createPayMongoCheckout(paymentId) {
  try {
    console.log("Creating checkout for payment ID:", paymentId);

    const { data, error } = await db.functions.invoke('paymongo-create-payment', {
      body: {
        payment_id: paymentId,
        payment_method_allowed: ['gcash', 'paymaya', 'grab_pay', 'card'],
        success_url: `${window.location.origin}/insurance-client-page/main-portal/payment/success`,
        failure_url: `${window.location.origin}/insurance-client-page/main-portal/payment/failure`,
      }
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

  return data;
}