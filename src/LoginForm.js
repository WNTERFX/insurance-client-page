import "./styles/login-styles.css";
import logo from "./images/logo.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { loginClient } from "./Actions/LoginActions";
import { db } from "./dbServer"; // Supabase client

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await loginClient({ email, password });
    setLoading(false);

    if (!result.success) {
      alert("Login failed: " + result.error);
      return;
    }

    navigate("/appinsurance/login/MainArea/Home");
  };

  // Fetch user full name
  const fetchUserNameByEmail = async (email) => {
    if (!email) {
      setUserName("");
      return;
    }
    try {
      const { data, error } = await db
        .from("clients_Table")
        .select("first_Name, middle_Name, family_Name")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        const fullName = `${data.first_Name} ${data.middle_Name ? data.middle_Name + " " : ""}${data.family_Name}`;
        setUserName(fullName);
      } else setUserName("");
    } catch (err) {
      console.error("Error fetching user:", err);
      setUserName("");
    }
  };

  useEffect(() => {
    fetchUserNameByEmail(resetEmail);
  }, [resetEmail]);

  // Send password reset email
  const handleSendResetEmail = async () => {
    setResetLoading(true);
    setResetError("");
    setResetSuccess("");

    try {
      const { data, error } = await db.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + "/appinsurance/reset-password",
      });

      if (error) throw error;

      console.log("Reset link (test only):", data?.action_link);

      setResetSuccess("Password reset link sent! Check your email inbox. (Check console for test link)");
    } catch (error) {
      setResetError(error.message || "Failed to send password reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail("");
    setUserName("");
    setResetError("");
    setResetSuccess("");
  };

  return (
    <div className="login-container">
      <div className="container">
        <div className="login-card">
          {/* Logo Panel */}
          <div className="logo-panel">
            <img src={logo} alt="silverstar_insurance_inc_Logo" />
          </div>

          {/* Login Panel */}
          <div className="right-panel">
            <h2>Log In to your account</h2>
            <form onSubmit={handleLogin}>
              {/* Email */}
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Password */}
              <label>Password</label>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="show-pass-btn"
                  onClick={toggleShowPassword}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="forgot-password-link">
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setShowResetModal(true)}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Controls */}
              <div className="login-controls">
                <button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Log In"}
                </button>
                <button type="button" onClick={() => navigate("/appinsurance/signin")}>
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={closeResetModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button className="close-button" onClick={closeResetModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {userName ? (
                <p>
                  Hi <strong>{userName}</strong>, enter your email to receive a password reset link.
                </p>
              ) : (
                <p>Enter your email to receive a password reset link.</p>
              )}

              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />

              <button
                className="modal-button"
                onClick={handleSendResetEmail}
                disabled={resetLoading || !resetEmail}
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>

              {resetError && <p className="error-message">{resetError}</p>}
              {resetSuccess && <p className="success-message">{resetSuccess}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
