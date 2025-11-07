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

    try {
      const { data, error } = await db.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + "/insurance-client-page/reset-password",
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
            onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
            required
          />

          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
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
            <p>Don’t have an account?</p>
            <a href="/insurance-client-page/signup" type="button" >
              Sign Up
            </a>
          </div>
        </form>
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

              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value.replace(/\s/g, ''))}
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
