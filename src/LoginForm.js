import "./styles/login-styles.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginClient } from "./Actions/LoginActions";
import { db } from "./dbServer";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginForm() {
  const navigate = useNavigate();

  // form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePassword = () => setPasswordVisible((v) => !v);

  // ui + errors
  const [loading, setLoading] = useState(false);
  const [bannerError, setBannerError] = useState("");     // big top banner (email/general)
  const [passwordError, setPasswordError] = useState(""); // inline under password

  // reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");       // top banner inside modal
  const [resetSuccess, setResetSuccess] = useState("");

  const clearErrors = () => {
    setBannerError("");
    setPasswordError("");
  };

  // ------- LOGIN -------
  const handleLogin = async (e) => {
    e.preventDefault();
    clearErrors();
    setLoading(true);

    const result = await loginClient({ email, password });
    setLoading(false);

    if (!result?.success) {
      // Normalize to "email address"
      const rawMsg = String(result?.error || "Invalid email address or password");
      const uiMsg = rawMsg.replace(/username/gi, "email address");

      // If it clearly looks like an email issue, show banner only.
      const isEmailIssue =
        /email/i.test(uiMsg) && /(invalid|not\s*found|missing|format)/i.test(uiMsg);

      // Otherwise treat as password issue by default (only inline).
      const isPasswordIssue = !isEmailIssue || /password/i.test(uiMsg);

      if (isPasswordIssue) {
        setBannerError(""); // ensure only one message shows
        setPasswordError("The password you’ve entered is incorrect.");
        return;
      }

      setPasswordError("");
      setBannerError("Wrong Credentials — Invalid email address or password");
      return;
    }

    navigate("/insurance-client-page/main-portal/Home");
  };

  // ------- RESET PASSWORD -------
  const handleSendResetEmail = async () => {
    // Basic required check to show a nice banner in modal
    if (!resetEmail.trim()) {
      setResetError("Email is required");
      setResetSuccess("");
      return;
    }

    setResetLoading(true);
    setResetError("");
    setResetSuccess("");

    try {
      const { data, error } = await db.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + "/insurance-client-page/reset-password",
      });
      if (error) throw error;

      // For testing you may see it in console:
      console.log("Reset link (test only):", data?.action_link);
      setResetSuccess("Password reset link sent! Check your email inbox.");
    } catch (err) {
      setResetError(err.message || "Failed to send password reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  const openReset = () => {
    setShowResetModal(true);
    setResetEmail("");
    setResetError("");
    setResetSuccess("");
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail("");
    setResetError("");
    setResetSuccess("");
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-header">
          <div className="header-left">
            <h2>LOGIN</h2>
            <p>Welcome to Silverstar Insurance Inc.</p>
          </div>
          <img
            className="header-logo"
            src={require("./images/logo_.png")}
            alt="silverstar_insurance_inc_Logo"
          />
        </div>

        <form className="login-form" onSubmit={handleLogin} noValidate>
          {/* TOP BANNER ERROR (email/general) */}
          {bannerError && (
            <div className="alert alert-error" role="alert" aria-live="assertive">
              <strong>Wrong Credentials</strong>
              <span>Invalid email address or password</span>
            </div>
          )}

          {/* EMAIL */}
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (bannerError) setBannerError("");
            }}
            required
            aria-invalid={!!bannerError}
          />

          {/* PASSWORD */}
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              required
              aria-invalid={!!passwordError}
            />
            <span
              onClick={togglePassword}
              className="eye-icon"
              aria-label={passwordVisible ? "Hide password" : "Show password"}
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {passwordError && <small className="field-error">{passwordError}</small>}

          <a
            href="#"
            className="forgot-password-client"
            onClick={(e) => {
              e.preventDefault();
              openReset();
            }}
          >
            Forgot password?
          </a>

          <button type="submit" className="login-button-client" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>

          {/* Login Controls */}
          <div className="login-controls">
            <p>Don’t have an account?</p>
            <a href="/insurance-client-page/signup" type="button">
              Sign Up
            </a>
          </div>
        </form>
      </div>

      {/* ===== Redesigned Reset Password Modal ===== */}
      {showResetModal && (
        <div
          className="rp-overlay"
          onClick={closeResetModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rp-title"
        >
          <div
            className="rp-modal"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeResetModal();
              if (e.key === "Enter" && !resetLoading) handleSendResetEmail();
            }}
          >
            <div className="rp-header">
              <h3 id="rp-title">Reset password</h3>
              <button
                type="button"
                className="rp-close"
                aria-label="Close"
                onClick={closeResetModal}
              >
                ×
              </button>
            </div>

            <hr className="rp-divider" />

            <div className="rp-body">
              {/* TOP BANNER (like Policy ID) */}
              {resetError && (
                <div className="alert alert-error" role="alert" aria-live="assertive">
                  <strong>Error</strong>
                  <span id="reset-error-text">{resetError}</span>
                </div>
              )}

              <label className="rp-label">
                Email Address <span className="rp-star">*</span>
              </label>

              <input
                type="email"
                className="rp-input"
                placeholder="you@gmail.com"
                value={resetEmail}
                onChange={(e) => {
                  // optional: clear banner while typing
                  // setResetError("");
                  setResetEmail(e.target.value);
                }}
                aria-describedby={resetError ? "reset-error-text" : undefined}
                required
              />

              <div className="rp-actions">
                <button
                  type="button"
                  className="rp-btn"
                  onClick={handleSendResetEmail}
                  disabled={resetLoading || !resetEmail}
                >
                  {resetLoading ? "Sending..." : "Send reset link"}
                </button>
              </div>

              {/* (Optional) remove the old bottom messages to avoid duplicates */}
              {/* {resetError && <p className="rp-msg rp-error">{resetError}</p>} */}
              {resetSuccess && <p className="rp-msg rp-success">{resetSuccess}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
