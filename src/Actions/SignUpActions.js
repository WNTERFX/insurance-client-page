// [!code focus:22]
import { db } from "../dbServer";

export async function signUpClient({ policyInternalId, email, password }) {
  try {
    const { data: result, error: invokeError } = await db.functions.invoke(
      'sign-in-client', 
      {
        body: {
          policyInternalId,
          email,
          password
        }
      }
    );

    // This part is only for 2xx (successful) responses
    if (invokeError) {
      throw invokeError; // This jumps to the catch block
    }

    if (result.success) {
      await db.auth.setSession(result.session);
      return result;
    } else {
      // This is for 2xx responses that are *logical* errors
      // e.g., { success: false, error: "Policy not found" }
      // We'll treat it as an error to be safe.
      return result;
    }

  } catch (error) {
    console.error("Sign in error:", error);

    // [!code focus:10]
    // THIS IS THE FIX
    // When the function returns a 403 or 500, the *real* JSON
    // response is nested inside the 'context' of the error.
    if (error.context && typeof error.context.json === 'function') {
      // It's a structured function error (like our 403)
      const functionError = await error.context.json();
      return functionError; // This returns { success: false, requiresVerification: true, ... }
    }
    
    // It's a different kind of error (e.g., network)
    return { success: false, error: error.message };
  }
}