import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Added to handle navigation after login

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // For registration
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between Login and Register
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage("Please provide both username and password.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
      setMessage(response.data.message); // Show success message
      navigate("/dashboard"); // Redirect to the dashboard after successful login
    } catch (error) {
      setMessage(error.response?.data?.error || "An error occurred. Please try again.");
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !email) {
      setMessage("Please provide username, email, and password.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        username,
        email,
        password,
      });
      setMessage(response.data.message); // Show success message
      setIsRegistering(false); // Switch to login after registration
    } catch (error) {
      setMessage(error.response?.data?.error || "An error occurred. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Personal Finance Tracker</h1>
      {isRegistering ? (
        <div>
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ margin: "5px", padding: "10px" }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ margin: "5px", padding: "10px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ margin: "5px", padding: "10px" }}
          />
          <button onClick={handleRegister} style={{ margin: "5px", padding: "10px" }}>
            Register
          </button>
          <p style={{ color: "blue", cursor: "pointer" }} onClick={() => setIsRegistering(false)}>
            Already have an account? Login
          </p>
        </div>
      ) : (
        <div>
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ margin: "5px", padding: "10px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ margin: "5px", padding: "10px" }}
          />
          <button onClick={handleLogin} style={{ margin: "5px", padding: "10px" }}>
            Login
          </button>
          <p style={{ color: "blue", cursor: "pointer" }} onClick={() => setIsRegistering(true)}>
            Don't have an account? Register
          </p>
        </div>
      )}

      {message && (
        <p
          style={{
            color: message.includes("error") ? "red" : "green",
            marginTop: "20px",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Login;
