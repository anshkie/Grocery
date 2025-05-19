import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
  const fetchCart = async () => {
    try {
      const response = await axios.get(`https://grocery-k9j1.onrender.com/cart/${id}`);
      setCartItems(response.data.cart);
      setOrderId(response.data.order_id);  // <-- Save it for later
      console.log(response.data.order_id)
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  fetchCart();
}, [id]); // Note: useParams provides `id`, not `customerId` directly

  const handlePlaceOrder = () => {
    if (orderId) {
      navigate(`/payment`);
    } else {
      alert("No order to place.");
    }
  };

  return (
    <div>
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.OrderDetailID}>
                  <td>{item.ProductName}</td>
                  <td>{item.Quantity}</td>
                  <td>${item.UnitPrice}</td>
                  <td>${item.TotalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handlePlaceOrder} style={{ marginTop: '20px' }}>
            ✅ Place Order
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
