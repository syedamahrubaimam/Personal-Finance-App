import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const IncomeExpenseChart = ({ incomeData, expenseData }) => {
  if (!incomeData || !expenseData || !incomeData.months || !incomeData.values) {
    return <p style={{ textAlign: "center" }}>No income or expense data available.</p>;
  }

  const data = {
    labels: incomeData.months,
    datasets: [
      {
        label: "Income",
        data: incomeData.values,
        backgroundColor: "#4CAF50",
      },
      {
        label: "Expenses",
        data: expenseData.values || expenseData,
        backgroundColor: "#FF6384",
      },
    ],
  };

  return (
    <div style={{ width: "600px", margin: "20px auto" }}>
      <h2 style={{ textAlign: "center" }}>Monthly Income vs Expenses</h2>
      <Bar data={data} />
    </div>
  );
};

export default IncomeExpenseChart;
