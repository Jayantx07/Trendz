import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper: fetch cart from backend
  const fetchCart = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data = await res.json();
      setCart(data.items || []);
    } catch (err) {
      setError(err.message || 'Error fetching cart');
    } finally {
      setLoading(false);
    }
  };

  // Helper: save cart to backend
  const saveCart = async (items) => {
    if (!token) {
      setCart(items);
      localStorage.setItem('cart', JSON.stringify(items));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `bearer ${token}`
        },
        body: JSON.stringify({ items })
      });
      if (!res.ok) throw new Error('Failed to save cart');
      const data = await res.json();
      setCart(data.items || []);
    } catch (err) {
      setError(err.message || 'Error saving cart');
    } finally {
      setLoading(false);
    }
  };

  // Helper: remove item
  const removeFromCart = async (productId) => {
    if (!token) {
      const updated = cart.filter(item => item.product !== productId);
      setCart(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/cart/item/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to remove item');
      const data = await res.json();
      setCart(data.items || []);
    } catch (err) {
      setError(err.message || 'Error removing item');
    } finally {
      setLoading(false);
    }
  };

  // Helper: clear cart
  const clearCart = async () => {
    if (!token) {
      setCart([]);
      localStorage.removeItem('cart');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/cart/clear', {
        method: 'POST',
        headers: { Authorization: `bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to clear cart');
      setCart([]);
    } catch (err) {
      setError(err.message || 'Error clearing cart');
    } finally {
      setLoading(false);
    }
  };

  // Add/update item in cart
  const addToCart = (product, quantity = 1, variant = {}) => {
    let updated;
    const idx = cart.findIndex(
      item => item.product === product._id && item.variant?.size === variant.size && item.variant?.color?.name === variant.color?.name
    );
    if (idx > -1) {
      updated = [...cart];
      updated[idx].quantity += quantity;
    } else {
      updated = [
        ...cart,
        {
          product: product._id,
          variant,
          quantity,
          price: product.basePrice,
          salePrice: product.salePrice
        }
      ];
    }
    saveCart(updated);
  };

  // Update quantity
  const updateQuantity = (productId, newQuantity) => {
    let updated = cart.map(item =>
      item.product === productId ? { ...item, quantity: newQuantity } : item
    );
    saveCart(updated);
  };

  // On login, fetch cart from backend. On logout, clear cart.
  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      // Guest: load from localStorage
      const local = localStorage.getItem('cart');
      setCart(local ? JSON.parse(local) : []);
    }
    // eslint-disable-next-line
  }, [token]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.salePrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return getCartTotal();
  };

  const getShippingCost = () => {
    const subtotal = getCartSubtotal();
    // Free shipping over $200
    return subtotal >= 200 ? 0 : 15;
  };

  const getTax = () => {
    const subtotal = getCartSubtotal();
    const shipping = getShippingCost();
    // 8.5% tax rate
    return (subtotal + shipping) * 0.085;
  };

  const getTotal = () => {
    return getCartSubtotal() + getShippingCost() + getTax();
  };

  const checkout = async (checkoutData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiFetch('/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          total: getTotal(),
          subtotal: getCartSubtotal(),
          shipping: getShippingCost(),
          tax: getTax(),
          ...checkoutData,
        }),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        setLoading(false);
        return { success: true, order };
      } else {
        const error = await response.json();
        setLoading(false);
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false);
      return { success: false, error: 'Network error' };
    }
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    saveCart,
    getCartTotal,
    getCartCount,
    getCartSubtotal,
    getShippingCost,
    getTax,
    getTotal,
    checkout,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 