import "./styles/login-styles.css";
import logo from "./images/logo.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { loginClient } from "./Actions/LoginActions";
import { db } from "./dbServer"; // Supabase client
import "./images/logo_.png"

import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Password reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

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

    navigate("/insurance-client-page/main-portal/home");
  };

  // Send password reset email
  const handleSendResetEmail = async () => {
    setResetLoading(true);
    setResetError("");
    setResetSuccess("");

    // Validate email format
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError("Please enter a valid email address");
      setResetLoading(false);
      return;
    }

    // Construct the redirect URL
    const redirectUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/insurance-client-page/reset-password'
      : 'https://insurance-client-page.vercel.app/insurance-client-page/reset-password';

    console.log("Sending reset email to:", resetEmail);
    console.log("Redirect URL:", redirectUrl);

    try {
      const { data, error } = await db.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // Success - even if email doesn't exist, Supabase returns success for security
      setResetSuccess("If an account exists with this email, you'll receive a password reset link shortly.");
      
    } catch (error) {
      console.error("Caught error:", error);
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
    <div className="login-page">
      <div className="login-box">
        <div className="login-header">
          <div className="header-left">
            <h2>LOGIN</h2>
            <p>Welcome to Silverstar Insurance Inc.</p>
          </div>
          <img className="header-logo" src={require("./images/logo_.png")} alt="silverstar_insurance_inc_Logo" />
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span onClick={togglePassword} className="eye-icon">
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <a href="#" className="forgot-password-client" onClick={(e) => {
            e.preventDefault();
            setShowResetModal(true);
          }}>
            Forgot password?
          </a>
          <button type="submit" className="login-button-client">Login</button>

          {/* Login Controls */}
          <div className="login-controls">
            <p>Don't have an account?</p>
            <a href="/insurance-client-page/signup" type="button" >
              Sign Up
            </a>
          </div>
        </form>
      </div>

      {/* Password Reset Modal */}
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
              {/* Error Banner */}
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

              {resetSuccess && <p className="rp-msg rp-success">{resetSuccess}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}