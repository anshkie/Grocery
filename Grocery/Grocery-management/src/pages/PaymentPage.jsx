import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';

// Your public Stripe key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
// If not using Vite, replace with: const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);
// Or for testing, you can hardcode: const stripePromise = loadStripe('pk_test_...');
console.log("Stripe key:", import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const PaymentPage = () => {
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Server error: ${res.status} ${errorText}`);
        }
        return res.json();
      })
      .then((data) => setClientSecret(data.client_secret))
      .catch((err) => setError(err.message));
  }, []);

  const appearance = {
    theme: 'stripe',
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      ) : (
        <p>Loading payment...</p>
      )}
    </div>
  );
};

export default PaymentPage;
