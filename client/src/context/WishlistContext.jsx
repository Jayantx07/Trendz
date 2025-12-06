import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { apiAuthFetch } from '../utils/api.js';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Clear wishlist when fully logged out
  useEffect(() => {
    if (!token && !localStorage.getItem('token')) {
      setWishlistItems([]);
    }
  }, [token]);

  const addToWishlist = async (product) => {
    const id = product._id || product.id;
    setWishlistItems(prevItems => {
      if (prevItems.some(item => item.productId === id)) return prevItems;
      const image = product.primaryImage
        || product.image
        || (Array.isArray(product.images) && (product.images[0]?.url || product.images[0]))
        || '';
      const newItem = {
        productId: id,
        name: product.name,
        price: product.price || product.basePrice,
        salePrice: product.salePrice,
        image,
        category: product.category,
        brand: product.brand,
        addedAt: new Date().toISOString(),
      };
      return [...prevItems, newItem];
    });

    const authToken = token || localStorage.getItem('token');
    if (authToken) {
      try {
        await apiAuthFetch(`/auth/wishlist/${id}`, { method: 'POST' });
      } catch (error) {
        console.error('Error adding to wishlist on server:', error);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    setWishlistItems(prevItems => 
      prevItems.filter(item => item.productId !== productId)
    );

    const authToken = token || localStorage.getItem('token');
    if (authToken) {
      try {
        await apiAuthFetch(`/auth/wishlist/${productId}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error removing from wishlist on server:', error);
      }
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const syncWithServer = async () => {
    const authToken = token || localStorage.getItem('token');
    if (!authToken) return;

    setLoading(true);
    try {
      const res = await apiAuthFetch('/auth/wishlist');
      if (res.ok) {
        const serverWishlist = await res.json();
        const mapped = (Array.isArray(serverWishlist) ? serverWishlist : []).map(p => {
          const id = p._id || p.id;
          const image = p.primaryImage
            || p.image
            || (Array.isArray(p.images) && (p.images[0]?.url || p.images[0]))
            || '';
          return {
            productId: id,
            name: p.name,
            price: p.basePrice || p.price,
            salePrice: p.salePrice,
            image,
            category: p.category,
            brand: p.brand,
            addedAt: new Date().toISOString(),
          };
        });
        setWishlistItems(mapped);
      }
    } catch (error) {
      console.error('Error syncing wishlist with server:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync with server when user logs in or on first mount with a stored token
  useEffect(() => {
    const authToken = token || localStorage.getItem('token');
    if (authToken) {
      syncWithServer();
    } else {
      setWishlistItems([]);
    }
  }, [token]);

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    syncWithServer,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}; 