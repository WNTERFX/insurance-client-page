import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./dbServer";
import "./styles/login-styles.css";

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Extract the recovery token from the URL
  useEffect(() => {
    const hash = window.location.hash; // "#access_token=XYZ&type=recovery"
    const params = new URLSearchParams(hash.replace("#", "?"));
    const token = params.get("access_token");

    if (!token) {
      setMessage("❌ No token found. Please request a new password reset link.");
      return;
    }

    setAccessToken(token);

    // Step 2: Get user from Supabase using the token
    async function fetchUser() {
      const { data, error } = await db.auth.getUser(token);
      if (error || !data.user) {
        setMessage("❌ Invalid or expired token. Request a new link.");
        return;
      }

      setUser(data.user);

      // Step 3: Get client info from clients_Table
      const { data: client, error: clientError } = await db
        .from("clients_Table")
        .select("*")
        .eq("auth_id", data.user.id)
        .maybeSingle();

      if (clientError) console.error("Error fetching client info:", clientError);
      else setClientInfo(client);
    }

    fetchUser();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!accessToken) {
      setMessage("❌ No token found. Please request a new password reset link.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("⚠️ Passwords do not match!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await db.auth.updateUser({
        password: newPassword,
        access_token: accessToken,
      });
      if (error) throw error;

      setMessage("✅ Password successfully updated! Redirecting to login...");
      setTimeout(() => navigate("/insurance-client-page/login"), 2000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const displayFullName = (client) => {
    if (!client) return null;
    const nameParts = [
      client.prefix,
      client.first_Name,
      client.middle_Name,
      client.family_Name,
      client.suffix,
    ].filter(Boolean);
    return nameParts.join(" ");
  };

  return (
    <div className="login-container">
      <div className="container">
        <div className="login-card">
          <div className="right-panel">
            <h2>Reset Your Password</h2>

            {message && <p className="message">{message}</p>}

            {clientInfo && user ? (
              <p className="reset-user-info">
                Resetting password for: <br />
                <strong>{displayFullName(clientInfo)}</strong> <br />
                <span style={{ fontSize: "13px", color: "#777" }}>
                  {user.email}
                </span>
              </p>
            ) : !message ? (
              <p className="reset-user-info loading">Fetching user info...</p>
            ) : null}

            <form onSubmit={handleResetPassword}>
              <label>New Password</label>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="show-pass-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <label>Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button type="submit" disabled={loading || !user}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>

            <button
              className="link-button"
              onClick={() => navigate("/insurance-client-page/login")}
              style={{ marginTop: "10px" }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
