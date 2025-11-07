import "./styles/sign-in-styles.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signUpClient } from "./Actions/SignUpActions";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { db } from "./dbServer"; // Supabase client

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpForm() {
  const navigate = useNavigate();

  // form values
  const [policyId, setPolicyId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // visibility toggles
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setPasswordVisible((v) => !v);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible((v) => !v);

  // top banner (same as your original `message`)
  const [message, setMessage] = useState({ text: "", type: "error" });

  // mark input red when it's been touched and has an error
  const isInvalid = (name) => touched[name] && !!errors[name];

  // inline errors + touched (CreateQuote-style)
  const [errors, setErrors] = useState({
    policyId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    policyId: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);

  // ---------- validators ----------
  const validateField = (name, value, ctx = {}) => {
    switch (name) {
      case "policyId":
        if (!value?.trim()) return "Policy ID is required";
        return "";
      case "email":
        if (!value?.trim()) return "Email is required";
        if (!EMAIL_REGEX.test(value.trim())) return "Enter a valid email address";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters long";
        return "";
      case "confirmPassword":
        if (!value) return "Confirm password is required";
        if (value !== ctx.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const validateAll = () => {
    const nextErrors = {
      policyId: validateField("policyId", policyId),
      email: validateField("email", email),
      password: validateField("password", password),
      confirmPassword: validateField("confirmPassword", confirmPassword, { password }),
    };
    setErrors(nextErrors);
    setTouched({ policyId: true, email: true, password: true, confirmPassword: true });
    return Object.values(nextErrors).every((e) => !e);
  };

  // change + blur handlers (live-validate once touched)
  const handleChange = (name, value) => {
    if (name === "policyId") setPolicyId(value);
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, {
          password: name === "password" ? value : password,
        }),
      }));
    }
  };

  const handleBlur = (name, value) => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, { password }),
    }));
  };

  // ---------- submit ----------
  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "error" }); // reset banner

    // Per-field checks (inline messages, CreateQuote-style)
    if (!validateAll()) return;

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

  
    if (!result?.success) {
      if (result?.requiresVerification) {
        setMessage({ text: "Please verify your email. We are resending the link now...", type: "info" });

        const { error: resendError } = await db.auth.resend({
          type: "signup",
          email: email,
        });

        if (resendError) {
          setMessage({ text: `Could not resend link: ${resendError.message}`, type: "error" });
        } else {
          setMessage({
            text: "We've just sent you a new confirmation link. Please check your inbox and spam folder.",
            type: "info",
          });
        }
      } else {
        setMessage({
          text: "Sign up failed: " + (result.message || result.error || "Unknown error"),
          type: "error",
        });
      }
      return;
    }

    // success → go to login
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

        <form className="SignIn-form" onSubmit={handleSignUp} noValidate>
          {/* Top banner (error/info) */}
          {message.text && (
            <div
              className={message.type === "error" ? "error-message" : "info-message"}
              role="alert"
              aria-live="assertive"
            >
              {message.text}
            </div>
          )}

          {/* Policy ID */}
          <label className={isInvalid("policyId") ? "field-label invalid" : "field-label"}>
            Policy ID <span className="required-star">*</span>
          </label>
          <input
            type="text"
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value.replace(/\s/g, ''))}
            required
          />
          {touched.policyId && errors.policyId && (
            <small id="policyId-error" className="inline-error">{errors.policyId}</small>
          )}

          {/* Email */}
          <label className={isInvalid("email") ? "field-label invalid" : "field-label"}>
            Email <span className="required-star">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
            required
          />
          {touched.email && errors.email && (
            <small id="email-error" className="inline-error">{errors.email}</small>
          )}

          {/* Password */}
          <div className="password-wrapper-client">
            <label className={isInvalid("password") ? "field-label invalid" : "field-label"}>
              Password <span className="required-star">*</span>
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
              required
            />
            <span
              className="eye-icon-client"
              onClick={() => setPasswordVisible((v) => !v)}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="password-wrapper-client">
            <label className={isInvalid("confirmPassword") ? "field-label invalid" : "field-label"}>
              Confirm password <span className="required-star">*</span>
            </label>
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ''))}
              required
            />
            <span
              className="eye-icon-client"
              onClick={() => setConfirmPasswordVisible((v) => !v)}
              aria-label={confirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
            >
              {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <small id="confirmPassword-error" className="inline-error">
              {errors.confirmPassword}
            </small>
          )}

          {/* Terms */}
          <div className="terms-container">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label htmlFor="terms" className="terms-text">
              I've read and agree to Silverstar <a href="#">Terms of service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <div className="login-prompt">
            <p>
              Already have an account? <a href="/insurance-client-page/login">Log in</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
