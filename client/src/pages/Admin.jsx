import React, { useEffect, useState } from 'react';
import { apiAuthFetch, uploadFiles } from '../utils/api.js';
import AdminRoute from '../components/common/AdminRoute.jsx';
import LazyImage from '../components/common/LazyImage.jsx';

const AdminInner = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiAuthFetch('/admin/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const onUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !selectedProduct) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadFiles('/media/upload', files, { folder: 'products' });
      const images = (uploaded.assets || [])
        .filter(a => a.resourceType === 'image')
        .map((a, i) => ({ url: a.url, publicId: a.publicId, isPrimary: i === 0 }));
      const videos = (uploaded.assets || [])
        .filter(a => a.resourceType === 'video')
        .map((a) => ({ url: a.url, publicId: a.publicId }));

      if (images.length) {
        const res = await apiAuthFetch(`/admin/products/${selectedProduct._id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images })
        });
        if (!res.ok) throw new Error('Failed to attach images');
      }
      if (videos.length) {
        const resV = await apiAuthFetch(`/admin/products/${selectedProduct._id}/videos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videos })
        });
        if (!resV.ok) throw new Error('Failed to attach videos');
      }
      await fetchProducts();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = async (productId, publicId) => {
    if (!publicId) return;
    setUploading(true);
    try {
      const res = await apiAuthFetch(`/admin/products/${productId}/images/${publicId}?deleteFromCloudinary=true`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove image');
      await fetchProducts();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container pt-24 pb-12">
        <h1 className="text-3xl font-tenor font-bold mb-6">Admin Panel</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Products</h2>
              <button onClick={fetchProducts} className="text-sm text-accent">Refresh</button>
            </div>
            {loading ? (
              <div>Loading…</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {products.map((p) => (
                  <li key={p._id} className={`py-3 cursor-pointer ${selectedProduct?._id===p._id? 'bg-gray-50' : ''}`} onClick={()=>setSelectedProduct(p)}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        {p.primaryImage || (p.images && p.images[0]?.url) ? (
                          <LazyImage src={p.primaryImage || p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.category}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
            {!selectedProduct ? (
              <div className="text-gray-600">Select a product to manage images and details.</div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{selectedProduct.name}</h2>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <span className="text-sm">Upload Images/Videos</span>
                    <input type="file" multiple accept="image/*,video/*" onChange={onUpload} disabled={uploading} className="hidden" />
                    <span className={`px-3 py-1 rounded bg-black text-white text-sm ${uploading? 'opacity-50' : ''}`}>Select Files</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(selectedProduct.images || []).map((img) => (
                    <div key={img.publicId || img.url} className="relative group">
                      <LazyImage src={img.url} alt={img.alt || ''} className="w-full h-40 object-cover rounded" />
                      <button
                        onClick={()=>removeImage(selectedProduct._id, img.publicId)}
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 text-xs px-2 py-1 rounded hidden group-hover:block"
                      >Remove</button>
                      {img.isPrimary && (
                        <span className="absolute bottom-2 left-2 bg-black text-white text-[10px] px-2 py-0.5 rounded">Primary</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin = () => (
  <AdminRoute>
    <AdminInner />
  </AdminRoute>
);

export default Admin;
