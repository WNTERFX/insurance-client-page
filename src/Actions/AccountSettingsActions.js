import { db } from "../dbServer";


export async function fetchNotificationSettings() {
  // Get the logged-in user's auth ID from the server/session
  const { data: { user }, error: userError } = await db.auth.getUser(); 
  if (userError || !user) throw new Error("User not authenticated");

  const { data, error } = await db
    .from("clients_Table")
    .select("notification_allowed_sms, notification_allowed_email")
    .eq("auth_id", user.id)
    .single();

  if (error) throw error;

  return {
    sms: data.notification_allowed_sms,
    email: data.notification_allowed_email,
  };
}

/**
 * Update notification settings for the logged-in user.
 */
export async function updateNotificationSettings(sms, email) {
  const { data: { user }, error: userError } = await db.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated");

  const { error } = await db
    .from("clients_Table")
    .update({
      notification_allowed_sms: sms,
      notification_allowed_email: email,
    })
    .eq("auth_id", user.id);

  if (error) throw error;

  return true;
}