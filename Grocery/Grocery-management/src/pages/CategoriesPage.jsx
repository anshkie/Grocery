// src/pages/CategoryPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useCustomer } from "../components/CustomerContext"; // Adjust the import path as necessary
function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const { customerId } = useCustomer();
  useEffect(() => {
    axios
      .get("https://grocery-k9j1.onrender.com/categories")
      .then((response) => {
        setCategories(response.data.categories);
        console.log("API response:", response.data.categories);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
          📚 Product Categories
        </h1>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <Link
              to={`/categories/${cat.CategoryID}/products`}
              key={cat.CategoryID}
              className="block"
            >
              <li
                className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {cat.CategoryName}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {cat.Description}
                </p>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CategoriesPage;
