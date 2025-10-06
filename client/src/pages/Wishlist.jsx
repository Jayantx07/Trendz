import React, { useEffect, useState } from 'react';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/auth/wishlist', { headers: { ...authHeader() } });
      if (!res.ok) throw new Error('Failed to load wishlist');
      const data = await res.json();
      setItems(data || []);
    } catch (e) {
      setError(e.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const removeItem = async (productId) => {
    try {
      const res = await fetch(`/api/auth/wishlist/${productId}`, { method: 'DELETE', headers: { ...authHeader() } });
      if (!res.ok) throw new Error('Failed to remove');
      setItems((list) => list.filter((p) => (p._id || p.id) !== productId));
    } catch (e) {
      setError(e.message || 'Failed to remove');
    }
  };

  return (
    <div className="container pt-24 md:pt-28 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-tenor text-black">Wishlist</h1>
      </div>

      {loading ? (
        <p className="text-black">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-black">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const id = item._id || item.id;
            const name = item.name || 'Product';
            const price = item.salePrice || item.basePrice || item.price || 0;
            const image = item.primaryImage || item.image || (item.images && item.images[0]);
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
                      onClick={() => removeItem(id)}
                      className="text-xs text-red-600 hover:underline"
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
  );
};

export default Wishlist;
