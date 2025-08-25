import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../constants/constants";

const CategoryDropdown = ({ value, onChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(Array.isArray(res.data) ? res.data : []);
      console.log(res.data)
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <select
      className="w-full bg-white border border-gray-200 rounded-xl shadow-md p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select a category</option>
      {loading && <option disabled>Loading...</option>}
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id} title={cat.description}>
          {cat.name}
        </option>
      ))}
    </select>
  );
};

export default CategoryDropdown;
