import React, { useState } from "react";
import { Sun, Moon, ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const id = localStorage.getItem("customerId");
  const role = localStorage.getItem("userRole"); // 'customer' or 'employee'
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const goToCart = () => {
    if (id) navigate(`/cart/${id}`);
  };

  const isEmployee = role === "employee";

  return (
    <nav className={`p-4 shadow-md ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-green-500" />
          <button className="text-2xl font-bold" onClick={() => navigate("/")}>
            Grocery<span className="text-green-500">Manager</span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          <button onClick={goToCart} className="hover:text-green-500 transition">🛒 My Cart</button>
          <Link to="/" className="hover:text-green-500 transition">Dashboard</Link>
          {isEmployee && (
            <>
              <Link to="/employee-order-view" className="hover:text-green-500 transition">Orders</Link>
            
            </>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute right-2 top-2 w-5 h-5 text-gray-500" />
          </div>

          {/* Dark Mode Toggle */}
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
            {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-800" />}
          </button>

          {/* Profile */}
          <button className="p-2 border rounded-full hover:bg-gray-100" onClick={() => navigate("/profile")}>
            <User className="w-6 h-6" />
          </button>

          {/* Hamburger Menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 px-4">
          <button onClick={goToCart} className="text-left hover:text-green-500 transition">🛒 My Cart</button>
          <Link to="/" className="hover:text-green-500 transition">Dashboard</Link>
          {isEmployee && (
            <>
              <Link to="/employee-order-view" className="hover:text-green-500 transition">Orders</Link>
              
            </>
          )}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute right-2 top-2 w-5 h-5 text-gray-500" />
          </div>
        </div>
      )}
    </nav>
  );
}
