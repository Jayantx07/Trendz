import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiAuthFetch, apiFetch } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);
  
  // Assuming free delivery for now as per previous logic, or add logic here
  const deliveryFee = 0; 
  const total = subtotal + deliveryFee;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    landmark: '',
    alternatePhone: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      // 1. Get Razorpay Key
      const keyRes = await apiFetch('/payments/key');
      const { key } = await keyRes.json();

      // 2. Create Order on Backend
      const orderRes = await apiAuthFetch('/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: total,
          currency: 'INR'
        })
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderRes.json();

      // 3. Open Razorpay Checkout
      const options = {
        key: key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Trendz / VSAAE",
        description: "Purchase from Trendz",
        image: "/logo.png", // Replace with actual logo path if available
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 4. Verify and Save Order
            const saveOrderRes = await apiAuthFetch('/orders/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                shippingAddress: formData,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                amount: total
              })
            });

            if (!saveOrderRes.ok) {
              throw new Error('Payment successful but failed to save order');
            }

            const savedOrder = await saveOrderRes.json();
            clearCart();
            // Redirect to success page or orders page
            // Since we don't have a dedicated success page yet, go to orders
            navigate('/account/orders'); 
          } catch (err) {
            console.error(err);
            setError('Payment successful but order creation failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          address: `${formData.street}, ${formData.city}, ${formData.state}, ${formData.pincode}`
        },
        theme: {
          color: "#B48D56" // Accent color
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong with payment');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-display mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-secondary min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-display mb-8 text-center">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Address Form */}
          <div className="lg:w-2/3 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-6 border-b pb-2 text-black">Shipping Information</h2>
            <form id="checkout-form" onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-accent focus:border-accent text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-accent focus:border-accent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-accent focus:border-accent text-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">House / Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-accent focus:border-accent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-accent focus:border-accent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-accent focus:border-accent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-accent focus:border-accent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-accent focus:border-accent text-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-accent focus:border-accent text-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">Alternate Number (Optional)</label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-accent focus:border-accent text-black"
                />
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold mb-6 border-b pb-2 text-black">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {cart.map((item) => (
                  <div key={`${item.product._id}-${item.variant.size}`} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {(() => {
                        const product = item.product || {};
                        const variantImage = item.variant?.imageUrl;
                        const image = variantImage
                          || product.primaryImage
                          || (Array.isArray(product.images) && (product.images[0]?.url || product.images[0]))
                          || '/images/placeholder.jpg';
                        return (
                          <img
                            src={image}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        );
                      })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium line-clamp-2 text-black">{item.product.name}</h3>
                      <p className="text-xs text-gray-500">Size: {item.variant.size}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                        <span className="text-sm font-medium text-black">₹{(item.salePrice || item.price) * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-black">Subtotal</span>
                  <span className="text-black">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2 text-black">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full mt-6 bg-black hover:bg-gray-800 text-white py-3 rounded font-medium transition-colors flex justify-center items-center"
              >
                {loading ? <LoadingSpinner size="sm" color="white" /> : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
