import "./styles/sign-in-styles.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInClient } from "./Actions/SignInActions";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export function SignInForm() {
  const navigate = useNavigate();
  const [policyId, setPolicyId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // reset error

    // Validation
    if (!policyId || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("You must agree to the Terms and Conditions before signing up.");
      return;
    }

    setLoading(true);
    const result = await signInClient({
      policyInternalId: policyId,
      email,
      password,
    });
    setLoading(false);

    if (!result.success) {
      setErrorMessage("Sign In failed: " + result.error);
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

        <form className="SignIn-form" onSubmit={handleSignIn}>
          {errorMessage && <div className="error-message">{errorMessage}</div>}

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
            <label>Change password <span className="required-star">*</span></label>
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
