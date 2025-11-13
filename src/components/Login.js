import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      login({ username, password });
      navigate("/fetch");
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-left">
          <h2>Login</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
        <div className="login-right">
          <img
            src="https://smartsols.org/wp-content/uploads/2023/11/cropped-Smart-Solution-Logo-2-120x91.png"
            alt="Smart Solutions Logo"
            className="illustration"
          />
          <h1 className="logo-text">SMART SOLUTIONS ORG.</h1>
        </div>
      </div>
    </div>
  );
}

export default Login;