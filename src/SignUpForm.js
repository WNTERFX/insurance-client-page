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

  // Field error states
  const [fieldErrors, setFieldErrors] = useState({
    policyId: false,
    email: false,
    password: false,
    confirmPassword: false,
    terms: false
  });

  // Field-specific error messages
  const [fieldErrorMessages, setFieldErrorMessages] = useState({
    policyId: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: ""
  });

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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop the event from bubbling
    
    setMessage({ text: "", type: "error" });

    // Reset all field errors
    const errors = {
      policyId: false,
      email: false,
      password: false,
      confirmPassword: false,
      terms: false
    };

    const errorMessages = {
      policyId: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: ""
    };

    let hasErrors = false;

    // Validate Policy ID
    if (!policyId.trim()) {
      errors.policyId = true;
      errorMessages.policyId = "Policy ID is required";
      hasErrors = true;
    }

    // Validate Email
    if (!email.trim()) {
      errors.email = true;
      errorMessages.email = "Email is required";
      hasErrors = true;
    } else if (!validateEmail(email)) {
      errors.email = true;
      errorMessages.email = "Please enter a valid email address";
      hasErrors = true;
    }

    // Validate Password
    if (!password) {
      errors.password = true;
      errorMessages.password = "Password is required";
      hasErrors = true;
    } else if (password.length < 8) {
      errors.password = true;
      errorMessages.password = "Password must be at least 8 characters long";
      hasErrors = true;
    }

    // Validate Confirm Password
    if (!confirmPassword) {
      errors.confirmPassword = true;
      errorMessages.confirmPassword = "Please confirm your password";
      hasErrors = true;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = true;
      errorMessages.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }

    // Validate Terms
    if (!agreeTerms) {
      errors.terms = true;
      errorMessages.terms = "You must agree to the Terms and Conditions";
      hasErrors = true;
    }

    setFieldErrors(errors);
    setFieldErrorMessages(errorMessages);

    if (hasErrors) {
      setMessage({ text: "Please fill in all required fields correctly.", type: "error" });
      return false; // Explicitly return false to prevent submission
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
        setMessage({ 
          text: "Account created! Please check your email to verify your account before signing in. Check your spam folder if you don't see it.", 
          type: "success" 
        });
        setShowResendButton(true);
      } else {
        // This is a real sign-up error (e.g., "Invalid Policy ID")
        setMessage({ 
          text: "Sign up failed: " + (result.message || result.error || "Unknown error"), 
          type: "error" 
        });
      }
      return false;
    }

    // Success message
    setMessage({ 
      text: "Account created! Please check your email to verify your account.", 
      type: "success" 
    });
    setShowResendButton(true);
    return false;
  };

  const clearFieldError = (field) => {
    setFieldErrors(prev => ({ ...prev, [field]: false }));
    setFieldErrorMessages(prev => ({ ...prev, [field]: "" }));
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

        <form className="SignIn-form" onSubmit={handleSignUp} noValidate>
          
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
            onChange={(e) => {
              setPolicyId(e.target.value);
              clearFieldError('policyId');
            }}
            className={fieldErrors.policyId ? 'input-error' : ''}
          />
          {fieldErrorMessages.policyId && (
            <span className="field-error">{fieldErrorMessages.policyId}</span>
          )}

          <label>Email <span className="required-star">*</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError('email');
            }}
            className={fieldErrors.email ? 'input-error' : ''}
          />
          {fieldErrorMessages.email && (
            <span className="field-error">{fieldErrorMessages.email}</span>
          )}

          <label>Password <span className="required-star">*</span></label>
          <div className="password-wrapper-client">
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError('password');
              }}
              className={fieldErrors.password ? 'input-error' : ''}
            />
            <span onClick={togglePasswordVisibility} className="eye-icon-client">
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {fieldErrorMessages.password && (
            <span className="field-error">{fieldErrorMessages.password}</span>
          )}

          <label>Confirm password <span className="required-star">*</span></label>
          <div className="password-wrapper-client">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearFieldError('confirmPassword');
              }}
              className={fieldErrors.confirmPassword ? 'input-error' : ''}
            />
            <span onClick={toggleConfirmPasswordVisibility} className="eye-icon-client">
              {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {fieldErrorMessages.confirmPassword && (
            <span className="field-error">{fieldErrorMessages.confirmPassword}</span>
          )}

          <div className={`terms-container ${fieldErrors.terms ? 'terms-error' : ''}`}>
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                clearFieldError('terms');
              }}
            />
            <label htmlFor="terms" className="terms-text">
              I've read and agree to Silverstar <a href="/insurance-client-page/TermsAndConditions" target="_blank" rel="noopener noreferrer">Terms and Condition</a> and <a href="/insurance-client-page/PrivacyPolicy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
            </label>
          </div>
          {fieldErrorMessages.terms && (
            <span className="field-error">{fieldErrorMessages.terms}</span>
          )}

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