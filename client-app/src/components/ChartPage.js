import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ChartPage = () => {
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Fetch chart data based on the selected chart type and date range
  useEffect(() => {
    const fetchChartData = async (type, startDate, endDate) => {
      try {
        let url = "";
        if (type === "total-income") {
          url = `http://localhost:5000/api/income/summary?start_date=${startDate}&end_date=${endDate}`;
        } else if (type === "total-expense") {
          url = `http://localhost:5000/api/expenses/summary?start_date=${startDate}&end_date=${endDate}`;
        } else if (type === "income-vs-expense") {
          url = `http://localhost:5000/api/income/summary?start_date=${startDate}&end_date=${endDate}`;
        }

        const response = await axios.get(url);

        if (type === "income-vs-expense") {
          const incomeResponse = await axios.get(`http://localhost:5000/api/income/summary?start_date=${startDate}&end_date=${endDate}`);
          const expenseResponse = await axios.get(`http://localhost:5000/api/expenses/summary?start_date=${startDate}&end_date=${endDate}`);
          
          setChartData({
            totalIncome: incomeResponse.data.totalIncome,
            totalExpense: expenseResponse.data.totalExpense,
            incomeDetails: incomeResponse.data.incomeDetails,
            expenseDetails: expenseResponse.data.expenseDetails,
          });
        } else {
          setChartData(response.data);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    if (chartType) {
      fetchChartData(chartType, startDate, endDate);
    }
  }, [chartType, startDate, endDate]);

  const handleChartSelect = (type) => {
    setChartType(type);
  };

  if (!chartData) {
    return (
      <div>
        <h2>Select a Chart</h2>
        <button onClick={() => handleChartSelect("total-income")}>Total Income</button>
        <button onClick={() => handleChartSelect("total-expense")}>Total Expense</button>
        <button onClick={() => handleChartSelect("income-vs-expense")}>Income vs Expense</button>
      </div>
    );
  }

  // Chart Options for better styling
  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark background for tooltips
        titleColor: "#fff", // White tooltip title
        bodyColor: "#fff", // White tooltip body
        padding: 10, // Tooltip padding
        displayColors: false, // Remove color indicator next to tooltip
        cornerRadius: 5, // Rounded tooltip corners
      },
    },
    scales: {
      x: {
        grid: {
          borderColor: "#ddd", // Lighter grid lines
        },
        ticks: {
          font: {
            size: 14, // Bigger font size for readability
            family: "Arial, sans-serif",
            weight: "bold",
            color: "#333", // Darker ticks
          },
        },
      },
      y: {
        grid: {
          borderColor: "#ddd",
        },
        ticks: {
          font: {
            size: 14,
            family: "Arial, sans-serif",
            weight: "bold",
            color: "#333", 
          },
        },
      },
    },
  };

  return (
    <div style={{ padding: "30px", backgroundColor: "#f9f9f9", borderRadius: "8px", boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px", fontFamily: "Arial, sans-serif" }}>
        {chartType === "total-income"
          ? "Total Income"
          : chartType === "total-expense"
          ? "Total Expense"
          : "Income vs Expense"}
      </h2>

      <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginBottom: "30px" }}>
        <div>
          <label>Start Date: </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="date-picker"
          />
        </div>
        <div>
          <label>End Date: </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="date-picker"
          />
        </div>
      </div>

      {chartType === "total-income" || chartType === "total-expense" ? (
        <Pie
          data={{
            labels: chartType === "total-income" 
              ? chartData.incomeDetails.map(item => item.source) 
              : chartData.expenseDetails.map(item => item.category), 
            datasets: [
              {
                label: chartType === "total-income" ? "Income" : "Expense",
                data: chartType === "total-income" 
                  ? chartData.incomeDetails.map(item => item.amount) 
                  : chartData.expenseDetails.map(item => item.amount),
                backgroundColor: [
                  "rgba(0, 204, 255, 0.6)", // Light cyan for modern look
                  "rgba(255, 99, 132, 0.6)", // Red for variety
                  "rgba(54, 162, 235, 0.6)", // Blue for contrast
                  "rgba(255, 205, 86, 0.6)", // Yellow for brightness
                  "rgba(75, 192, 192, 0.6)", // Teal for freshness
                  "rgba(153, 102, 255, 0.6)", // Purple for elegance
                  "rgba(255, 159, 64, 0.6)", // Orange for energy
                ],
                borderWidth: 1,
                hoverOffset: 10, // Slightly raised sections on hover
              },
            ],
          }}
          options={chartOptions}
        />
      ) : chartType === "income-vs-expense" ? (
        <Doughnut
          data={{
            labels: ["Income", "Expense"],
            datasets: [
              {
                label: "Income vs Expense",
                data: [chartData.totalIncome, chartData.totalExpense],
                backgroundColor: [
                  "rgba(0, 204, 255, 0.8)", // Light cyan for modern look
                  "rgba(255, 99, 132, 0.8)", // Red for expense
                ],
                borderWidth: 3, // Slightly thicker border
                hoverOffset: 12, // Raised sections on hover
                hoverBackgroundColor: [
                  "rgba(0, 204, 255, 1)", // Hover effect color for income
                  "rgba(255, 99, 132, 1)", // Hover effect color for expense
                ],
                borderColor: "#fff", // White border for better contrast
                borderRadius: 35, // More rounded donut edges for smoothness
                shadowOffsetX: 4, // Added shadow offset for depth
                shadowOffsetY: 4, // Added shadow offset for depth
                shadowColor: "rgba(0, 0, 0, 0.15)", // Subtle shadow for depth
                shadowBlur: 12, // Soft shadow for smooth appearance
              },
            ],
          }}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: {
                position: "top", // Legend at the top of the chart
                labels: {
                  font: {
                    size: 16, // Larger font size for legend
                    weight: "bold", // Bold legend labels
                    family: "Arial, sans-serif", // Font family for the legend
                    color: "#333", // Dark legend text color
                  },
                },
              },
            },
          }}
        />
      ) : null}
    </div>
  );
};

export default ChartPage;
