import "./styles/sign-in-styles.css";
import logo from "./images/logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInClient } from "./Actions/SignInActions";

export function SignInForm() {
  const navigate = useNavigate();
  const [policyId, setPolicyId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="signin-container">
      <div className="container">
        <div className="signin-card">
          <div className="logo-panel">
            <img src={logo} alt="silverstar_insurance_inc_Logo" />
          </div>
          <div className="right-panel">
            <h2>Create Your Account</h2>
            <form onSubmit={handleSignIn}>
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
              
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              
              <div className="signin-controls">
                <button type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/insurance-client-page/login")}
                >
                  Back to Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}