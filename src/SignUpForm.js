import "./styles/sign-in-styles.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signUpClient } from "./Actions/SignUpActions";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { db } from "./dbServer";

export function SignUpForm() {
  const navigate = useNavigate();
  const [policyId, setPolicyId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [message, setMessage] = useState({ text: "", type: "error" });
  
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

  const handleResendEmail = async () => {
    setResendLoading(true);
    setMessage({ text: "Resending verification email...", type: "info" });

    const redirectUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3000/insurance-client-page/email-verified'
      : 'https://insurance-client-page.vercel.app/insurance-client-page/email-verified';

    const { error: resendError } = await db.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    setResendLoading(false);

    if (resendError) {
      setMessage({ text: `Could not resend link: ${resendError.message}`, type: "error" });
    } else {
      setMessage({ 
        text: "Verification email resent! Please check your inbox and spam folder.", 
        type: "success" 
      });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "error" });

    // Validation
    if (!policyId || !email || !password || !confirmPassword) {
      setMessage({ text: "Please fill in all required fields.", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match!", type: "error" });
      return;
    }

    if (password.length < 8) {
      setMessage({ text: "Password must be at least 8 characters long.", type: "error" });
      return;
    }

    if (!agreeTerms) {
      setMessage({ text: "You must agree to the Terms and Conditions.", type: "error" });
      return;
    }

    setLoading(true);
    const result = await signUpClient({
      policyInternalId: policyId,
      email,
      password,
    });
    setLoading(false);

    if (!result.success) {
      // Check for the special verification error
      if (result.requiresVerification) {
        // DON'T resend immediately - the edge function already sent the email!
        // Just show success message and enable resend button
        setMessage({ 
          text: "Account created! Please check your email to verify your account before signing in. Check your spam folder if you don't see it.", 
          type: "success" 
        });
        setShowResendButton(true); // Show the resend button
      } else {
        // This is a real sign-up error (e.g., "Invalid Policy ID")
        setMessage({ 
          text: "Sign up failed: " + (result.message || result.error || "Unknown error"), 
          type: "error" 
        });
      }
      return;
    }

    // Success message (this probably won't be reached since edge function returns requiresVerification)
    setMessage({ 
      text: "Account created! Please check your email to verify your account.", 
      type: "success" 
    });
    setShowResendButton(true);
  };

  return (
    <div className="SignIn-page">
      <div className="SignIn-box">
        <div className="SignIn-header">
          <div className="header-SignIn-left">
            <h2>Create Your Account</h2>
            <p>Welcome to Silverstar Insurance Inc.</p>
          </div>
          <img
            className="header-SignIn-logo"
            src={require("./images/logo_.png")}
            alt="silverstar_insurance_inc_Logo"
          />
        </div>

        <form className="SignIn-form" onSubmit={handleSignUp}>
          
          {message.text && (
            <div className={
              message.type === 'error' ? 'error-message' : 
              message.type === 'success' ? 'success-message' : 
              'info-message'
            }>
              {message.text}
              {showResendButton && (
                <button 
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid #7c3aed',
                    color: '#7c3aed',
                    borderRadius: '6px',
                    cursor: resendLoading ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          )}

          <label>Policy ID <span className="required-star">*</span></label>
          <input
            type="text"
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
            required
          />

          <label>Email <span className="required-star">*</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper-client">
            <label>Password <span className="required-star">*</span></label>
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span onClick={togglePasswordVisibility} className="eye-icon-client">
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="password-wrapper-client">
            <label>Confirm password <span className="required-star">*</span></label>
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span onClick={toggleConfirmPasswordVisibility} className="eye-icon-client">
              {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="terms-container">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label htmlFor="terms" className="terms-text">
              I've read and agree to Silverstar <a href="/insurance-client-page/TermsAndConditions">Terms of service</a> and <a href="/insurance-client-page/PrivacyPolicy">Privacy Policy</a>.
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>

          <div className="login-prompt">
            <p>Already have an account? <a href="/insurance-client-page/login">Log in</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}