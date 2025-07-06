import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    setWishlistItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product._id);
      if (existingItem) {
        return prevItems; // Already in wishlist
      }
      
      const newItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images[0],
        category: product.category,
        brand: product.brand,
        addedAt: new Date().toISOString(),
      };
      return [...prevItems, newItem];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prevItems => 
      prevItems.filter(item => item.productId !== productId)
    );
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
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setLoading(true);
    try {
      // Get wishlist from server
      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const serverWishlist = await response.json();
        setWishlistItems(serverWishlist);
      }
    } catch (error) {
      console.error('Error syncing wishlist with server:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToServer = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      await fetch('/api/wishlist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(wishlistItems),
      });
    } catch (error) {
      console.error('Error saving wishlist to server:', error);
    }
  };

  // Sync with server when user logs in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      syncWithServer();
    }
  }, []);

  // Save to server when wishlist changes (if user is logged in)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && wishlistItems.length > 0) {
      saveToServer();
    }
  }, [wishlistItems]);

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