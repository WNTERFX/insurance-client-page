import { db } from "../dbServer";

export async function signUpClient({ policyInternalId, email, password }) {
  try {
    // Construct the redirect URL for email verification
    const redirectUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3000/insurance-client-page/email-verified'
      : 'https://insurance-client-page.vercel.app/insurance-client-page/email-verified';

    const { data: result, error: invokeError } = await db.functions.invoke(
      'sign-in-client', 
      {
        body: {
          policyInternalId,
          email,
          password,
          emailRedirectTo: redirectUrl  // Pass the redirect URL to the edge function
        }
      }
    );

    // This part is only for 2xx (successful) responses
    if (invokeError) {
      throw invokeError;
    }

    if (result.success) {
      await db.auth.setSession(result.session);
      return result;
    } else {
      // This is for 2xx responses that are *logical* errors
      return result;
    }
  } catch (error) {
    console.error("Sign up error:", error);
    
    // When the function returns a 403 or 500, the *real* JSON
    // response is nested inside the 'context' of the error.
    if (error.context && typeof error.context.json === 'function') {
      // It's a structured function error (like our 403)
      const functionError = await error.context.json();
      return functionError;
    }
    
    // It's a different kind of error (e.g., network)
    return { success: false, error: error.message };
  }
}