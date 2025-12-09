import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cart, loading, error, removeFromCart, updateQuantity, clearCart, getCartCount } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const totalItems = typeof getCartCount === 'function'
    ? getCartCount()
    : cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-tenor font-bold text-black mb-4">
            Sign in to view your bag
          </h2>
          <p className="text-gray-600 mb-8">
            Your curated pieces wait for you. Login to continue your VASAAE journey.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login', { state: { from: '/cart' } })}
            className="btn-primary rounded-[3px]"
          >
            Login to Continue
          </motion.button>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-tenor font-bold text-black mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/products')}
            className="btn-primary rounded-[3px]"
          >
            Continue Shopping
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <h1 className="text-3xl font-tenor font-bold text-gray-900 mb-8">
          Shopping Cart ({totalItems} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <motion.div
                key={`${item.product._id || item.product}-${item.variant?.size || 'nosize'}-${item.variant?.color?.name || 'nocolor'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-tenor text-gray-900 mb-1">
                          {item.product?.name || 'Product'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.variant?.color?.name && `Color: ${item.variant.color.name}`}
                          {item.variant?.size && ` • Size: ${item.variant.size}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ₹{(item.salePrice || item.price)?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          {(() => {
                            const productId = item.product?._id || item.product;
                            const variant = item.variant || {};
                            return (
                              <>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      productId,
                                      Math.max(1, item.quantity - 1),
                                      variant
                                    )
                                  }
                                  className="px-3 py-1 hover:bg-gray-50 transition-colors"
                                >
                                  <Minus className="w-4 h-4 text-black" />
                                </button>
                                <span className="px-4 py-1 font-medium text-black">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      productId,
                                      item.quantity + 1,
                                      variant
                                    )
                                  }
                                  className="px-3 py-1 hover:bg-gray-50 transition-colors"
                                >
                                  <Plus className="w-4 h-4 text-black" />
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => {
                          const product = item.product || {};
                          const variantImage = item.variant?.imageUrl;
                          const image = variantImage
                            || product.primaryImage
                            || (Array.isArray(product.images) && (product.images[0]?.url || product.images[0]))
                            || '/images/placeholder.jpg';
                          
                          removeFromCart(
                            item.product?._id || item.product,
                            item.variant || {}
                          );
                          showToast('Item removed from bag', 'info', image);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Clear Cart */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={clearCart}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-tenor font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Price Breakdown */}
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

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2 rounded-[3px]"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 