import React from 'react';
import { useWishlist } from '../context/WishlistContext.jsx';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-tenor text-gray-900">Wishlist</h1>
        {wishlistItems.length > 0 && (
          <button onClick={clearWishlist} className="text-sm text-red-600 hover:underline">Clear All</button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <p className="text-gray-600">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.productId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full aspect-[3/4] object-cover" />
              <div className="p-4">
                <h3 className="text-base font-tenor text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.salePrice || item.price)}
                  </span>
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
