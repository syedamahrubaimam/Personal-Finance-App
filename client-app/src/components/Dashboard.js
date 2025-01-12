import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Custom styles for the dashboard

const Dashboard = () => {
  const navigate = useNavigate();

  // States for managing data and UI
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch data for total income and expenses
        const [
          totalIncomeResponse,
          totalExpensesResponse,
        ] = await Promise.all([
          fetch("http://localhost:5000/api/income/total"),
          fetch("http://localhost:5000/api/expense/total"),
        ]);

        // Handle response errors
        if (
          !totalIncomeResponse.ok ||
          !totalExpensesResponse.ok
        ) {
          throw new Error("Failed to fetch some data.");
        }

        // Parse responses
        const totalIncomeData = await totalIncomeResponse.json();
        const totalExpensesData = await totalExpensesResponse.json();

        // Check for correct data structure and set state
        setTotalIncome(totalIncomeData.total_income || 0);  // Ensure it's total_income
        setTotalExpenses(totalExpensesData.total_expense || 0);  // Ensure it's total_expenses

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("There was an error fetching data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-box">
        <h1>Welcome to Your Dashboard</h1>
        <h2>Choose an Option</h2>
        <div className="dashboard-actions">
          <button onClick={() => navigate("/log-income")} className="btn-action">
            Log Income
          </button>
          <button onClick={() => navigate("/log-expense")} className="btn-action">
            Log Expense
          </button>
          <button onClick={() => navigate("/charts")} className="btn-action">
            View Charts
          </button>
        </div>
      </div>

      {/* Total Income and Expenses Section */}
      <div className="totals-container">
        <div className="total-box">
          <h3>Total Income</h3>
          <p>${totalIncome}</p>
        </div>
        <div className="total-box">
          <h3>Total Expenses</h3>
          <p>${totalExpenses}</p>
        </div>
      </div>

      {/* Error handling */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Dashboard;
