import { db } from "../dbServer";

export async function signInClient({ policyInternalId, email, password }) {
  try {
    const response = await fetch(
      'https://ezmvecxqcjnrspmjfgkk.supabase.co/functions/v1/sign-in-client',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bXZlY3hxY2pucnNwbWpmZ2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MjUzMzMsImV4cCI6MjA3MDEwMTMzM30.M0ZsDxmJRc7EFe3uzRFmy69TymcsdwMbV54jkay29tI`
        },
        body: JSON.stringify({
          policyInternalId,
          email,
          password
        })
      }
    );

    const result = await response.json();

    if (result.success) {
      // Store the session in Supabase auth
      await db.auth.setSession(result.session);
      return result;
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: error.message };
  }
}