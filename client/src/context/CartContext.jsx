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
          Authorization: `Bearer ${token}`
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

  // Helper: remove a specific cart item (by product + variant)
  const removeFromCart = async (productId, variant = {}) => {
    const { size, color } = variant || {};

    if (!token) {
      const updated = cart.filter(item => {
        const sameProduct = item.product === productId || item.product?._id === productId;
        const sameSize = size ? item.variant?.size === size : true;
        const sameColor = color?.name ? item.variant?.color?.name === color.name : true;
        // keep item when it does NOT match all provided keys
        return !(sameProduct && sameSize && sameColor);
      });
      setCart(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/cart/item/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ variant: { size, color } })
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
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to clear cart');
      setCart([]);
    } catch (err) {
      setError(err.message || 'Error clearing cart');
    } finally {
      setLoading(false);
    }
  };

  // Add/update item in cart, keyed by product + variantId + size
  const addToCart = (product, quantity = 1, variant = {}) => {
    // Allow guest cart (no token check here)
    let updated;

    // Only merge into an existing line item when we have a stable
    // variantId from the backend. If variantId is missing (e.g. local
    // products or incomplete data), always create a new cart line so
    // different variants never overwrite each other's image/details.
    let idx = -1;
    if (variant.variantId) {
      idx = cart.findIndex((item) => {
        const sameProduct = item.product === product._id;
        const sameVariantId = item.variant?.variantId === variant.variantId;
        const sameSize = item.variant?.size === variant.size;

        return sameProduct && sameVariantId && sameSize;
      });
    }
    
    // CRITICAL: Use the imageUrl provided by ProductDetail, which captured the exact displayed variant image
    // Do NOT recompute here to avoid overwriting the correct image
    const variantImageUrl = variant.imageUrl || '';

    if (idx > -1) {
      // Merging with existing item - keep the ORIGINAL imageUrl to preserve variant-specific image
      const existingImageUrl = cart[idx].variant?.imageUrl;
      
      updated = [...cart];
      updated[idx].quantity += quantity;
      // Do NOT overwrite imageUrl when merging - keep the original one that was stored
      updated[idx].variant = {
        ...updated[idx].variant,
        ...variant,
        imageUrl: existingImageUrl || variantImageUrl, // Prefer existing
      };
    } else {
      const newItem = {
        product: product._id,
        variant: {
          ...variant,
          imageUrl: variantImageUrl,
        },
        quantity,
        price: product.basePrice,
        salePrice: product.salePrice
      };
      updated = [...cart, newItem];
    }
    
    saveCart(updated);
  };

  // Update quantity for a specific cart item (by product + variant)
  const updateQuantity = (productId, newQuantity, variant = {}) => {
    const id = typeof productId === 'object' && productId !== null
      ? productId._id
      : productId;

    const { size, color } = variant || {};

    const updated = cart.map((item) => {
      const sameProduct = item.product === id || item.product?._id === id;
      const sameSize = size ? item.variant?.size === size : true;
      const sameColor = color?.name ? item.variant?.color?.name === color.name : true;

      if (sameProduct && sameSize && sameColor) {
        return { ...item, quantity: newQuantity };
      }

      return item;
    });

    saveCart(updated);
  };

  // On login, fetch cart from backend. On logout, load from local storage.
  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          setCart(JSON.parse(localCart));
        } catch (e) {
          console.error('Failed to parse cart from local storage', e);
          setCart([]);
        }
      } else {
        setCart([]);
      }
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

export { CartProvider };
export default CartProvider;