import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { motion } from 'framer-motion';
import { ArrowRight, CreditCard, Truck, Shield } from 'lucide-react';

const Checkout = () => {
  const { cart, loading, error, clearCart } = useCart();
  const [address, setAddress] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  });
  const [payment, setPayment] = useState('card');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formError, setFormError] = useState('');

  const subtotal = cart.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const handleInput = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!address.name || !address.email || !address.phone || !address.street || !address.city || !address.state || !address.zip) {
      setFormError('Please fill all required fields.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setPlacingOrder(true);
    setTimeout(() => {
      setOrderPlaced(true);
      clearCart();
      setPlacingOrder(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-tenor font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Please add items to your cart before checking out.
          </p>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-accent mb-4">
            Thank you for your order!
          </h2>
          <p className="text-gray-600 mb-8">
            Your order has been placed successfully. You will receive a confirmation email soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <h1 className="text-3xl font-tenor font-bold text-gray-900 mb-8">
          Checkout
        </h1>
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-8" onSubmit={handlePlaceOrder}>
          {/* Shipping Address */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-tenor font-bold mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" value={address.name} onChange={handleInput} className="input" placeholder="Full Name*" required />
              <input name="email" value={address.email} onChange={handleInput} className="input" placeholder="Email*" required type="email" />
              <input name="phone" value={address.phone} onChange={handleInput} className="input" placeholder="Phone*" required />
              <input name="street" value={address.street} onChange={handleInput} className="input md:col-span-2" placeholder="Street Address*" required />
              <input name="city" value={address.city} onChange={handleInput} className="input" placeholder="City*" required />
              <input name="state" value={address.state} onChange={handleInput} className="input" placeholder="State*" required />
              <input name="zip" value={address.zip} onChange={handleInput} className="input" placeholder="ZIP/Postal Code*" required />
              <input name="country" value={address.country} onChange={handleInput} className="input" placeholder="Country*" required />
            </div>
            {formError && <p className="text-red-600 text-sm mt-2">{formError}</p>}

            {/* Payment Method */}
            <div className="mt-8">
              <h2 className="text-xl font-tenor font-bold mb-4">Payment Method</h2>
              <div className="flex gap-4">
                <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${payment === 'card' ? 'border-accent' : 'border-gray-200'}`}>
                  <input type="radio" name="payment" value="card" checked={payment === 'card'} onChange={() => setPayment('card')} className="accent-accent" />
                  <CreditCard className="w-5 h-5" />
                  Card (Stripe/Razorpay)
                </label>
                <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${payment === 'cod' ? 'border-accent' : 'border-gray-200'}`}>
                  <input type="radio" name="payment" value="cod" checked={payment === 'cod'} onChange={() => setPayment('cod')} className="accent-accent" />
                  <Truck className="w-5 h-5" />
                  Cash on Delivery
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-tenor font-bold text-gray-900 mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.product + (item.variant?.size || '') + (item.variant?.color?.name || '')} className="flex gap-4 items-center">
                    <img src={item.product?.images?.[0]?.url || '/images/placeholder.jpg'} alt={item.product?.name || 'Product'} className="w-16 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.product?.name || 'Product'}</div>
                      <div className="text-sm text-gray-600">
                        {item.variant?.color?.name && `Color: ${item.variant.color.name}`}
                        {item.variant?.size && ` • Size: ${item.variant.size}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">₹{(item.salePrice || item.price)?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {/* Add shipping/tax/discount logic here if needed */}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2 rounded-[3px]"
                disabled={placingOrder}
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span>Multiple payment options</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout; 