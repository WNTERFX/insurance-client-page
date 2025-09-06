import { db } from "../dbServer";

export async function loginClient({ email, password }) {
  try {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Login error:", error.message);
      return { success: false, error: error.message };
    }


    const { data: employeeData, error: employeeError } = await db
      .from('employee_Accounts')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (employeeError && employeeError.code !== 'PGRST116') {
      
      console.error("Employee check error:", employeeError.message);
     
      await db.auth.signOut();
      return { success: false, error: "Unable to verify user permissions" };
    }

    if (employeeData) {
      
      await db.auth.signOut();
      return { 
        success: false, 
        error: "Admin accounts cannot access client portal" 
      };
    }

    
    return { success: true, user: data.user, session: data.session };
    
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: err.message };
  }
}


export async function logoutClient() {
  try {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Logout error:", err.message);
    return { success: false, error: err.message };
  }
}


export async function getCurrentClient() {
  const { data, error } = await db.auth.getUser();
  if (error) {
    console.error("Get user error:", error.message);
    return null;
  }
  return data?.user || null;
}
