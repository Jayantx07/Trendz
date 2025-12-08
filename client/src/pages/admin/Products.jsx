import React, { useEffect, useState, useRef } from 'react';
import { apiAuthFetch, uploadFiles } from '../../utils/api.js';
import AdminRoute from '../../components/common/AdminRoute.jsx';
import LazyImage from '../../components/common/LazyImage.jsx';
import { ChevronDown, ArrowLeft } from 'lucide-react';

const AdminInner = () => {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [draft, setDraft] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  // Store uploaded images per variant in local state for instant UI update
  const [variantImages, setVariantImages] = useState({}); // { [variantKey]: [images] }
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageColor, setImageColor] = useState('');
  const [imageSizes, setImageSizes] = useState([]);
  const [imagePrice, setImagePrice] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const imageInputRef = useRef();
  const [sizesUpdatingFor, setSizesUpdatingFor] = useState(null);
  const [perVariantUpdating, setPerVariantUpdating] = useState(null);

  const SIZES = ['XS','S','M','L','XL','XXL'];

  const getVariantKey = (variant, idx) => {
    if (variant && variant.variantId) return `variant_${variant.variantId}`;
    return `variant_${idx}`;
  };

  // Toggle a size for a specific variant row only (multi-select, no lag).
  const toggleSizeForVariant = async (variantIndexClicked, sizeToToggle) => {
    // Draft-only: just update local state
    if (!selectedProduct || !selectedProduct._id) {
      setDraft(d => {
        const arr = [...(d?.variants || [])];
        const current = { ...(arr[variantIndexClicked] || {}) };
        const currentSizes = Array.isArray(current.sizes) && current.sizes.length
          ? [...current.sizes]
          : (current.size ? [current.size] : []);
        const has = currentSizes.includes(sizeToToggle);
        const nextSizes = has
          ? currentSizes.filter(s => s !== sizeToToggle)
          : [...currentSizes, sizeToToggle];
        current.sizes = nextSizes;
        current.size = nextSizes[0] || undefined;
        arr[variantIndexClicked] = current;
        return { ...d, variants: arr };
      });
      return;
    }

    const existingVariants = Array.isArray(selectedProduct.variants)
      ? selectedProduct.variants
      : [];
    const targetVariant = existingVariants[variantIndexClicked];
    if (!targetVariant) return;

    const currentSizes = Array.isArray(targetVariant.sizes) && targetVariant.sizes.length
      ? targetVariant.sizes.map(s => s.toString())
      : (targetVariant.size ? [targetVariant.size.toString()] : []);
    const hasSize = currentSizes.some(s => norm(s) === norm(sizeToToggle));

    const newSizes = hasSize
      ? currentSizes.filter(s => norm(s) !== norm(sizeToToggle))
      : [...currentSizes, sizeToToggle];

    const payloadVariants = existingVariants.map((v, i) => (
      i === variantIndexClicked
        ? { ...v, sizes: newSizes, size: newSizes[0] || undefined }
        : v
    ));

    // Optimistic local update for snappy UI
    setSelectedProduct(sp => (sp ? { ...sp, variants: payloadVariants } : sp));
    setDraft(d => (d ? { ...d, variants: payloadVariants } : d));

    const res = await apiAuthFetch(`/admin/products/${selectedProduct._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variants: payloadVariants })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error || err.message || 'Failed to update variant sizes');
    }
  };

  const norm = (v) => (v || '').toString().trim().toLowerCase();

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

  // Load products on initial mount so list is populated without manual refresh
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedProduct) { setDraft(null); return; }
    // Only initialise draft when it is empty or for a different product.
    setDraft((prev) => {
      if (prev && prev._id === selectedProduct._id) return prev;
      return {
        _id: selectedProduct._id,
        name: selectedProduct.name || '',
        description: selectedProduct.description || '',
        productDetails: {
          description: selectedProduct.productDetails?.description || '',
          materialAndCare: selectedProduct.productDetails?.materialAndCare || '',
          specifications: Array.isArray(selectedProduct.productDetails?.specifications)
            ? selectedProduct.productDetails.specifications.map(s => ({ label: s.label || '', value: s.value || '' }))
            : []
        },
        category: selectedProduct.category || 'party-wear',
        gender: 'women',
        basePrice: Number(selectedProduct.basePrice || 0),
        salePrice: Number(selectedProduct.salePrice || 0),
        isOnSale: !!selectedProduct.isOnSale,
        variants: Array.isArray(selectedProduct.variants) ? selectedProduct.variants.map(v => ({
          variantId: v.variantId || undefined,
          size: v.size || 'M',
          sizes: Array.isArray(v.sizes) ? v.sizes : undefined,
          stock: Number(v.stock ?? 0),
          sku: v.sku || '',
          price: Number(v.price ?? 0),
          salePrice: v.salePrice != null ? Number(v.salePrice) : undefined,
          isOnSale: !!v.isOnSale,
        })) : []
      };
    });
    // no color-based state any more
  }, [selectedProduct]);

  const updateDraft = (key, val) => setDraft((d) => ({ ...d, [key]: val }));

  const slugify = (s='') => String(s).toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const updateVariant = (index, key, value) => {
    setDraft(d => {
      const arr = [...(d?.variants || [])];
      const v = { ...(arr[index] || {}) };
      v[key] = value;
      arr[index] = v;
      return { ...d, variants: arr };
    });
  };

  const addVariant = () => {
    setDraft(d => {
      const list = d?.variants || [];
      const newVariant = {
        size: undefined,
        sizes: [],
        stock: 10,
        sku: '',
        price: Number(d?.basePrice || 0),
        salePrice: '',
        isOnSale: false
      };
      return { ...d, variants: [...list, newVariant] };
    });
  };

  const removeVariant = async (index) => {
    if (!draft) return;
    // If this variant exists on the server, persist removal there first
    if (selectedProduct && selectedProduct._id && index < (selectedProduct.variants || []).length) {
      setUploading(true);
      setError(null);
      try {
        const serverVariants = selectedProduct.variants || [];
        const variantToRemove = serverVariants[index];
        const updatedVariants = serverVariants.filter((_, i) => i !== index);

        // Build list of publicIds for images tied to this variant (by variantId or variantIndex)
        const variantIdToRemove = variantToRemove?.variantId;
        const variantIndexToRemove = index;
        const productImages = selectedProduct.images || [];
        const imagesToDetach = productImages.filter(img => {
          if (variantIdToRemove && img.variantId === variantIdToRemove) return true;
          if (typeof img.variantIndex === 'number' && img.variantIndex === variantIndexToRemove) return true;
          return false;
        });

        const res = await apiAuthFetch(`/admin/products/${selectedProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variants: updatedVariants })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || 'Failed to remove variant');
        }
        const updated = await res.json();
        setSelectedProduct(updated);

        // After variant removal, detach any images tied to that variant from the product
        for (const img of imagesToDetach) {
          if (!img.publicId) continue;
          const safeId = encodeURIComponent(img.publicId);
          // Fire and forget; individual failures won't block variant deletion
          // eslint-disable-next-line no-await-in-loop
          await apiAuthFetch(`/admin/products/${selectedProduct._id}/images/${safeId}`, {
            method: 'DELETE'
          });
        }

        await fetchProducts();
      } catch (e) {
        setError(e.message || 'Failed to remove variant');
      } finally {
        setUploading(false);
      }
    } else {
      // local-only draft variant removal
      setDraft(d => ({ ...d, variants: (d?.variants || []).filter((_, i) => i !== index) }));
    }
  };

  // Update sizes selected for a given color and persist changes to server
  const updateSizesForColor = async (colorName, newSizes) => {
    if (!colorName) return;
    // update UI immediately
    setPerColorSelectedSizes(prev => ({ ...prev, [colorName]: newSizes }));
    setSizesUpdatingFor(colorName);

    try {
      // If no selectedProduct on server, just update draft
      if (!selectedProduct || !selectedProduct._id) {
        // Update draft.variants by keeping only variants for other colors, and adding new sizes for this color
        setDraft(d => {
          const existing = d?.variants || [];
          const kept = existing.filter(v => (v.color?.name || '') !== colorName);
          const existingSizes = existing.filter(v => (v.color?.name || '') === colorName).map(v => v.size);
          const toAdd = (newSizes || []).filter(s => !existingSizes.includes(s)).map(s => ({
            size: s,
            color: { name: colorName, hex: '' },
            stock: 10,
            sku: '',
            price: 0,
            salePrice: '',
            isOnSale: false
          }));
          return { ...d, variants: [...kept, ...toAdd] };
        });
        return;
      }

      // Build merged variants for server: preserve existing variants except remove those of this color whose size is not in newSizes
      const existingVariants = Array.isArray(selectedProduct.variants) ? selectedProduct.variants : [];
      const normC = (s) => (s || '').toString().trim().toLowerCase();
      const desiredSizes = (newSizes || []).map(s => s.toString());

      const keep = [];
      const existingForColor = [];
      existingVariants.forEach(v => {
        if (normC(v.color?.name) === normC(colorName)) {
          existingForColor.push(v);
          if (desiredSizes.includes(v.size)) {
            // keep this variant and preserve metadata
            keep.push(v);
          }
          // else drop it
        } else {
          keep.push(v);
        }
      });

      // Determine sizes that need new variants
      const existingSizes = existingForColor.map(v => v.size);
      const sizesToAdd = desiredSizes.filter(s => !existingSizes.includes(s));
      const templateVariant = existingForColor[0] || existingVariants[0] || null;
      const defaultPrice = templateVariant ? (templateVariant.price || templateVariant.basePrice || 0) : (selectedProduct.basePrice || 0);

      const toAdd = sizesToAdd.map(s => ({
        size: s,
        color: { name: colorName, hex: '' },
        stock: 10,
        sku: '',
        price: Number(defaultPrice || 0),
        salePrice: '',
        isOnSale: false
      }));

      const payloadVariants = [...keep, ...toAdd];

      const res = await apiAuthFetch(`/admin/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants: payloadVariants })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Failed to update sizes for color');
      }
      const updated = await res.json();
      // Refresh products list and selected product
      setSelectedProduct(updated);
      await fetchProducts();
      // update draft to reflect persisted variants
      setDraft(d => ({ ...d, variants: Array.isArray(updated.variants) ? updated.variants.map(v => ({
        variantId: v.variantId || undefined,
        size: v.size,
        sizes: Array.isArray(v.sizes) ? v.sizes : undefined,
        color: { name: v.color?.name || '', hex: v.color?.hex || '' },
        stock: Number(v.stock ?? 0),
        sku: v.sku || '',
        price: Number(v.price ?? 0),
        salePrice: v.salePrice != null ? Number(v.salePrice) : undefined,
        isOnSale: !!v.isOnSale
      })) : [] }));
    } catch (e) {
      setError(e.message || 'Failed to update sizes');
    } finally {
      setSizesUpdatingFor(null);
    }
  };

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
        brand: 'VASAAE',
        category: 'party-wear',
        gender: 'women',
        basePrice: 0,
        status: 'active',
        images: [],
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
        const msg = err.error || err.message || JSON.stringify(err) || 'Failed to create product';
        throw new Error(msg);
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

  const buildVariantPayloadFromDraft = (d) => (
    Array.isArray(d?.variants)
      ? d.variants.map(v => ({
          variantId: v.variantId || undefined,
          size: v.size,
          sizes: Array.isArray(v.sizes) ? v.sizes : undefined,
          stock: Number(v.stock || 0),
          sku: v.sku || undefined,
          price: Number(v.price || 0),
          salePrice: v.salePrice != null && v.salePrice !== '' ? Number(v.salePrice) : undefined,
          isOnSale: !!v.isOnSale,
        }))
      : undefined
  );

  const saveProduct = async () => {
    if (!draft) return;
    setUploading(true);
    setError(null);
    try {
      // Wait for any in-progress per-variant updates to finish
      const waitForIdle = async (timeout = 5000) => {
        const start = Date.now();
        while ((perVariantUpdating || sizesUpdatingFor) && (Date.now() - start) < timeout) {
          // small delay
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 150));
        }
        if (perVariantUpdating || sizesUpdatingFor) {
          throw new Error('Please wait for pending variant updates to finish before saving');
        }
      };
      await waitForIdle();

      const payload = {
        name: draft.name,
        slug: slugify(draft.name), // Update slug based on product name
        description: draft.description,
        productDetails: {
          description: draft.productDetails?.description || '',
          materialAndCare: draft.productDetails?.materialAndCare || '',
          specifications: Array.isArray(draft.productDetails?.specifications)
            ? draft.productDetails.specifications.filter(s => s.label && s.value)
            : []
        },
        category: draft.category,
        gender: 'women',
        basePrice: Number(draft.basePrice || 0),
        salePrice: Number(draft.salePrice || 0),
        isOnSale: !!draft.isOnSale,
        variants: buildVariantPayloadFromDraft(draft),
      };

      // If we have any locally reordered variant images, build a reordered
      // images array for the product so the exact order is persisted.
      if (selectedProduct && Array.isArray(selectedProduct.images) && Object.keys(variantImages || {}).length > 0) {
        const byKeyLocal = {};
        Object.entries(variantImages).forEach(([vk, arr]) => {
          if (!Array.isArray(arr)) return;
          arr.forEach((m) => {
            const k = (m.publicId || m.url || '').toString();
            if (!k) return;
            if (!byKeyLocal[k]) byKeyLocal[k] = m;
          });
        });

        const used = new Set();
        const reordered = [];

        // 1) Follow each variant's local order
        const serverVariants = Array.isArray(selectedProduct.variants) ? selectedProduct.variants : [];
        serverVariants.forEach((sv, idx) => {
          const key = sv?.variantId ? `variant_${sv.variantId}` : `variant_${idx}`;
          const localArr = Array.isArray(variantImages[key]) ? variantImages[key] : [];
          localArr.forEach((m) => {
            const k = (m.publicId || m.url || '').toString();
            if (!k || used.has(k)) return;
            const existing = (selectedProduct.images || []).find(img => (img.publicId || img.url) === (m.publicId || m.url));
            if (existing) {
              used.add(k);
              reordered.push({ ...existing });
            }
          });
        });

        // 2) Append any remaining images in their existing relative order
        (selectedProduct.images || []).forEach((img) => {
          const k = (img.publicId || img.url || '').toString();
          if (!k || used.has(k)) return;
          used.add(k);
          reordered.push({ ...img });
        });

        if (reordered.length) {
          payload.images = reordered;
        }
      }

      const res = await apiAuthFetch(`/admin/products/${draft._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save product');
      await fetchProducts();
      const updated = (await res.json());
      setSelectedProduct(updated);
      // Once saved, clear local reordering cache so future edits start from
      // the server-persisted order.
      setVariantImages({});
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
      // Reload the selected product with fresh data
      const refreshRes = await apiAuthFetch(`/admin/products/${selectedProduct._id}`);
      if (refreshRes.ok) {
        const refreshed = await refreshRes.json();
        setSelectedProduct(refreshed);
        // reset any local reordering cache so we reflect saved order
        setVariantImages({});
      }
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
      // Clear local variantImages cache so order reflects latest server state
      setVariantImages({});
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

  // Handle image upload for variant (persist variants first, then attach images with variantId)
  const handleAddImage = async () => {
    if (imageSizes.length === 0 || !imagePrice || Number(imagePrice) <= 0 || imageFiles.length === 0) {
      setError('Please select at least one size, price > 0, and image.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadFiles('/media/upload', imageFiles, { folder: 'products' });
      const imageAssets = (uploaded.assets || []).filter(a => a.resourceType === 'image');

      // Each selected size becomes its own variant for the current product.
      const newVariants = imageSizes.map(sz => ({
        size: sz,
        sizes: [sz],
        stock: 10,
        sku: '',
        price: Number(imagePrice),
        salePrice: '',
        isOnSale: false,
      }));

      if (selectedProduct && selectedProduct._id) {
        const existingCount = Array.isArray(selectedProduct.variants) ? selectedProduct.variants.length : 0;

        if (newVariants.length > 0) {
          const variantsPayload = [...(selectedProduct.variants || []), ...newVariants];
          const updRes = await apiAuthFetch(`/admin/products/${selectedProduct._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ variants: variantsPayload })
          });
          if (!updRes.ok) throw new Error('Failed to persist new variants before attaching media');
          const updated = await updRes.json();
          setSelectedProduct(updated);
        }

        const refreshedRes = await apiAuthFetch(`/admin/products/${selectedProduct._id}`);
        let refreshed = selectedProduct;
        if (refreshedRes.ok) refreshed = await refreshedRes.json();

        const allVariants = Array.isArray(refreshed.variants) ? refreshed.variants : [];
        const newServerVariants = allVariants.slice(existingCount);

        const toPersist = [];
        newServerVariants.forEach((v, idx) => {
          const variantIndex = existingCount + idx;
          imageAssets.forEach(imgAsset => {
            toPersist.push({
              url: imgAsset.url,
              publicId: imgAsset.publicId,
              isPrimary: false,
              size: v.size,
              variantIndex,
              variantId: v.variantId,
            });
          });
        });

        // Update local draft for immediate UI
        setDraft(d => ({
          ...d,
          variants: [...(d?.variants || []), ...newVariants],
          images: [...(d?.images || []), ...(toPersist || [])]
        }));

        if (toPersist.length) {
          const res = await apiAuthFetch(`/admin/products/${selectedProduct._id}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: toPersist })
          });
          if (!res.ok) throw new Error('Failed to attach images');
          const refreshed2 = await (await apiAuthFetch(`/admin/products/${selectedProduct._id}`)).json();
          setSelectedProduct(refreshed2);
        }
      }

      setShowImageModal(false);
      setImageColor('');
      setImageSizes([]);
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
        <h2 className="text-lg font-semibold mb-4">Add Variants & Images</h2>
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

  const filteredProducts = products.filter(p => !productSearch.trim() || p.name?.toLowerCase().includes(productSearch.trim().toLowerCase()));
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="">
        {showImageModal && renderImageModal()}
        {error && <div className="mb-4 text-red-600">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          <div className={`lg:col-span-1 bg-white border border-gray-200 rounded-lg p-4 ${selectedProduct ? 'hidden lg:block' : 'block'}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-black">Products</h2>
              <div className="flex items-center gap-3">
                <button onClick={createProduct} className="text-sm text-black border border-gray-300 rounded px-2 py-1">Add</button>
                <button onClick={fetchProducts} className="text-sm text-accent">Refresh</button>
              </div>
            </div>

            <div className="mb-3">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by name..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder:text-gray-400"
              />
            </div>

            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <ul className="divide-y divide-gray-100">
                  {visibleProducts.map((p) => (
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
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {p.primaryImage || (p.images && p.images[0]?.url) ? (
                          <LazyImage src={p.primaryImage || p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">No image</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.category}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {visibleCount < filteredProducts.length && (
                <button 
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-black py-2 border border-dashed border-gray-300 rounded hover:border-gray-400 transition-colors"
                >
                  View more <ChevronDown size={16} />
                </button>
              )}
              </>
            )}
          </div>

          <div 
            className={`lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 ${selectedProduct ? 'fixed inset-0 z-50 overflow-y-auto m-0 rounded-none lg:static lg:z-auto lg:m-0 lg:rounded-lg' : 'hidden lg:block'}`}
            style={{ scrollbarWidth: 'thin' }}
          >
            {selectedProduct && (
               <button onClick={() => setSelectedProduct(null)} className="lg:hidden mb-4 flex items-center gap-2 text-gray-600 font-medium">
                 <ArrowLeft size={20} /> Back to Products
               </button>
            )}
            {!selectedProduct ? (
              <div className="text-gray-600">Select a product to manage images and details.</div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-lg font-semibold text-black">Edit Product</h3>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!selectedProduct?._id) return;
                        setUploading(true);
                        setError(null);
                        try {
                          const res = await apiAuthFetch(`/admin/products/${selectedProduct._id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: selectedProduct.status === 'inactive' ? 'active' : 'inactive' })
                          });
                          if (!res.ok) throw new Error('Failed to toggle availability');
                          const updated = await res.json();
                          setSelectedProduct(updated);
                          await fetchProducts();
                        } catch (e) {
                          setError(e.message || 'Failed to toggle availability');
                        } finally {
                          setUploading(false);
                        }
                      }}
                      className="px-3 py-1 rounded border border-gray-300 bg-white text-xs text-black"
                    >
                      {selectedProduct?.status === 'inactive' ? 'Unavailabled' : 'Availabled'}
                    </button>
                    <button onClick={saveProduct} disabled={uploading || !draft || !!perVariantUpdating || !!sizesUpdatingFor} className={`px-3 py-1 rounded border border-gray-300 bg-white text-black text-sm ${(uploading || perVariantUpdating || sizesUpdatingFor)? 'opacity-50' : ''}`}>Save</button>
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
                        <option value="kurti">Kurti</option>
                        <option value="one-piece">One Piece</option>
                        <option value="dungaree">Dungaree</option>
                        <option value="gown">Gown</option>
                        <option value="lehenga">Lehenga</option>
                        <option value="co-ord-set">Co-ord Set</option>
                        <option value="ethnic-dress">Ethnic Dress</option>
                        <option value="western-dress">Western Dress</option>
                        <option value="party-wear">Party Wear</option>
                        <option value="casual-wear">Casual Wear</option>
                      </select>
                    </div>
                    {/* Gender field removed - site is women-only */}
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
                  </div>
                )}

                {/* Product Details Section */}
                {draft && (
                  <div className="mb-6 border-t pt-6">
                    <h4 className="text-lg font-semibold text-black mb-4">Product Details</h4>
                    
                    <div className="space-y-4">
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          rows={4}
                          value={draft.productDetails?.description || ''}
                          onChange={(e) => setDraft(d => ({
                            ...d,
                            productDetails: { ...(d.productDetails || {}), description: e.target.value }
                          }))}
                          placeholder="Enter product description..."
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder:text-gray-400"
                        />
                      </div>

                      {/* Material & Care */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Material & Care</label>
                        <textarea
                          rows={3}
                          value={draft.productDetails?.materialAndCare || ''}
                          onChange={(e) => setDraft(d => ({
                            ...d,
                            productDetails: { ...(d.productDetails || {}), materialAndCare: e.target.value }
                          }))}
                          placeholder="e.g., 60% Cotton, 40% Polyester\nMachine wash"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder:text-gray-400"
                        />
                      </div>

                      {/* Specifications */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Specifications</label>
                          <button
                            type="button"
                            onClick={() => setDraft(d => ({
                              ...d,
                              productDetails: {
                                ...(d.productDetails || {}),
                                specifications: [...(d.productDetails?.specifications || []), { label: '', value: '' }]
                              }
                            }))}
                            className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 font-medium"
                          >
                            + Add Specification
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(draft.productDetails?.specifications || []).map((spec, idx) => (
                            <div key={idx} className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Label (e.g., Sleeve Length)"
                                value={spec.label}
                                onChange={(e) => {
                                  const specs = [...(draft.productDetails?.specifications || [])];
                                  specs[idx] = { ...specs[idx], label: e.target.value };
                                  setDraft(d => ({
                                    ...d,
                                    productDetails: { ...(d.productDetails || {}), specifications: specs }
                                  }));
                                }}
                                className="border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder:text-gray-400"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Value (e.g., Long Sleeves)"
                                  value={spec.value}
                                  onChange={(e) => {
                                    const specs = [...(draft.productDetails?.specifications || [])];
                                    specs[idx] = { ...specs[idx], value: e.target.value };
                                    setDraft(d => ({
                                      ...d,
                                      productDetails: { ...(d.productDetails || {}), specifications: specs }
                                    }));
                                  }}
                                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-black placeholder:text-gray-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const specs = (draft.productDetails?.specifications || []).filter((_, i) => i !== idx);
                                    setDraft(d => ({
                                      ...d,
                                      productDetails: { ...(d.productDetails || {}), specifications: specs }
                                    }));
                                  }}
                                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                          {(!draft.productDetails?.specifications || draft.productDetails.specifications.length === 0) && (
                            <p className="text-xs text-gray-500 italic">No specifications added yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}



                {draft && (
                  <div className="mb-6">
                    {/* Cover Photo Notice */}
                    {(!selectedProduct?.images || selectedProduct.images.length === 0) && (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 font-medium">⚠️ No cover photo uploaded</p>
                        <p className="text-xs text-yellow-700 mt-1">Upload at least one image for each variant below. The first image with isPrimary=true will be used as the product cover photo.</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-md font-semibold text-black">Variants</h4>
                    </div>
                    <div className="flex flex-col gap-6">
                      {(draft.variants || []).map((variant, idx) => {
                        // Use a stable variantKey: prefer server-side variantId, fall back to local index
                        const serverVariantForIdx = (selectedProduct?.variants || [])[idx];
                        const variantKey = serverVariantForIdx?.variantId
                          ? `variant_${serverVariantForIdx.variantId}`
                          : getVariantKey(variant, idx);
                        
                        // Build variant media deterministically:
                        // 1) start with images on the variant itself (preferred)
                        // 2) include product-level images that match by variantId
                        // 3) if no variantId, include product-level images that match by variantIndex
                        // Finally merge with any local `variantImages[variantKey]` and dedupe by publicId/url preserving isPrimary
                        const serverHasVariant = Array.isArray(selectedProduct?.variants) && idx < selectedProduct.variants.length;
                        let serverMedia = [];
                        if (serverHasVariant) {
                          const serverVariant = (selectedProduct.variants || [])[idx] || null;
                          // 1) variant.images if present
                          if (serverVariant && Array.isArray(serverVariant.images) && serverVariant.images.length) {
                            serverMedia = serverMedia.concat(serverVariant.images);
                          }
                          // 2) product-level images with matching variantId (authoritative mapping)
                          if (serverVariant && serverVariant.variantId) {
                            serverMedia = serverMedia.concat((selectedProduct.images || []).filter(img => img.variantId === serverVariant.variantId));
                          } else {
                            // 3) fallback: images with variantIndex equal to this index when no variantId yet
                            serverMedia = serverMedia.concat((selectedProduct.images || []).filter(img => typeof img.variantIndex === 'number' && img.variantIndex === idx));
                          }
                        }

                        // Local images (new uploads not yet in server or shown instantly)
                        const localMedia = variantImages[variantKey] || [];

                        // Merge and dedupe preserving isPrimary (serverWins order but local can add new items)
                        const byKey = {};
                        const pushDedup = (m) => {
                          const k = (m.publicId || m.url || '').toString();
                          if (!k) return;
                          if (!byKey[k]) byKey[k] = { ...m };
                          else {
                            // preserve isPrimary if any source marked it
                            if (m.isPrimary) byKey[k].isPrimary = true;
                          }
                        };

                        // Prefer serverMedia order (already prioritized above)
                        serverMedia.forEach(pushDedup);
                        // Then include local uploads (they may be duplicates or new)
                        localMedia.forEach(pushDedup);

                        // Final variantMedia array used for rendering. If we have a reordered
                        // list in variantImages[variantKey], prefer that so drag/drop is
                        // reflected immediately in the UI.
                        let variantMedia = Array.isArray(variantImages[variantKey]) && variantImages[variantKey].length
                          ? variantImages[variantKey]
                          : Object.values(byKey);
                        // If there is no server variant at all yet (freshly added draft variant), show only local media
                        if (!serverHasVariant) {
                          variantMedia = Array.isArray(variantImages[variantKey]) && variantImages[variantKey].length
                            ? variantImages[variantKey]
                            : localMedia.slice();
                        }
                        return (
                          <div key={idx} className="border-b pb-4 mb-2">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                                    {/* Variant header: show primary image thumbnail if available, else index circle */}
                                    <div className="flex flex-col items-center gap-2">
                                      {(() => {
                                        const vServer = (selectedProduct?.variants || [])[idx];
                                        const vid = vServer?.variantId;

                                        // If this row has no server variant yet and no local media, show only placeholder
                                        if (!vServer && (!variantMedia || variantMedia.length === 0)) {
                                          return (
                                            <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center bg-white text-xs font-medium">
                                              {idx + 1}
                                            </div>
                                          );
                                        }

                                        let primaryImg = null;
                                        if (vServer && Array.isArray(selectedProduct?.images)) {
                                          primaryImg = (selectedProduct.images || []).find(img => {
                                            if (vid && img.variantId === vid) return true;
                                            if (typeof img.variantIndex === 'number' && img.variantIndex === idx) return true;
                                            return false;
                                          });
                                        }

                                        // If no server-mapped image, but this variant has local media, use its first local image
                                        if (!primaryImg && Array.isArray(variantMedia) && variantMedia.length > 0) {
                                          const firstLocal = variantMedia.find(m => m.url);
                                          if (firstLocal) {
                                            return (
                                              <LazyImage
                                                src={firstLocal.url}
                                                alt={selectedProduct?.name || ''}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-black"
                                              />
                                            );
                                          }
                                        }

                                        if (primaryImg) {
                                          return (
                                            <LazyImage
                                              src={primaryImg.url}
                                              alt={selectedProduct?.name || ''}
                                              className="w-12 h-12 rounded-full object-cover border-2 border-black"
                                            />
                                          );
                                        }

                                        return (
                                          <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center bg-white text-xs font-medium">
                                            {idx + 1}
                                          </div>
                                        );
                                      })()}
                                      <span className="text-[11px] text-gray-500">Variant {idx + 1}</span>
                                    </div>
                                    {/* Per-variant multi-size selector */}
                              <div className="w-full sm:w-auto">
                                <label className="block text-xs text-gray-600 mb-1">Sizes for this variant (toggle to enable/disable)</label>
                                <div className="flex gap-2 flex-wrap">
                                  {SIZES.map(sz => {
                                    const cname = variant.color?.name || '';
                                    const isThisVariantSize = norm(variant.size) === norm(sz);
                                    const inSizesArray = Array.isArray(variant.sizes) && variant.sizes.map(s=>s.toString()).some(s => norm(s) === norm(sz));
                                    const sel = isThisVariantSize || inSizesArray;
                                    return (
                                      <button
                                        key={`multi_${sz}_${idx}`}
                                        type="button"
                                        onClick={() => toggleSizeForVariant(idx, sz)}
                                        className={`px-3 py-1 rounded text-sm ${sel ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'} border`}
                                      >{sz}</button>
                                    );
                                  })}
                                </div>
                              </div>
                              {/* Variant actions */}
                              <div className="flex flex-col gap-1 w-full sm:w-auto sm:ml-auto">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!draft) return;

                                    // Determine current availability for this variant
                                    const currentVariant = (draft.variants || [])[idx] || {};
                                    const currentlyUnavailable = Number(currentVariant.stock ?? 0) === 0;
                                    const nextStock = currentlyUnavailable ? 10 : 0; // simple toggle between 0 and default 10

                                    // Update draft optimistically
                                    setDraft(d => {
                                      const arr = [...(d?.variants || [])];
                                      const v = { ...(arr[idx] || {}) };
                                      v.stock = nextStock;
                                      arr[idx] = v;
                                      return { ...d, variants: arr };
                                    });

                                    if (!selectedProduct?._id) return; // local-only product not yet saved

                                    try {
                                      const updatedVariants = (selectedProduct.variants || []).map((v, i) => (
                                        i === idx ? { ...v, stock: nextStock } : v
                                      ));

                                      setSelectedProduct(sp => (sp ? { ...sp, variants: updatedVariants } : sp));

                                      const res = await apiAuthFetch(`/admin/products/${selectedProduct._id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ variants: updatedVariants })
                                      });
                                      if (!res.ok) {
                                        const err = await res.json().catch(() => ({}));
                                        setError(err.error || err.message || 'Failed to toggle variant availability');
                                      }
                                    } catch (e) {
                                      setError(e.message || 'Failed to toggle variant availability');
                                    }
                                  }}
                                  className="px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded"
                                >
                                  {Number(variant.stock ?? 0) === 0 ? 'Unavailabled' : 'Availabled'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeVariant(idx)}
                                  className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded"
                                >
                                  Remove
                                </button>
                              </div>
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
                                    // Upload assets to media endpoint
                                    const uploaded = await uploadFiles('/media/upload', files, { folder: 'products' });

                                    const imageAssets = (uploaded.assets || []).filter(a => a.resourceType === 'image');
                                    const videoAssets = (uploaded.assets || []).filter(a => a.resourceType === 'video');

                                    // If any draft variants are not yet on the server, persist ALL draft variants first
                                    const serverVariantCount = Array.isArray(selectedProduct?.variants) ? selectedProduct.variants.length : 0;
                                    if (draft && (draft.variants || []).length !== serverVariantCount) {
                                      const variantsPayload = buildVariantPayloadFromDraft(draft);
                                      const updRes = await apiAuthFetch(`/admin/products/${selectedProduct._id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ variants: variantsPayload })
                                      });
                                      if (!updRes.ok) throw new Error('Failed to persist new variant before attaching media');
                                      const updated = await updRes.json();
                                      setSelectedProduct(updated);
                                    }

                                    // Ensure we have the up-to-date server product so we can resolve the correct variant index
                                    const prodRes = await apiAuthFetch(`/admin/products/${selectedProduct._id}`);
                                    let prodForIndex = selectedProduct;
                                    if (prodRes.ok) prodForIndex = await prodRes.json();
                                    const targetIdx = (prodForIndex.variants || []).findIndex(v => {
                                      if (v.variantId && variant.variantId) return v.variantId === variant.variantId;
                                      return false;
                                    });
                                    const variantIndexToUse = targetIdx >= 0 ? targetIdx : idx;
                                    const variantIdToUse = (prodForIndex.variants && prodForIndex.variants[variantIndexToUse]) ? prodForIndex.variants[variantIndexToUse].variantId : undefined;

                                    // Prepare images/videos payloads including variantId (and variantIndex as fallback)
                                    const images = imageAssets.map((a, i) => ({
                                      url: a.url,
                                      publicId: a.publicId,
                                      isPrimary: i === 0,
                                      // if this variant exposes multiple sizes, don't attach a specific size
                                      size: Array.isArray(variant.sizes) && variant.sizes.length ? undefined : variant.size,
                                      variantIndex: variantIndexToUse,
                                      variantId: variantIdToUse
                                    }));
                                    const videos = videoAssets.map(a => ({
                                      url: a.url,
                                      publicId: a.publicId,
                                      size: Array.isArray(variant.sizes) && variant.sizes.length ? undefined : variant.size,
                                      variantIndex: variantIndexToUse,
                                      variantId: variantIdToUse
                                    }));

                                    // Update local state for instant UI
                                    setVariantImages(prev => ({
                                      ...prev,
                                      [variantKey]: [
                                        ...(prev[variantKey] || []),
                                        ...images,
                                        ...videos
                                      ]
                                    }));

                                    // Persist to backend
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

                                    // Refresh the selected product to get updated images
                                    const refreshRes = await apiAuthFetch(`/admin/products/${selectedProduct._id}`);
                                    if (refreshRes.ok) {
                                      const refreshed = await refreshRes.json();
                                      setSelectedProduct(refreshed);
                                    }
                                  } catch (err) {
                                    setError(err.message || 'Failed to upload media');
                                  } finally {
                                    setUploading(false);
                                    e.target.value = '';
                                  }
                                }}
                                className="w-full"
                              />
                              {/* Show images/videos for this variant with drag-and-drop sorting */}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {variantMedia.length === 0 && <span className="text-xs text-gray-400">No media uploaded for this variant.</span>}
                                {variantMedia.map((media, mIdx) => (
                                  <div
                                    key={media.publicId || media.url}
                                    className="relative group cursor-default flex flex-col items-center gap-1"
                                    draggable
                                    onDragStart={e => {
                                      e.dataTransfer.setData('text/plain', String(mIdx));
                                      // make entire tile feel draggable
                                      e.currentTarget.classList.add('cursor-grabbing');
                                    }}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => {
                                      e.preventDefault();
                                      const fromIdxRaw = e.dataTransfer.getData('text/plain');
                                      const fromIdx = Number(fromIdxRaw);
                                      if (Number.isNaN(fromIdx) || fromIdx === mIdx) return;

                                      setVariantImages(prev => {
                                        const base = prev[variantKey] && prev[variantKey].length
                                          ? prev[variantKey]
                                          : variantMedia;
                                        const current = [...base];
                                        if (fromIdx < 0 || fromIdx >= current.length) return prev;
                                        const [moved] = current.splice(fromIdx, 1);
                                        current.splice(mIdx, 0, moved);

                                        // Ensure only the first item is marked primary in local state
                                        const normalised = current.map((item, idx2) => ({
                                          ...item,
                                          isPrimary: idx2 === 0,
                                        }));

                                        // Persist primary change when a new first item exists
                                        const first = normalised[0];
                                        if (first && first.publicId && selectedProduct?._id) {
                                          makePrimary(selectedProduct._id, first.publicId, undefined);
                                        }

                                        return { ...prev, [variantKey]: normalised };
                                      });
                                    }}
                                  >
                                    {media.url.match(/\.(mp4|webm|ogg)$/i) ? (
                                      <video src={media.url} controls className="w-24 h-24 object-cover rounded" />
                                    ) : (
                                      <LazyImage src={media.url} alt={media.alt || ''} className="w-24 h-24 object-cover rounded" />
                                    )}
                                    {/* Drag handle dots at bottom center */}
                                    <div className="mt-1 flex items-center justify-center w-full">
                                      <div className="w-6 h-3 flex items-center justify-between text-gray-400 group-hover:text-black cursor-grab active:cursor-grabbing">
                                        <span className="w-1 h-1 rounded-full bg-current" />
                                        <span className="w-1 h-1 rounded-full bg-current" />
                                        <span className="w-1 h-1 rounded-full bg-current" />
                                      </div>
                                    </div>
                                    <button
                                      onClick={async ()=>{
                                        await removeImage(selectedProduct._id, media.publicId);
                                        // Remove from local state instantly
                                        setVariantImages(prev => {
                                          const arr = [...(prev[variantKey] || [])];
                                          const idx = arr.findIndex(m => m.publicId === media.publicId);
                                          if (idx !== -1) arr.splice(idx, 1);
                                          return { ...prev, [variantKey]: arr };
                                        });
                                        // Do NOT call fetchProducts here, to avoid overwriting local state and causing flicker
                                      }}
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
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={addVariant}
                        className="px-4 py-2 text-xs border border-gray-300 rounded bg-white text-black hover:bg-gray-50"
                      >
                        + Add Variant
                      </button>
                    </div>
                    {/* Global color+size adder removed: per-variant selectors handle sizes now */}
                  </div>
                )}


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
