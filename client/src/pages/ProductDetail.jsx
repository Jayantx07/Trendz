import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  ShoppingBag, 
  Share2, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { apiFetch } from '../utils/api.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getProductBySlug, localProducts, slugify } from '../utils/localProducts.js';
import LazyImage from '../components/common/LazyImage.jsx';
import { useMedia } from '../context/MediaMapContext.jsx';

const ProductDetail = () => {
  const { resolve } = useMedia();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/products/${slug}`);
        if (!res.ok) throw new Error('api_unavailable');
        const data = await res.json();
        if (!isMounted) return;
        setProduct(data);

        if (data.variants && data.variants.length > 0) {
          const first = data.variants[0];
          const firstSize = Array.isArray(first.sizes) && first.sizes.length ? first.sizes[0] : first.size;
          setActiveVariantIndex(0);
          setSelectedSize(firstSize || '');
        }
      } catch (e) {
        // Fallback to local catalog
        const local = getProductBySlug(slug);
        if (local) {
          if (!isMounted) return;
          setProduct(local);
          // Set simple defaults
          setSelectedColor(local.colors?.[0] || '');
          setSelectedSize(local.sizes?.[0] || '');
          setError(null);
        } else {
          if (!isMounted) return;
          setError('Product not found');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [slug]);

  // When active variant changes, ensure selectedSize is valid for that variant
  useEffect(() => {
    if (!product) return;
    const v = (product.variants || [])[activeVariantIndex];
    if (!v) return;
    const sizes = Array.from(new Set((Array.isArray(v.sizes) && v.sizes.length) ? v.sizes : (v.size ? [v.size] : []))).filter(Boolean);
    if (sizes.length === 0) {
      setSelectedSize('');
      return;
    }
    if (!sizes.includes(selectedSize)) {
      setSelectedSize(sizes[0]);
      setCurrentImageIndex(0);
    }
  }, [activeVariantIndex, product]);

  // Helpers for dates (computed each render)
  const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const now = Date.now();
  const estStart = fmtDate(now + 3 * 24 * 60 * 60 * 1000);
  const estEnd = fmtDate(now + 7 * 24 * 60 * 60 * 1000);
  const fastDispatch = fmtDate(now + 2 * 24 * 60 * 60 * 1000);
  const currentSlug = product ? slugify(product.name || slug) : slug;

  const requireAuth = (action) => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${slug}` } });
      return false;
    }
    if (typeof action === 'function') action();
    return true;
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const variants = product.variants || [];
    const activeVariant = variants[activeVariantIndex] || null;

    // Compute variant-specific images at the time of adding to cart
    // Priority: 1) variant.images array, 2) product.images filtered by variantIndex, 3) product.images filtered by variantId
    let variantMedia = [];
    
    // First, check if this specific variant has its own images array
    if (activeVariant && Array.isArray(activeVariant.images) && activeVariant.images.length > 0) {
      variantMedia = activeVariant.images;
    }
    // If not, filter product-level images by this variant
    else if (Array.isArray(product?.images)) {
      // Try to match by Mongoose _id first (most reliable)
      const mongooseVariantId = activeVariant?._id ? String(activeVariant._id) : null;
      
      variantMedia = product.images.filter(img => {
        // Match by Mongoose subdocument _id
        if (mongooseVariantId && img.variantId && String(img.variantId) === mongooseVariantId) {
          return true;
        }
        // Match by variantIndex
        if (typeof img.variantIndex === 'number' && img.variantIndex === activeVariantIndex) {
          return true;
        }
        return false;
      });

      // If no images matched, fall back to all product images
      if (variantMedia.length === 0) {
        variantMedia = product.images;
      }
    }

    const computedImageUrls = Array.isArray(variantMedia)
      ? variantMedia
          .filter(im => !im.url || !im.url.match(/\.(mp4|webm|ogg)$/i))
          .map((im) => (typeof im === 'string' ? im : im?.url))
          .filter(Boolean)
          .map((u) => resolve(u))
      : (product?.primaryImage ? [resolve(product.primaryImage)] : []);

    // Use the first image of this variant as the cart cover photo
    const variantCoverImage = computedImageUrls[0] || null;

    console.log('🛒 ADD TO CART DEBUG:', {
      activeVariantIndex,
      mongooseId: activeVariant?._id,
      variantId: activeVariant?.variantId,
      hasVariantImages: activeVariant?.images?.length || 0,
      variantMediaCount: variantMedia.length,
      computedImageUrlsCount: computedImageUrls.length,
      variantCoverImage,
      productImagesTotal: product?.images?.length || 0,
    });

    const variant = {
      variantIndex: activeVariantIndex,
      variantId: activeVariant?._id ? String(activeVariant._id) : undefined, // Use Mongoose subdocument _id as primary identifier
      size: selectedSize,
      imageUrl: variantCoverImage, // Use the first image of this variant as cover
    };

    addToCart(product, quantity, variant);
    showToast('Added to your bag');
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    requireAuth(() => {
      const pid = product._id || product.id;
      if (isInWishlist(pid)) {
        removeFromWishlist(pid);
        showToast('Removed from wishlist');
      } else {
        addToWishlist(product);
        showToast('Saved to wishlist');
      }
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-tenor font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Compute prices & images only once product is available
  const curPrice = (product?.salePrice ?? product?.price ?? product?.basePrice) || 0;
  const origPrice = product?.salePrice ? (product?.price ?? product?.basePrice) : null;
   const variants = product.variants || [];
   const activeVariant = variants[activeVariantIndex] || null;
   const activeVariantStock = Number(activeVariant?.stock ?? 0);
   const isVariantUnavailable = !activeVariant || activeVariantStock <= 0;
  // Filter images/videos for selected variant (using variantIndex/variantId)
  let variantMedia = [];
  if (Array.isArray(product?.images)) {
    const activeVariantId = activeVariant?.variantId;

    variantMedia = product.images.filter(img => {
      if (activeVariantId && img.variantId) return img.variantId === activeVariantId;
      if (typeof img.variantIndex === 'number') return img.variantIndex === activeVariantIndex;
      return false;
    });

    if (variantMedia.length === 0) {
      // fallback to all images if nothing mapped yet
      variantMedia = product.images;
    }
  }
  const imageUrls = Array.isArray(variantMedia)
    ? variantMedia
        .filter(im => !im.url || !im.url.match(/\.(mp4|webm|ogg)$/i))
        .map((im) => (typeof im === 'string' ? im : im?.url))
        .filter(Boolean)
        .map((u) => resolve(u))
    : (product?.primaryImage ? [resolve(product.primaryImage)] : []);
  const videoUrls = Array.isArray(variantMedia)
    ? variantMedia
        .filter(im => im.url && im.url.match(/\.(mp4|webm|ogg)$/i))
        .map((im) => (typeof im === 'string' ? im : im?.url))
        .filter(Boolean)
        .map((u) => resolve(u))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-20 right-6 z-40">
          <div className="bg-black text-white px-5 py-3 rounded-full shadow-lg text-sm font-medium tracking-wide flex items-center gap-2 animate-fade-in-up">
            <span className="inline-block w-2 h-2 rounded-full bg-accent"></span>
            <span>{toast}</span>
          </div>
        </div>
      )}
      <div className="container pt-16 pb-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <button onClick={() => navigate('/')} className="hover:text-accent transition-colors rounded-[3px]">
                Home
              </button>
            </li>
            <li>/</li>
            <li>
              <button onClick={() => navigate('/products')} className="hover:text-accent transition-colors rounded-[3px]">
                Products
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images & Videos (per variant) */}
          <div className="space-y-4">
            {/* Main Image/Video */}
            <div className="relative aspect-[3/4] bg-white rounded-lg overflow-hidden flex items-center justify-center">
              {imageUrls.length > 0 ? (
                <LazyImage
                  src={imageUrls[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setShowZoom(true)}
                />
              ) : videoUrls.length > 0 ? (
                <video src={videoUrls[0]} controls className="w-full h-full object-cover rounded" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No media</div>
              )}

              {/* Navigation Arrows (only for images) */}
              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black text-white hover:bg-black/90 p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black text-white hover:bg-black/90 p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}

              {/* Zoom Icon (only for images) */}
              {imageUrls.length > 0 && (
                <button
                  onClick={() => setShowZoom(true)}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                >
                  <ZoomIn className="w-5 h-5 text-black" />
                </button>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 space-y-2">
                {product.isNew && (
                  <span className="badge-new">New</span>
                )}
              </div>
            </div>

            {/* Thumbnail Images (only for images) */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {imageUrls.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex 
                        ? 'border-accent' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <LazyImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
            {/* Video thumbnails (if any) */}
            {videoUrls.length > 0 && (
              <div className="flex gap-2 mt-2">
                {videoUrls.map((video, vIdx) => (
                  <video key={vIdx} src={video} controls className="w-20 h-20 object-cover rounded" />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500 uppercase tracking-wide">
                  {product.category}
                </span>
                {product.isNew && (
                  <span className="text-xs bg-accent text-white px-2 py-1 rounded">
                    New
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-tenor font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              {origPrice ? (
                <>
                  <span className="text-3xl font-tenor font-bold text-gray-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(curPrice)}</span>
                  <span className="text-xl text-gray-500 line-through">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(origPrice)}</span>
                  <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">
                    Save {Math.round(((origPrice - curPrice) / origPrice) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-tenor font-bold text-gray-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(curPrice)}</span>
              )}
            </div>

            {/* Variant Selection (driven by primary image) */}
            <div className="mb-6">
              <h3 className="text-sm font-tenor text-gray-900 mb-3">More Options</h3>
              <div className="flex gap-3 flex-wrap items-start">
                {variants.map((v, idx) => {
                  // try to find a primary image for this variant
                  const primary = (product.images || []).find(img => {
                    if (v.variantId && img.variantId === v.variantId) return true;
                    if (typeof img.variantIndex === 'number' && img.variantIndex === idx) return true;
                    return false;
                  });
                  const thumbUrl = primary ? resolve(primary.url) : (imageUrls[0] || (product.primaryImage ? resolve(product.primaryImage) : null));
                  if (!thumbUrl) return null;
                  const isActive = idx === activeVariantIndex;
                  const isThisUnavailable = Number(v?.stock ?? 0) <= 0;
                  return (
                    <div key={v.variantId || idx} className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveVariantIndex(idx)}
                        className={`w-16 h-20 rounded-md overflow-hidden border-2 ${isActive ? 'border-black' : 'border-gray-200 hover:border-gray-300'} transition-colors`}
                      >
                        <LazyImage src={thumbUrl} alt={product.name} className="w-full h-full object-cover" />
                      </button>
                      <div className="h-4 flex items-center justify-center">
                        {isThisUnavailable && (
                          <span className="text-[11px] leading-none text-red-600 font-medium">Unavailable</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Size & Quantity only when variant is available */}
            {!isVariantUnavailable && (
              <>
                {/* Size Selection (per color, respects multi-size variants) */}
                <div className="mb-6">
                  <h3 className="text-sm font-tenor text-gray-900 mb-3">Size</h3>
                  <div className="flex gap-2 flex-wrap">
                    {['XS','S','M','L','XL','XXL'].map(sz => {
                      const v = (product.variants || [])[activeVariantIndex];
                      const available = !!v && (
                        (Array.isArray(v.sizes) && v.sizes.includes(sz)) ||
                        v.size === sz
                      );
                      return (
                        <button
                          key={sz}
                          onClick={() => available && setSelectedSize(sz)}
                          disabled={!available}
                          className={`px-4 py-2 rounded border text-sm font-medium transition-colors relative
                            ${selectedSize === sz && available ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}
                            ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{ minWidth: 48 }}
                        >
                          {sz}
                          {!available && (
                            <span className="absolute left-0 top-1/2 w-full h-0.5 bg-red-500 rotate-[-20deg]" style={{ top: '50%' }}></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <h3 className="text-sm font-tenor text-gray-900 mb-3">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-black hover:border-gray-400 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium text-black">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-black hover:border-gray-400 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!isVariantUnavailable && (
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary flex-1 text-lg py-4 rounded-[3px]"
                >
                  Add to Cart
                </motion.button>
              )}
              
              <motion.button
                onClick={handleWishlistToggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-lg border transition-colors ${
                  isInWishlist(product.id)
                    ? 'border-black bg-black text-white hover:opacity-90'
                    : 'border-black bg-black text-white hover:opacity-90'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </motion.button>
              
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-lg border border-black bg-black text-white hover:opacity-90 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Shipping Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-black" />
                <div>
                  <p className="font-medium text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">3-5 business days</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-black" />
                <div>
                  <p className="font-medium text-gray-900">Free Returns</p>
                  <p className="text-sm text-gray-600">30 days</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-black" />
                <div>
                  <p className="font-medium text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-600">SSL encrypted</p>
                </div>
              </div>
            </div>

            {/* Product Details Section - Enhanced */}
            <div className="border-t border-gray-200 pt-6">
              <details open className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none mb-4">
                  <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    PRODUCT DETAILS
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </h3>
                </summary>
                
                <div className="space-y-6">
                  {/* Description */}
                  {product.productDetails?.description && (
                    <div className="text-gray-700 leading-relaxed">
                      <p className="text-sm md:text-base whitespace-pre-line">
                        {product.productDetails.description.replace(/\*/g, '×')}
                      </p>
                    </div>
                  )}

                  {/* Material & Care */}
                  {product.productDetails?.materialAndCare && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Material & Care</h4>
                      <div className="text-gray-700 text-sm whitespace-pre-line">
                        {product.productDetails.materialAndCare.replace(/\*/g, '×')}
                      </div>
                    </div>
                  )}

                  {/* Specifications */}
                  {product.productDetails?.specifications && product.productDetails.specifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Specifications</h4>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                        {product.productDetails.specifications.map((spec, idx) => (
                          <React.Fragment key={idx}>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">{spec.label.replace(/\*/g, '×')}</div>
                            <div className="text-sm text-gray-900">{spec.value.replace(/\*/g, '×')}</div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback to legacy description if no productDetails */}
                  {!product.productDetails?.description && product.description && (
                    <div className="text-gray-700 leading-relaxed">
                      <p className="text-sm md:text-base whitespace-pre-line">
                        {product.description.replace(/\*/g, '×')}
                      </p>
                    </div>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Reviews</h2>
          {product.reviews && product.reviews.length === 0 && (
            <div className="text-gray-500">No reviews yet.</div>
          )}
          {product.reviews && product.reviews.length > 0 && (
            <ul className="divide-y divide-gray-200">
              {product.reviews.map((review, idx) => (
                <li key={idx} className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-black">{review.user?.firstName || 'User'}</span>
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                    ))}
                  </div>
                  <div className="text-gray-800">{review.comment}</div>
                </li>
              ))}
            </ul>
          )}/
        </div>
      </div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {showZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setShowZoom(false)}
          >
            <div className="relative max-w-4xl max-h-full">
              <img
                src={imageUrls[currentImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
                loading="lazy"
                decoding="async"
              />
              
              <button
                onClick={() => setShowZoom(false)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;