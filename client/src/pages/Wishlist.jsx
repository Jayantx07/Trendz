import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Wishlist = () => {
  const {
    wishlistItems,
    loading,
    removeFromWishlist,
    clearWishlist,
    getWishlistCount,
  } = useWishlist();

  const { user } = useAuth();
  const navigate = useNavigate();

  const totalItems = typeof getWishlistCount === 'function'
    ? getWishlistCount()
    : (wishlistItems || []).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-tenor font-bold text-black mb-4">
            Sign in to view your wishlist
          </h1>
          <p className="text-gray-600 mb-8">
            Save your favourite pieces in one luxurious place. Login to keep your edits.
          </p>
          <button
            onClick={() => navigate('/login', { state: { from: '/wishlist' } })}
            className="btn-primary rounded-[3px]"
          >
            Login to View Wishlist
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Spacer to clear fixed navbar */}
      <div className="pt-24 md:pt-28" />
      <div className="container pb-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-tenor font-bold text-black">
              Wishlist{totalItems > 0 ? ` (${totalItems})` : ''}
            </h1>
            {totalItems > 0 && (
              <button
                onClick={clearWishlist}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Clear Wishlist
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-black">Loading...</p>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-black mb-6">Your wishlist is empty.</p>
              <a href="/products" className="inline-block px-4 py-2 bg-black text-white rounded">Start Shopping</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistItems.map((item) => {
                const id = item.productId || item._id || item.id;
                const name = item.name || 'Product';
                const price = item.salePrice || item.basePrice || item.price || 0;
                const image = item.image
                  || item.primaryImage
                  || (Array.isArray(item.images) && (item.images[0]?.url || item.images[0]))
                  || '/images/placeholder.jpg';
                const category = item.category || '';
                return (
                  <div key={id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {image && <img src={image} alt={name} className="w-full aspect-[3/4] object-cover" />}
                    <div className="p-4">
                      <h3 className="text-base font-tenor text-black mb-1">{name}</h3>
                      <p className="text-sm text-black mb-3">{category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-black">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price)}
                        </span>
                        <button
                          onClick={() => removeFromWishlist(id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 tracking-wide uppercase"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
