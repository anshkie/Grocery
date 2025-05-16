import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, UserCog } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const goToCustomer = () => {
    localStorage.setItem("userRole", "customer");
    navigate("/customer");
  };

  const goToEmployeeLogin = () => {
    navigate("/employee-login");
  };

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url(../assets/store.jpg)" }}
    >
      {/* Blurry Overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-70 backdrop-blur-xl"></div>

      {/* Content */}
      <div className="relative text-center text-gray-900 px-6">
        <h1 className="text-5xl font-bold">
          Make Healthy Life with{" "}
          <span className="text-green-500">Fresh Grocery</span>
        </h1>
        <p className="mt-4 text-lg max-w-lg mx-auto">
          Get the best quality and most delicious grocery food. Shop now to
          enjoy fresh & organic products!
        </p>

        {/* Buttons */}
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <button
            onClick={goToCustomer}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" /> Shop Now
          </button>

          <button
            onClick={goToEmployeeLogin}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md flex items-center gap-2"
          >
            <UserCog className="w-5 h-5" /> Employee Login
          </button>
        </div>
      </div>
    </div>
  );
}
