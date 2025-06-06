import React from "react";
import { createContext, useContext, useState } from "react";

const CustomerContext = createContext();

export const useCustomer = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const [customerId, setCustomerId] = useState(null);

  return (
    <CustomerContext.Provider value={{ customerId, setCustomerId }}>
      {children}
    </CustomerContext.Provider>
  );
};
