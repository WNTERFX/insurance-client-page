import "./styles/login-styles.css";
import logo from "./images/logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginClient } from "./Actions/LoginActions"; 

export default function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await loginClient({ email, password });
    setLoading(false);

    if (!result.success) {
      alert("Login failed: " + result.error);
      return;
    }

    console.log("Logged in client:", result.user);


    navigate("/appinsurance/login/MainArea");
  };

  return (
    <div className="login-container">
      <div className="container">
        <div className="login-card">
          <div className="logo-panel">
            <img src={logo} alt="silverstar_insurance_inc_Logo" />
          </div>
          <div className="right-panel">
            <h2>Log In to your account</h2>
            <form onSubmit={handleLogin}>
              <label>Email</label>
              <input
                type="email"
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

              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
