import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TotalExpensePage = () => {
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const fetchTotalExpense = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/expense/total');
        setTotalExpense(response.data.total_expense);
      } catch (error) {
        console.error('Error fetching total expense:', error);
      }
    };

    fetchTotalExpense();
  }, []);

  return (
    <div>
      <h2>Total Expense</h2>
      <p>${totalExpense}</p>
    </div>
  );
};

export default TotalExpensePage;
