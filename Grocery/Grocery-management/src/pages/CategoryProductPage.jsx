import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useCustomer } from '../components/CustomerContext'; // Adjust the import path as 
function CategoryProductPage() {
  // const id = localStorage.getItem("customerId");
  const {id} = useParams();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  // Replace with actual logged-in customer ID
  const customerId = localStorage.getItem("customerId");

  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      console.log({ customer_id: customerId, product_id: productId, quantity });
      const response = await axios.post("https://grocery-k9j1.onrender.com/cart/add", {
        customer_id: parseInt(customerId),
        product_id: productId,
        quantity: quantity,
      });
      setMessage("Added to cart!");
    } catch (error) {
      console.error(error);
      setMessage("Failed to add to cart.");
    }
  };

  useEffect(() => {
    axios.get(`https://grocery-k9j1.onrender.com/categories/${id}/products`)
      .then(res => {
        setProducts(Array.isArray(res.data.products) ? res.data.products : []);
      })
      .catch(err => console.error(err));
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.ProductID} className="p-4 border rounded shadow">
            <h2 className="font-bold text-lg">{product.ProductName}</h2>
            <p>Price: ${product.UnitPrice}</p>
            <p>Stock: {product.UnitsInStock}</p>
            <button
              onClick={() => handleAddToCart(product.ProductID)}
              className="mt-2 px-4 py-1 bg-green-500 text-white rounded"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


export default CategoryProductPage;
