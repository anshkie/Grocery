import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EmployeeOrderView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://grocery-k9j1.onrender.com/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (orderId) => {
    try {
      await axios.put(`https://grocery-k9j1.onrender.com/orders/${orderId}/complete`);
      fetchOrders(); // Refresh orders
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const calculateTotal = (details) => {
    return details.reduce((sum, item) => sum + item.Quantity * item.UnitPrice, 0);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Customer Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.OrderId}
              className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order #{order.OrderId}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {new Date(order.OrderDate).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.Status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.Status}
                </span>
              </div>

              <p className="font-medium text-gray-700 mb-2">
                Total Amount: ₹{calculateTotal(order.details).toFixed(2)}
              </p>

              <div className="mb-3">
                <h3 className="font-semibold mb-1 text-gray-800">Items:</h3>
                <ul className="list-disc ml-6 text-sm text-gray-700">
                  {order.details.map((item, idx) => (
                    <li key={idx}>
                      Product #{item.ProductId} — Qty: {item.Quantity} × ₹{item.UnitPrice} = ₹
                      {(item.Quantity * item.UnitPrice).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => markAsCompleted(order.OrderId)}
                disabled={order.Status === "Completed"}
                className={`mt-2 px-4 py-2 rounded-lg font-semibold transition ${
                  order.Status === "Completed"
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {order.Status === "Completed" ? "Already Completed" : "Mark as Completed"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
