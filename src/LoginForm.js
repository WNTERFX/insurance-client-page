import "./styles/login-styles.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { loginClient } from "./Actions/LoginActions";
import { db } from "./dbServer";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Error states
  const [loginError, setLoginError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Invalid username or password");
  const [isAlreadyLoggedInError, setIsAlreadyLoggedInError] = useState(false);

  // Password reset modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  useEffect(() => {
    async function checkExistingSession() {
      try {
        const { data: { session }, error } = await db.auth.getSession();
        
        if (session && !error) {
          console.log("✅ User already logged in, redirecting to portal");
          navigate("/insurance-client-page/main-portal/Home", { replace: true });
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkExistingSession();
  }, [navigate]);

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setLoginError(false);
    setErrorMessage("Invalid username or password");
    setIsAlreadyLoggedInError(false);
    
    if (!email.trim() || !password.trim()) {
      setLoginError(true);
      return;
    }
    
    setLoading(true);
    const result = await loginClient({ email, password });
    setLoading(false);

    if (!result.success) {
      setLoginError(true);
      
      // ✅ Show specific error message for already logged in
      if (result.isAlreadyLoggedIn) {
        setErrorMessage(result.error);
        setIsAlreadyLoggedInError(true);
      } else {
        setErrorMessage("Invalid username or password");
        setIsAlreadyLoggedInError(false);
      }
      return;
    }

    navigate("/insurance-client-page/main-portal/Home");
  };

  const handleSendResetEmail = async () => {
    setResetLoading(true);
    setResetError("");
    setResetSuccess("");

    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError("Please enter a valid email address");
      setResetLoading(false);
      return;
    }

    const redirectUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/insurance-client-page/reset-password'
      : 'https://insurance-client-page.vercel.app/insurance-client-page/reset-password';

    try {
      const { data, error } = await db.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setResetSuccess("If an account exists with this email, you'll receive a password reset link shortly.");
    } catch (error) {
      setResetError(error.message || "Failed to send password reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail("");
    setResetError("");
    setResetSuccess("");
  };

  if (checkingAuth) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "'Montserrat', sans-serif"
      }}>
        Loading...
      </div>
    );
  }

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

        <form className="login-form" onSubmit={handleLogin} noValidate>
          {/* Error Banner */}
          {loginError && (
            <div className={`alert ${isAlreadyLoggedInError ? 'alert-warning' : 'alert-error'}`} role="alert" aria-live="assertive">
              <strong>{isAlreadyLoggedInError ? 'Already Logged In' : 'Wrong Credentials'}</strong>
              <span>{errorMessage}</span>
            </div>
          )}

          <label>Email Address</label>
          <input
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLoginError(false);
            }}
            autoComplete="email"
          />

          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLoginError(false);
              }}
              autoComplete="current-password"
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
          
          <button type="submit" className="login-button-client" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="login-controls">
            <p>Don't have an account?</p>
            <a href="/insurance-client-page/signup">Sign Up</a>
          </div>
        </form>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="rp-overlay" onClick={closeResetModal}>
          <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rp-header">
              <h3>Reset password</h3>
              <button type="button" className="rp-close" onClick={closeResetModal}>×</button>
            </div>
            <hr className="rp-divider" />
            <div className="rp-body">
              {resetError && (
                <div className="alert alert-error">
                  <strong>Error</strong>
                  <span>{resetError}</span>
                </div>
              )}
              <label className="rp-label">Email Address <span className="rp-star">*</span></label>
              <input
                type="email"
                className="rp-input"
                placeholder="you@gmail.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
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