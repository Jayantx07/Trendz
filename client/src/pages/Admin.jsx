import React, { useEffect, useState, useRef } from 'react';
import { apiAuthFetch, uploadFiles } from '../utils/api.js';
import AdminRoute from '../components/common/AdminRoute.jsx';
import LazyImage from '../components/common/LazyImage.jsx';

const AdminInner = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [draft, setDraft] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [activeColor, setActiveColor] = useState('');
  const [showAllImages, setShowAllImages] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageColor, setImageColor] = useState('');
  const [imageSizes, setImageSizes] = useState([]);
  const [imagePrice, setImagePrice] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const imageInputRef = useRef();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiAuthFetch('/admin/products?limit=200');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data);
      // keep selection if exists
      if (selectedProduct?._id) {
        const still = data.find(p => p._id === selectedProduct._id);
        if (!still) setSelectedProduct(null);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const SIZES = ['XS','S','M','L','XL','XXL'];

  const addColor = () => {
    const normName = titleCase(activeColor || 'New Color');
    setDraft(d => {
      const existing = (d?.variants || []).some(v => (v.color?.name || '').toLowerCase() === normName.toLowerCase());
      const basePrice = Number(d?.basePrice || 0);
      const newVariants = SIZES.map(sz => ({
        size: sz,
        color: { name: normName, hex: '' },
        stock: 0,
        sku: '',
        price: basePrice,
        salePrice: '',
        isOnSale: false,
      }));
      return {
        ...d,
        variants: existing ? d.variants : [...(d?.variants || []), ...newVariants]
      };
    });
    setActiveColor(normName);
  };

  const addVariant = () => {
    setDraft(d => ({
      ...d,
      variants: [...(d?.variants || []), {
        size: 'M',
        color: { name: '', hex: '' },
        stock: 0,
        sku: '',
        price: 0,
        salePrice: '',
        isOnSale: false,
      }]
    }));
  };

  const updateVariant = (index, key, value) => {
    setDraft(d => {
      const arr = [...(d?.variants || [])];
      const v = { ...(arr[index] || {}) };
      if (key === 'color.name') v.color = { ...(v.color || {}), name: value };
      else if (key === 'color.hex') v.color = { ...(v.color || {}), hex: value };
      else v[key] = value;
      arr[index] = v;
      return { ...d, variants: arr };
    });
  };

  const removeVariant = (index) => {
    setDraft(d => ({
      ...d,
      variants: (d?.variants || []).filter((_, i) => i !== index)
    }));
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    if (!selectedProduct) { setDraft(null); return; }
    const v = (selectedProduct.variants && selectedProduct.variants[0]) || {};
    setDraft({
      _id: selectedProduct._id,
      name: selectedProduct.name || '',
      description: selectedProduct.description || '',
      category: selectedProduct.category || 'dresses',
      gender: selectedProduct.gender || 'women',
      basePrice: Number(selectedProduct.basePrice || 0),
      salePrice: Number(selectedProduct.salePrice || 0),
      isOnSale: !!selectedProduct.isOnSale,
      colorName: v?.color?.name || '',
      colorHex: v?.color?.hex || '',
      variants: Array.isArray(selectedProduct.variants) ? selectedProduct.variants.map(v => ({
        size: v.size || 'M',
        color: { name: v.color?.name || '', hex: v.color?.hex || '' },
        stock: Number(v.stock ?? 0),
        sku: v.sku || '',
        price: Number(v.price ?? 0),
        salePrice: v.salePrice != null ? Number(v.salePrice) : undefined,
        isOnSale: !!v.isOnSale,
      })) : []
    });
    // default active color from first variant if present
    const firstColor = v?.color?.name || '';
    setActiveColor(firstColor);
  }, [selectedProduct]);

  const updateDraft = (key, val) => setDraft((d) => ({ ...d, [key]: val }));

  const slugify = (s='') => String(s).toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const titleCase = (s='') => String(s).toLowerCase().replace(/(^|\s)\w/g, (m) => m.toUpperCase());

  const createProduct = async () => {
    setUploading(true);
    setError(null);
    try {
      const ts = Date.now();
      const payload = {
        name: `New Product ${ts}`,
        slug: `${slugify(`new-product-${ts}`)}`,
        description: 'Description goes here...',
        shortDescription: 'Short description...', // optional
        brand: 'Trendz',
        category: 'dresses',
        gender: 'women',
        basePrice: 0,
        status: 'active',
        images: [
          {
            url: 'https://via.placeholder.com/400x600?text=Product+Image',
            isPrimary: true,
            assetType: 'image',
          }
        ],
        variants: [
          {
            size: 'M',
            color: { name: 'Default', hex: '#000000' },
            stock: 10,
            sku: `SKU-${ts}`,
            price: 0,
            isOnSale: false
          }
        ]
      };
      const res = await apiAuthFetch('/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create product');
      }
      const created = await res.json();
      await fetchProducts();
      setSelectedProduct(created);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const saveProduct = async () => {
    if (!draft) return;
    setUploading(true);
    setError(null);
    try {
      const payload = {
        name: draft.name,
        description: draft.description,
        category: draft.category,
        gender: draft.gender,
        basePrice: Number(draft.basePrice || 0),
        salePrice: Number(draft.salePrice || 0),
        isOnSale: !!draft.isOnSale,
        variants: Array.isArray(draft.variants) ? draft.variants.map(v => ({
          size: v.size,
          color: { name: v.color?.name || '', hex: v.color?.hex || '' },
          stock: Number(v.stock || 0),
          sku: v.sku || undefined,
          price: Number(v.price || 0),
          salePrice: v.salePrice != null && v.salePrice !== '' ? Number(v.salePrice) : undefined,
          isOnSale: !!v.isOnSale,
        })) : undefined,
      };
      const res = await apiAuthFetch(`/admin/products/${draft._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save product');
      await fetchProducts();
      const updated = (await res.json());
      setSelectedProduct(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteProduct = async () => {
    if (!selectedProduct) return;
    setUploading(true);
    setError(null);
    try {
      const res = await apiAuthFetch(`/admin/products/${selectedProduct._id}?purgeAssets=true`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      setSelectedProduct(null);
      await fetchProducts();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const onUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !selectedProduct) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadFiles('/media/upload', files, { folder: 'products' });
      const images = (uploaded.assets || [])
        .filter(a => a.resourceType === 'image')
        .map((a, i) => ({ url: a.url, publicId: a.publicId, isPrimary: i === 0, colorName: activeColor || undefined }));
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
      const safeId = publicId ? encodeURIComponent(publicId) : '';
      const res = await apiAuthFetch(`/admin/products/${productId}/images/${safeId}?deleteFromCloudinary=true`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove image');
      await fetchProducts();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const makePrimary = async (productId, publicId, index) => {
    setUploading(true);
    setError(null);
    try {
      const body = publicId ? { publicId } : { index };
      const res = await apiAuthFetch(`/admin/products/${productId}/images/primary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to set primary image');
      await fetchProducts();
      const updated = await apiAuthFetch(`/admin/products/${productId}`);
      if (updated.ok) {
        const j = await updated.json();
        setSelectedProduct(j);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  // Size toggle logic for image modal
  const toggleImageSize = (size) => {
    setImageSizes((prev) => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  // Handle image file selection
  const handleImageFileChange = (e) => {
    setImageFiles(Array.from(e.target.files || []));
  };

  // Handle image upload for variant
  const handleAddImage = async () => {
    if (!imageColor || imageSizes.length === 0 || !imagePrice || Number(imagePrice) <= 0 || imageFiles.length === 0) {
      setError('Please fill all details and select at least one size, color, price > 0, and image.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      // Upload images
      const uploaded = await uploadFiles('/media/upload', imageFiles, { folder: 'products' });
      const images = (uploaded.assets || []).filter(a => a.resourceType === 'image');
      // Add variants for each selected size
      setDraft(d => {
        const newVariants = imageSizes.map(sz => ({
          size: sz,
          color: { name: imageColor, hex: '' },
          stock: 0,
          sku: '',
          price: Number(imagePrice),
          salePrice: '',
          isOnSale: false,
        }));
        return {
          ...d,
          variants: [...(d?.variants || []), ...newVariants],
          images: [...(d?.images || []), ...images.map(img => ({ url: img.url, isPrimary: false, colorName: imageColor }))]
        };
      });
      setShowImageModal(false);
      setImageColor('');
      setImageSizes([...SIZES]);
      setImagePrice('');
      setImageFiles([]);
      if (imageInputRef.current) imageInputRef.current.value = '';
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  // Modal for adding image and variant details
  const renderImageModal = () => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={()=>setShowImageModal(false)}>&times;</button>
        <h2 className="text-lg font-semibold mb-4">Add Image & Variant</h2>
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Color</label>
          <input type="text" value={imageColor} onChange={e=>setImageColor(titleCase(e.target.value))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black" placeholder="e.g. Red" />
        </div>
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Sizes</label>
          <div className="flex gap-2 flex-wrap">
            {SIZES.map(sz => (
              <div
                key={sz}
                onClick={()=>toggleImageSize(sz)}
                className={`cursor-pointer px-3 py-1 rounded-full border text-sm ${imageSizes.includes(sz) ? 'bg-black text-white border-black' : 'bg-white text-black border-black'} transition`}
              >{sz}</div>
            ))}
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Price (INR)</label>
          <input type="number" min="1" value={imagePrice} onChange={e=>setImagePrice(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black" placeholder="e.g. 999" />
        </div>
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Images</label>
          <input type="file" multiple accept="image/*" ref={imageInputRef} onChange={handleImageFileChange} className="w-full" />
        </div>
        <button onClick={handleAddImage} disabled={uploading} className="w-full bg-black text-white py-2 rounded mt-2 disabled:opacity-50">Add Variant & Images</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container pt-24 pb-12">
        {showImageModal && renderImageModal()}
        <h1 className="text-3xl font-tenor font-bold mb-6 text-black">Admin Panel</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Products</h2>
              <div className="flex items-center gap-3">
                <button onClick={createProduct} className="text-sm text-black border border-gray-300 rounded px-2 py-1">Add</button>
                <button onClick={fetchProducts} className="text-sm text-accent">Refresh</button>
              </div>
            </div>
            {loading ? (
              <div>Loading…</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {products.map((p) => (
                  <li key={p._id} className={`py-3 cursor-pointer ${selectedProduct?._id===p._id? 'bg-gray-50' : ''}`} onClick={async ()=>{
                    try {
                      const res = await apiAuthFetch(`/admin/products/${p._id}`);
                      if (res.ok) {
                        const full = await res.json();
                        setSelectedProduct(full);
                      } else {
                        setSelectedProduct(p);
                      }
                    } catch {
                      setSelectedProduct(p);
                    }
                  }}>
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-black">Edit Product</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={saveProduct} disabled={uploading || !draft} className={`px-3 py-1 rounded border border-gray-300 bg-white text-black text-sm ${uploading? 'opacity-50' : ''}`}>Save</button>
                    <button
                      onClick={deleteProduct}
                      disabled={uploading || !selectedProduct}
                      className="px-3 py-1 rounded border border-red-500 bg-white text-red-600 text-sm border hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {draft && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Name</label>
                      <input type="text" value={draft.name} onChange={(e)=>updateDraft('name', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder:text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Category</label>
                      <select value={draft.category} onChange={(e)=>updateDraft('category', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black">
                        <option value="dresses">dresses</option>
                        <option value="tops">tops</option>
                        <option value="bottoms">bottoms</option>
                        <option value="outerwear">outerwear</option>
                        <option value="accessories">accessories</option>
                        <option value="shoes">shoes</option>
                        <option value="bags">bags</option>
                        <option value="jewelry">jewelry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Gender</label>
                      <select value={draft.gender} onChange={(e)=>updateDraft('gender', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black">
                        <option value="women">women</option>
                        <option value="men">men</option>
                        <option value="unisex">unisex</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Base Price</label>
                      <input type="number" value={draft.basePrice} onChange={(e)=>updateDraft('basePrice', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder:text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Sale Price</label>
                      <input type="number" value={draft.salePrice} onChange={(e)=>updateDraft('salePrice', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder:text-gray-700" />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <input id="ison" type="checkbox" checked={!!draft.isOnSale} onChange={(e)=>updateDraft('isOnSale', e.target.checked)} />
                      <label htmlFor="ison" className="text-sm">On Sale</label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Description</label>
                      <textarea rows={4} value={draft.description} onChange={(e)=>updateDraft('description', e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder:text-gray-700" />
                    </div>
                  </div>
                )}



                {draft && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-black mb-2">Variants</h4>
                    <div className="flex flex-col gap-6">
                      {(draft.variants || []).map((variant, idx) => {
                        // Find images/videos for this variant (by color name and size)
                        const variantMedia = (selectedProduct.images || []).filter(img =>
                          img.colorName === variant.color?.name && img.size === variant.size
                        );
                        return (
                          <div key={idx} className="border-b pb-4 mb-2">
                            <div className="flex items-center gap-6">
                              {/* Color circle and HEX input */}
                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center cursor-pointer"
                                  style={{ backgroundColor: variant.color?.hex || '#fff' }}
                                >
                                  {!variant.color?.hex && <span className="text-xs text-gray-400">?</span>}
                                </div>
                                <input
                                  type="text"
                                  value={variant.color?.hex || ''}
                                  onChange={e => updateVariant(idx, 'color.hex', e.target.value)}
                                  className="w-20 border border-gray-300 rounded px-2 py-1 text-xs text-black text-center"
                                  placeholder="#HEX"
                                />
                                <input
                                  type="text"
                                  value={variant.color?.name || ''}
                                  onChange={e => updateVariant(idx, 'color.name', e.target.value)}
                                  className="w-20 border border-gray-300 rounded px-2 py-1 text-xs text-black text-center mt-1"
                                  placeholder="Color name"
                                />
                              </div>
                              {/* Sizes as outlined toggleable rectangles */}
                              <div className="flex gap-2 flex-wrap">
                                {['XS','S','M','L','XL','XXL'].map(sz => (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => updateVariant(idx, 'size', sz)}
                                    className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${variant.size === sz ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                                    style={{ minWidth: 48 }}
                                  >
                                    {sz}
                                  </button>
                                ))}
                              </div>
                              {/* Mark unavailable (delete) */}
                              <button
                                type="button"
                                onClick={() => removeVariant(idx)}
                                className="ml-4 px-2 py-1 text-xs border border-red-300 text-red-600 rounded"
                              >
                                Remove
                              </button>
                            </div>
                            {/* Per-variant image/video upload */}
                            <div className="mt-3 flex flex-col gap-2">
                              <label className="block text-xs text-gray-600 mb-1">Images/Videos for this variant</label>
                              <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={async (e) => {
                                  const files = Array.from(e.target.files || []);
                                  if (!files.length || !selectedProduct) return;
                                  setUploading(true);
                                  setError(null);
                                  try {
                                    const uploaded = await uploadFiles('/media/upload', files, { folder: 'products' });
                                    const images = (uploaded.assets || [])
                                      .filter(a => a.resourceType === 'image')
                                      .map((a, i) => ({
                                        url: a.url,
                                        publicId: a.publicId,
                                        isPrimary: i === 0,
                                        colorName: variant.color?.name,
                                        size: variant.size
                                      }));
                                    const videos = (uploaded.assets || [])
                                      .filter(a => a.resourceType === 'video')
                                      .map((a) => ({
                                        url: a.url,
                                        publicId: a.publicId,
                                        colorName: variant.color?.name,
                                        size: variant.size
                                      }));
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
                                }}
                                className="w-full"
                              />
                              {/* Show images/videos for this variant */}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {variantMedia.length === 0 && <span className="text-xs text-gray-400">No media uploaded for this variant.</span>}
                                {variantMedia.map((media, mIdx) => (
                                  <div key={media.publicId || media.url} className="relative group">
                                    {media.url.match(/\.(mp4|webm|ogg)$/i) ? (
                                      <video src={media.url} controls className="w-24 h-24 object-cover rounded" />
                                    ) : (
                                      <LazyImage src={media.url} alt={media.alt || ''} className="w-24 h-24 object-cover rounded" />
                                    )}
                                    <button
                                      onClick={()=>removeImage(selectedProduct._id, media.publicId)}
                                      className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-600 text-xs px-1 py-0.5 rounded hidden group-hover:block"
                                    >Remove</button>
                                    {media.isPrimary && (
                                      <span className="absolute bottom-1 left-1 bg-black text-white text-[10px] px-1 py-0.5 rounded">Primary</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={addVariant} className="mt-4 px-3 py-2 border border-black rounded bg-white text-black text-sm">Add Variant</button>
                  </div>
                )}

                {/* Images Grid (filtered by Active Color unless Show all) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {((selectedProduct.images || []).filter(img => showAllImages || !activeColor || (img.colorName || '') === activeColor)).map((img, idx) => (
                    <div key={img.publicId || img.url} className="relative group">
                      <LazyImage src={img.url} alt={img.alt || ''} className="w-full h-40 object-cover rounded" />
                      <button
                        onClick={()=>removeImage(selectedProduct._id, img.publicId)}
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 text-xs px-2 py-1 rounded hidden group-hover:block"
                      >Remove</button>
                      <button
                        onClick={()=>makePrimary(selectedProduct._id, img.publicId, idx)}
                        className="absolute top-2 left-2 bg-white/80 hover:bg-white text-black text-xs px-2 py-1 rounded hidden group-hover:block"
                      >Make Primary</button>
                      {img.colorName && (
                        <span className="absolute bottom-2 right-2 bg-white/80 text-black text-[10px] px-2 py-0.5 rounded">{img.colorName}</span>
                      )}
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
