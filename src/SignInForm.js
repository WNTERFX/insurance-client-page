import "./styles/sign-in-styles.css";
import logo from "./images/logo.png";
import "./images/logo_.png"
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
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
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
      alert("Sign In failed: " + result.error);
      return;
    }

    console.log("Signed in client:", result.user);
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
          <img className="header-SignIn-logo" src={require("./images/logo_.png")} alt="silverstar_insurance_inc_Logo" />
        </div>

        <form className="SignIn-form" onSubmit={handleSignIn}>
          <label>Policy ID</label>
          <input
            type="text"
            className="policy-id"
            placeholder="Enter your policy ID"
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            className="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper-client">
            <label>Password</label>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span onClick={togglePassword} className="eye-icon-client">
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="password-wrapper-client">
          <label>Confirm Password</label>
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
              <span onClick={togglePassword} className="eye-icon-client">
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <p className="terms-text">
            By clicking Sign Up, you agree to our
            <a href="#" onClick={(e) => { e.preventDefault(); navigate(""); }}> Terms</a>,
            <a href="#" onClick={(e) => { e.preventDefault(); navigate(""); }}> Privacy Policy</a>.
          </p>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="signin-controls">
            <p>Already have an account?</p>
            <a href="#"
              type="button"
              onClick={() => navigate("/insurance-client-page/login")}
            >
              Login
            </a>
          </div>
        </form>
      </div>


    </div>


  );
}