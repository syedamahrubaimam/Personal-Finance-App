import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IncomeVsExpensePage = () => {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  useEffect(() => {
    const fetchIncomeExpenseData = async () => {
      try {
        const [incomeResponse, expenseResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/income/total'),
          axios.get('http://localhost:5000/api/expense/total'),
        ]);

        setIncome(incomeResponse.data.total_income);
        setExpense(expenseResponse.data.total_expense);
      } catch (error) {
        console.error('Error fetching income vs expense data:', error);
      }
    };

    fetchIncomeExpenseData();
  }, []);

  return (
    <div>
      <h2>Income vs Expense</h2>
      <p>Income: ${income}</p>
      <p>Expense: ${expense}</p>
    </div>
  );
};

export default IncomeVsExpensePage;
