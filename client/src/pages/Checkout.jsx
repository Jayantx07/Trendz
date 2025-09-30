import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { ArrowRight, CreditCard, Truck, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading, error, clearCart } = useCart();
  const { user, token } = useAuth();
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [billingAddress, setBillingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [formError, setFormError] = useState('');

  const subtotal = cart.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);
  
  const shipping = subtotal >= 149900 ? 0 : 9900; // Free shipping over ₹1499
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress({ ...shippingAddress, [name]: value });
    
    if (sameAsShipping) {
      setBillingAddress({ ...billingAddress, [name]: value });
    }
  };

  const handleBillingChange = (e) => {
    setBillingAddress({ ...billingAddress, [e.target.name]: e.target.value });
  };

  const handleSameAsShipping = (e) => {
    setSameAsShipping(e.target.checked);
    if (e.target.checked) {
      setBillingAddress({ ...shippingAddress });
    }
  };

  const validateForm = () => {
    const requiredShippingFields = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state', 'zipCode'];
    const requiredBillingFields = sameAsShipping ? [] : requiredShippingFields;
    
    for (const field of requiredShippingFields) {
      if (!shippingAddress[field]?.trim()) {
        setFormError(`Please fill in shipping ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    for (const field of requiredBillingFields) {
      if (!billingAddress[field]?.trim()) {
        setFormError(`Please fill in billing ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    setFormError('');
    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateForm()) return;
    if (!token) {
      setFormError('Please login to place an order');
      return;
    }
    
    setPlacingOrder(true);
    
    try {
      const orderData = {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
        paymentToken: 'dummy_token' // In real implementation, this would come from Stripe/Razorpay
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        setOrderDetails(data.order);
        setOrderPlaced(true);
        clearCart();
      } else {
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      setFormError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 shadow-lg"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-tenor font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h2>
            {orderDetails && (
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2">
                  Order Number: <span className="font-semibold text-accent">{orderDetails.orderNumber}</span>
                </p>
                <p className="text-gray-600">
                  Total: <span className="font-semibold">₹{orderDetails.total?.toLocaleString()}</span>
                </p>
              </div>
            )}
            <p className="text-gray-600 mb-8">
              Thank you for shopping with Trendz! You will receive a confirmation email shortly with your order details and tracking information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/account')}
                className="btn-primary"
              >
                View Order History
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/products')}
                className="btn-secondary"
              >
                Continue Shopping
              </motion.button>
            </div>
          </motion.div>
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
              <input 
                name="firstName" 
                value={shippingAddress.firstName} 
                onChange={handleShippingChange} 
                className="form-input" 
                placeholder="First Name*" 
                required 
              />
              <input 
                name="lastName" 
                value={shippingAddress.lastName} 
                onChange={handleShippingChange} 
                className="form-input" 
                placeholder="Last Name*" 
                required 
              />
              <input 
                name="email" 
                value={shippingAddress.email} 
                onChange={handleShippingChange} 
                className="form-input" 
                placeholder="Email*" 
                type="email" 
                required 
              />
              <input 
                name="phone" 
                value={shippingAddress.phone} 
                onChange={handleShippingChange} 
                className="form-input" 
                placeholder="Phone Number*" 
                required 
              />
              <input 
                name="street" 
                value={shippingAddress.street} 
                onChange={handleShippingChange} 
                className="form-input md:col-span-2" 
                placeholder="Street Address*" 
                required 
              />
              <input 
                name="city" 
                value={shippingAddress.city} 
                onChange={handleShippingChange} 
                className="form-input" 
                placeholder="City*" 
                required 
              />
              <input 
                name="state" 
                value={shippingAddress.state} 
                onChange={handleShippingChange} 
                className="form-input" 
                placeholder="State*" 
                required 
              />
              <input 
                name="zipCode" 
                value={shippingAddress.zipCode} 
                onChange={handleShippingChange} 
                className="form-input" 
                placeholder="ZIP/Postal Code*" 
                required 
              />
              <select 
                name="country" 
                value={shippingAddress.country} 
                onChange={handleShippingChange} 
                className="form-input"
                required
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
            
            {/* Same as shipping address checkbox */}
            <div className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                id="sameAsShipping" 
                checked={sameAsShipping}
                onChange={handleSameAsShipping}
                className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
              />
              <label htmlFor="sameAsShipping" className="text-sm text-gray-700">
                Billing address is the same as shipping address
              </label>
            </div>

            {/* Billing Address */}
            {!sameAsShipping && (
              <div className="mt-6">
                <h3 className="text-lg font-tenor font-semibold mb-4">Billing Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    name="firstName" 
                    value={billingAddress.firstName} 
                    onChange={handleBillingChange} 
                    className="form-input" 
                    placeholder="First Name*" 
                    required 
                  />
                  <input 
                    name="lastName" 
                    value={billingAddress.lastName} 
                    onChange={handleBillingChange} 
                    className="form-input" 
                    placeholder="Last Name*" 
                    required 
                  />
                  <input 
                    name="email" 
                    value={billingAddress.email} 
                    onChange={handleBillingChange} 
                    className="form-input" 
                    placeholder="Email*" 
                    type="email" 
                    required 
                  />
                  <input 
                    name="phone" 
                    value={billingAddress.phone} 
                    onChange={handleBillingChange} 
                    className="form-input" 
                    placeholder="Phone Number*" 
                    required 
                  />
                  <input 
                    name="street" 
                    value={billingAddress.street} 
                    onChange={handleBillingChange} 
                    className="form-input md:col-span-2" 
                    placeholder="Street Address*" 
                    required 
                  />
                  <input 
                    name="city" 
                    value={billingAddress.city} 
                    onChange={handleBillingChange} 
                    className="form-input" 
                    placeholder="City*" 
                    required 
                  />
                  <input 
                    name="state" 
                    value={billingAddress.state} 
                    onChange={handleBillingChange} 
                    className="form-input" 
                    placeholder="State*" 
                    required 
                  />
                  <input 
                    name="zipCode" 
                    value={billingAddress.zipCode} 
                    onChange={handleBillingChange} 
                    className="form-input" 
                    placeholder="ZIP/Postal Code*" 
                    required 
                  />
                  <select 
                    name="country" 
                    value={billingAddress.country} 
                    onChange={handleBillingChange} 
                    className="form-input"
                    required
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            )}
            {formError && <p className="text-red-600 text-sm mt-2">{formError}</p>}

            {/* Payment Method */}
            <div className="mt-8">
              <h2 className="text-xl font-tenor font-bold mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="card" 
                    checked={paymentMethod === 'card'} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                    className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
                  />
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">Credit/Debit Card</span>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="upi" 
                    checked={paymentMethod === 'upi'} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                    className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
                  />
                  <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-red-500 rounded" />
                  <span className="text-sm font-medium">UPI</span>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'netbanking' ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="netbanking" 
                    checked={paymentMethod === 'netbanking'} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                    className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
                  />
                  <div className="w-5 h-5 bg-blue-500 rounded" />
                  <span className="text-sm font-medium">Net Banking</span>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod" 
                    checked={paymentMethod === 'cod'} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                    className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
                  />
                  <Truck className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">Cash on Delivery</span>
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
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                {subtotal >= 149900 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>✨ Free shipping applied!</span>
                    <span>-₹99</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
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