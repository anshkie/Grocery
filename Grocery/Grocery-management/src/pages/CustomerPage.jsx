import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "../components/CustomerContext";

export default function CustomerPage() {
    const customerContext = useCustomer() || {};
    const { customerId,setCustomerId } = customerContext;
    const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    CustomerName: "",
    ContactEmail: "",
    ContactPhone: "",
    Address: "",
  });

//   const fetchCustomers = async () => {
//     const res = await axios.get("http://localhost:5000/customers");
//     setCustomers(res.data);
//   };

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post("https://grocery-k9j1.onrender.com/customers/add", formData);
    alert(response.data.message);  // Show success message
    const customerID = response.data.CustomerID;
setCustomerId(customerID);
localStorage.setItem("customerId", customerID); // ✅ Corrected
 // Store customer name
    setFormData({ CustomerName: "", ContactEmail: "", ContactPhone: "", Address: "" });
    navigate("/categories")
    // fetchCustomers(); // Uncomment if you want to refresh list
  } catch (error) {
    alert("Error adding customer: " + (error.response?.data?.detail || error.message));
  }
};


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Customer Management</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input name="CustomerName" value={formData.CustomerName} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input name="ContactEmail" value={formData.ContactEmail} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Phone</label>
          <input name="ContactPhone" value={formData.ContactPhone} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Address</label>
          <textarea name="Address" value={formData.Address} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3"></textarea>
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Customer
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Customer List</h2>
      <ul className="space-y-2">
        {customers.map((cust) => (
          <li key={cust.CustomerID} className="p-4 border rounded shadow">
            <p><strong>Name:</strong> {cust.CustomerName}</p>
            <p><strong>Email:</strong> {cust.ContactEmail}</p>
            <p><strong>Phone:</strong> {cust.ContactPhone}</p>
            <p><strong>Address:</strong> {cust.Address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
