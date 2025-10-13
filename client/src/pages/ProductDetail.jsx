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
import { getProductBySlug, localProducts, slugify } from '../utils/localProducts.js';
import LazyImage from '../components/common/LazyImage.jsx';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

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
          setSelectedColor(data.variants[0].color?.name || '');
          setSelectedSize(data.variants[0].size || '');
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
    // Normalize images array to URL strings
    const imageUrls = Array.isArray(product?.images)
      ? product.images.map((im) => (typeof im === 'string' ? im : im?.url)).filter(Boolean)
      : [];
    return () => { isMounted = false; };
  }, [slug]);

  // Helpers for dates (computed each render)
  const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const now = Date.now();
  const estStart = fmtDate(now + 3 * 24 * 60 * 60 * 1000);
  const estEnd = fmtDate(now + 7 * 24 * 60 * 60 * 1000);
  const fastDispatch = fmtDate(now + 2 * 24 * 60 * 60 * 1000);
  const currentSlug = product ? slugify(product.name || slug) : slug;

  const handleAddToCart = () => {
    const productWithOptions = {
      ...product,
      selectedOptions: {
        color: selectedColor,
        size: selectedSize,
      },
    };
    addToCart(productWithOptions, quantity);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
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
    const curPrice = product.salePrice ?? product.price ?? product.basePrice;
  const origPrice = product.salePrice ? (product.price ?? product.basePrice) : null;

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

  return (
    <div className="min-h-screen bg-gray-50">
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
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-white rounded-lg overflow-hidden">
              <LazyImage
                src={imageUrls[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setShowZoom(true)}
              />
              
              {/* Navigation Arrows */}
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

              {/* Zoom Icon */}
              <button
                onClick={() => setShowZoom(true)}
                className="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
              >
                <ZoomIn className="w-5 h-5 text-black" />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 space-y-2">
                {product.isNew && (
                  <span className="badge-new">New</span>
                )}
                {(product.onSale || product.isOnSale) && (origPrice && curPrice) && (
                  <span className="badge-sale">
                    {Math.round(((origPrice - curPrice) / origPrice) * 100)}% Off
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
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
                <p className="text-gray-600 mt-2 text-sm md:text-base">{(product.description || "").slice(0, 140)}{(product.description || "").length > 140 ? "…" : ""}</p>
              
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
                  <span className="text-3xl font-bold text-gray-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(curPrice)}</span>
                  <span className="text-xl text-gray-500 line-through">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(origPrice)}</span>
                  <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                    {Math.round(((origPrice - curPrice) / origPrice) * 100)}% Off
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(curPrice)}</span>
              )}
            </div>

            {/* Description (moved under title; hide long block here) */}
            <div className="hidden">
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-tenor text-gray-900 mb-3">Color: {selectedColor}</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-colors ${
                      selectedColor === color 
                        ? 'border-accent' 
                        : 'border-black bg-black text-white hover:opacity-90'
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-tenor text-gray-900 mb-3">Size: {selectedSize}</h3>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-accent bg-accent text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
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

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex-1 text-lg py-4 rounded-[3px]"
              >
                Add to Cart
              </motion.button>
              
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
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['Description', 'Features', 'Care', 'Reviews'].map((tab) => (
                <button
                  key={tab}
                  className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            <div className="prose max-w-none">
              <h3 className="text-xl font-tenor font-bold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {product.longDescription}
              </p>

              <h3 className="text-xl font-tenor font-bold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-2 mb-6">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-tenor font-bold text-gray-900 mb-4">Care Instructions</h3>
              <ul className="space-y-2">
                {product.care.map((instruction, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          </div>
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