import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Administrator");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    if (password !== "admin123") {
      setError("Invalid password. Use the demo password.");
      return;
    }

    const user = {
      username,
      role,
    };

    localStorage.setItem("user", JSON.stringify(user));

    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">AV</div>

        <h1>AcquiVision</h1>

        <p className="login-subtitle">
          Land Acquisition Risk Monitor
        </p>

        <form onSubmit={handleLogin}>
          <div className="login-field">
            <label>Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label>Role</label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Administrator">
                Administrator
              </option>

              <option value="Risk Manager">
                Risk Manager
              </option>

              <option value="Analyst">
                Analyst
              </option>
            </select>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>
        </form>

        <div className="demo-login">
          <strong>Demo Login</strong>

          <span>
            Password: admin123
          </span>

          <span>
            Select any role to test access.
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;