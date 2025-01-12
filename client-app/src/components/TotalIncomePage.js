import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TotalIncomePage = () => {
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    const fetchTotalIncome = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/income/total');
        setTotalIncome(response.data.total_income);
      } catch (error) {
        console.error('Error fetching total income:', error);
      }
    };

    fetchTotalIncome();
  }, []);

  return (
    <div>
      <h2>Total Income</h2>
      <p>${totalIncome}</p>
    </div>
  );
};

export default TotalIncomePage;
