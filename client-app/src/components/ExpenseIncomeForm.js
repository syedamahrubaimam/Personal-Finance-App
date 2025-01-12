import React, { useState, useEffect } from 'react';

const ExpenseIncomeForm = ({ type }) => {
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');  // Added date state
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/categories/${type}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        return response.json();
      })
      .then((data) => setCategories(data))
      .catch((error) => {
        console.error(error);
        setMessage('Failed to load categories.');
      });
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = `http://localhost:5000/api/${type === 'expense' ? 'expenses' : 'income'}`;
    const body = { category, amount, description, date };  // Added date to the body

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to add entry');
      }

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setMessage('Failed to add entry.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto mt-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700 text-center">
        {type === 'expense' ? 'Add Expense' : 'Add Income'}
      </h2>

      {/* Category */}
      <div className="mb-4">
        <label className="block text-gray-600">Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full p-3 mt-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label className="block text-gray-600">Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full p-3 mt-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-gray-600">Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 mt-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Date */}
      <div className="mb-6">
        <label className="block text-gray-600">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full p-3 mt-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition duration-300"
      >
        {type === 'expense' ? 'Add Expense' : 'Add Income'}
      </button>

      {/* Message */}
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </form>
  );
};

export default ExpenseIncomeForm;

