import React from 'react';
import { useNavigate } from 'react-router-dom';
import './chartpage.css';

const FinancialChartsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="charts-container">
      <h1>Financial Charts</h1>
      <p>Select the chart you want to view:</p>
      <div className="charts-buttons">
        {/* Button for Total Income chart */}
        <button
          className="chart-btn"
          onClick={() => navigate('/charts/income')}
        >
          Total Income
        </button>

        {/* Button for Total Expense chart */}
        <button
          className="chart-btn"
          onClick={() => navigate('/charts/expense')}
        >
          Total Expense
        </button>

        {/* Button for Income vs Expense chart */}
        <button
          className="chart-btn"
          onClick={() => navigate('/charts/income-vs-expense')}
        >
          Income vs Expense
        </button>
      </div>
    </div>
  );
};

export default FinancialChartsPage;
