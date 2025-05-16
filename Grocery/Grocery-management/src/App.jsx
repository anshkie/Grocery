import React from 'react'
import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Navbar from './components/Navbar'
import CategoriesPage from './pages/CategoriesPage'
import CategoryProductPage from './pages/CategoryProductPage'
import CartPage from './pages/CartPage'
import PaymentPage from './pages/PaymentPage'
import CustomerPage from './pages/CustomerPage'
import { CustomerProvider } from './components/CustomerContext'
import EmployeeLogin from './pages/EmployeeLogin'
import EmployeeOrderView from './pages/EmployeeOrderView'
import Profile from './pages/Profile'
function App() {
  return (
    <BrowserRouter>
      <CustomerProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:id/products" element={<CategoryProductPage />} />
          <Route path="/cart/:id" element={<CartPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path = "/employee-login" element = {<EmployeeLogin />} />
          <Route path = "/employee-order-view" element = {<EmployeeOrderView />} />
          <Route path = "/profile" element = {<Profile />} />
          {/* Add more routes as needed */}
        </Routes>
      </CustomerProvider>
    </BrowserRouter>
  )
}

export default App
