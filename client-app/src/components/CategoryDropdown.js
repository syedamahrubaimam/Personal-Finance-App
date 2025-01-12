import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryDropdown = ({ onSelectCategory, selectedCategory }) => {
  const [categories, setCategories] = useState([]);

  // Fetch categories when the component mounts
  useEffect(() => {
    // Fetch categories from Flask API
    axios.get('http://localhost:5000/api/categories')
      .then(response => {
        setCategories(response.data); // Store the categories in the state
      })
      .catch(error => {
        console.error("There was an error fetching categories:", error);
      });
  }, []);

  return (
    <select onChange={(e) => onSelectCategory(e.target.value)} value={selectedCategory}>
      <option value="">Select a Category</option>
      {categories.map((category, index) => (
        <option key={index} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
};

export default CategoryDropdown;
