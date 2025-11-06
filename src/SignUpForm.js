import "./styles/sign-in-styles.css"; // You might want to rename this to sign-up-styles.css
import { useNavigate } from "react-router-dom";
import { useState } from "react";
// 1. RENAME: Import from your "Sign Up" action file
import { signUpClient } from "./Actions/SignUpActions"; 
import { FaEye, FaEyeSlash } from "react-icons/fa";
// 2. REMOVED: `db` client is no longer needed here

export function SignUpForm() {
  const navigate = useNavigate();
  const [policyId, setPolicyId] = useState("");
  const [email, setEmail] = useState("");
  // 3. ADDED: "Confirm Email" state
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [message, setMessage] = useState({ text: "", type: "error" });
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

  // 4. RENAME: handleSignUp
  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "error" }); 

    // --- Validation Checks ---
    if (!policyId || !email || !confirmEmail || !password || !confirmPassword) {
      setMessage({ text: "Please fill in all required fields.", type: "error" });
      return;
    }
    
    // 5. ADDED: "Confirm Email" check
    if (email !== confirmEmail) {
      setMessage({ text: "Emails do not match. Please check and try again.", type: "error" });
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
    // 6. RENAME: Call your "Sign Up" function
    const result = await signUpClient({
      policyInternalId: policyId,
      email,
      password,
    });
    setLoading(false);

    // 7. FIXED: This is the new, simpler logic
    if (!result.success) {
      // Check if it's the "Account Created" success message
      if (result.requiresVerification) {
        
        // JUST show the message from the Edge Function.
        // The email was already sent!
        setMessage({ 
          text: result.message, // "Account created successfully! Please check your email..."
          type: "info" // Use 'info' for success
        });
        
        // We do NOT navigate. The user should read this message.

      } else {
        // This is a REAL error (e.g., "Invalid Policy ID", "Account already exists")
        setMessage({ 
          text: "Sign Up failed: " + (result.message || result.error || "Unknown error"), 
          type: "error" 
        });
      }
      return;
    }
    
    // This line should technically not be reached if your function always
    // returns `requiresVerification`, but it's here as a fallback.
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

        {/* 8. RENAME: form handler */}
        <form className="SignIn-form" onSubmit={handleSignUp}>
          
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

          {/* 9. ADDED: "Confirm Email" field */}
          <label>Confirm Email <span className="required-star">*</span></label>
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
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
              I've read and agree to Silverstar <a href="#">Terms of service</a> and <a href="#">Privacy Policy</a>.
            </label>
          </div>

          {/* 10. RENAME: button text */}
          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="login-prompt">
            <p>Already have an account? <a href="/insurance-client-page/login">Log in</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}