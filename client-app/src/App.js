import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import ExpenseIncomeForm from "./components/ExpenseIncomeForm";
import Dashboard from "./components/Dashboard";
import ChartPage from "./components/ChartPage";
import BotpressChat from "./components/BotpressChat";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faMoon, faSun } from "@fortawesome/free-solid-svg-icons"; // Added icons
import "./App.css";

// Reusable Message Component
const Message = ({ message }) =>
  message && (
    <p
      style={{
        color: message.toLowerCase().includes("error") ? "red" : "green",
      }}
    >
      {message}
    </p>
  );

// LoginPage Component
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
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
      setMessage(response.data.message);
      localStorage.setItem("authToken", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.error || "An error occurred. Please try again."
      );
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
      setMessage(response.data.message);
      setIsRegistering(false);
    } catch (error) {
      setMessage(
        error.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="container">
      <h1>Personal Finance Tracker</h1>
      <div className="login-register-box">
        {isRegistering ? (
          <RegisterForm
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onRegister={handleRegister}
            toggleForm={() => setIsRegistering(false)}
          />
        ) : (
          <LoginForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            onLogin={handleLogin}
            toggleForm={() => setIsRegistering(true)}
          />
        )}
        <Message message={message} />
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm = ({
  username,
  setUsername,
  password,
  setPassword,
  onLogin,
  toggleForm,
}) => (
  <div className="form-container">
    <h2>Login</h2>
    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <button onClick={onLogin}>Login</button>
    <p onClick={toggleForm} className="toggle-link">
      Don't have an account? <span>Register</span>
    </p>
  </div>
);

// Register Form Component
const RegisterForm = ({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  onRegister,
  toggleForm,
}) => (
  <div className="form-container">
    <h2>Register</h2>
    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <button onClick={onRegister}>Register</button>
    <p onClick={toggleForm} className="toggle-link">
      Already have an account? <span>Login</span>
    </p>
  </div>
);

// Income and Expense Pages
const IncomePage = () => <ExpenseIncomePage type="income" />;
const ExpensePage = () => <ExpenseIncomePage type="expense" />;

const ExpenseIncomePage = ({ type }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/categories/${type}`
        );
        setCategories(response.data);
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching ${type} categories:`, error);
        setLoading(false);
      }
    };
    fetchCategories();
  }, [type]);

  return (
    <div>
      <h2>Log {type === "income" ? "Income" : "Expense"}</h2>
      {loading ? (
        <p>Loading {type} categories...</p>
      ) : (
        <ExpenseIncomeForm type={type} categories={categories} />
      )}
    </div>
  );
};

// Define Placeholder Components
const TotalIncomePage = () => <div>Total Income Page</div>;
const TotalExpensePage = () => <div>Total Expense Page</div>;
const IncomeVsExpensePage = () => <div>Income vs Expense Page</div>;

// App Component with Dark Mode Toggle
const App = () => {
  const location = useLocation();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleChatbot = () => setIsChatbotOpen(!isChatbotOpen);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark-mode", !isDarkMode);
    localStorage.setItem("darkMode", !isDarkMode);
  };

  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") {
      setIsDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  

  const isLoginPage = location.pathname === "/";

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/log-income" element={<IncomePage />} />
        <Route path="/log-expense" element={<ExpensePage />} />
        <Route path="/charts" element={<ChartPage />} />
        <Route path="/total-income" element={<TotalIncomePage />} />
        <Route path="/total-expense" element={<TotalExpensePage />} />
        <Route path="/income-vs-expense" element={<IncomeVsExpensePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {!isLoginPage && (
        <>
          <button className="financy-toggle" onClick={toggleChatbot}>
            <FontAwesomeIcon icon={faRobot} className="financy-icon" />
            <span>Financy</span>
          </button>
          {isChatbotOpen && <BotpressChat />}
        </>
      )}

      <button className="dark-mode-toggle" onClick={toggleDarkMode}>
        <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
      </button>
    </div>
  );
};

const Root = () => (
  <Router>
    <App />
  </Router>
);

export default Root;
