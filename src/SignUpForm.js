import "./styles/sign-in-styles.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signUpClient } from "./Actions/SignUpActions";
import { FaEye, FaEyeSlash } from "react-icons/fa";
// [!code focus]
import { db } from "./dbServer"; // 1. Import your Supabase client

export function SignUpForm() {
  const navigate = useNavigate();
  const [policyId, setPolicyId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // [!code focus:3]
  // 2. Replace errorMessage with a new 'message' state
  const [message, setMessage] = useState({ text: "", type: "error" });
  
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

  const handleSignUp = async (e) => {
    e.preventDefault();
    // [!code focus]
    setMessage({ text: "", type: "error" }); // reset message

    // [!code focus:17]
    // 3. Update all validation to use the new message state
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

    // [!code focus:25]
    // 4. THIS IS THE MAIN FIX
    if (!result.success) {
      // Check for the special verification error
      if (result.requiresVerification) {
        
        // Show a loading message
        setMessage({ text: "Please verify your email. We are resending the link now...", type: "info" });
        
        // Call the client-side resend function
        const { error: resendError } = await db.auth.resend({
          type: 'signup',
          email: email
        });

        if (resendError) {
          setMessage({ text: `Could not resend link: ${resendError.message}`, type: "error" });
        } else {
          // Tell the user to check their spam folder!
          setMessage({ text: "We've just sent you a new confirmation link. Please check your inbox and spam folder.", type: "info" });
        }

      } else {
        // This is a real sign-in error (e.g., "Invalid Policy ID")
        setMessage({ text: "Sign In failed: " + (result.message || result.error || "Unknown error"), type: "error" });
      }
      return;
    }

    navigate("/insurance-client-page/login");
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
          
          {/* [!code focus:4] */}
          {/* 5. Update the JSX to show the new message state */}
          {message.text && (
            <div className={message.type === 'error' ? 'error-message' : 'info-message'}>
              {message.text}
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
            {/* This label seems wrong, it should be "Confirm password" */}
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
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="login-prompt">
            <p>Already have an account? <a href="/insurance-client-page/login">Log in</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}