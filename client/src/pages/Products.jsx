import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  Grid, 
  List, 
  ChevronDown, 
  ChevronUp,
  Heart,
  ShoppingBag,
  Eye,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { slugify } from '../utils/localProducts.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    priceRange: searchParams.get('priceRange') || '',
    color: searchParams.get('color') || '',
    size: searchParams.get('size') || '',
    brand: searchParams.get('brand') || '',
    onSale: searchParams.get('onSale') === 'true',
    inStock: searchParams.get('inStock') === 'true',
    newArrival: searchParams.get('newArrival') === 'true',
  });

  const query = searchParams.get('q') || '';

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Build query string from filters
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters.category) params.append('category', filters.category);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.color) params.append('color', filters.color);
    if (filters.size) params.append('size', filters.size);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.onSale) params.append('onSale', 'true');
    if (filters.inStock) params.append('inStock', 'true');
    if (filters.newArrival) params.append('newArrivals', 'true');
    if (sortBy && sortBy !== 'relevance') params.append('sort', sortBy);
    params.append('page', currentPage);
    params.append('limit', 12);

    fetch(`/api/products?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        setProducts(data.products || []);
        setHasMore(data.pagination?.hasNext || false);
        setLoading(false);
      })
      .catch(err => {
        console.warn('API not available, using mock data:', err.message);
        // Use mock data as fallback
        const mockProducts = [
          {
            id: 1,
            name: 'Silk Evening Gown',
            price: 2800,
            salePrice: null,
            image: '/images/products/evening-gown-1.jpg',
            category: 'Evening',
            isNew: true,
            colors: ['Black', 'Navy', 'Burgundy'],
            sizes: ['XS', 'S', 'M', 'L', 'XL']
          },
          {
            id: 2,
            name: 'Floral Day Dress',
            price: 1200,
            salePrice: 960,
            image: '/images/products/day-dress-1.jpg',
            category: 'Day',
            isNew: true,
            colors: ['Blue', 'Pink', 'White'],
            sizes: ['XS', 'S', 'M', 'L']
          },
          {
            id: 3,
            name: 'Signature Handbag',
            price: 1800,
            salePrice: null,
            image: '/images/products/handbag-1.jpg',
            category: 'Accessories',
            isNew: true,
            colors: ['Black', 'Brown', 'Cream'],
            sizes: ['One Size']
          },
          {
            id: 4,
            name: 'Embroidered Blouse',
            price: 850,
            salePrice: null,
            image: '/images/products/blouse-1.jpg',
            category: 'Day',
            isNew: true,
            colors: ['White', 'Ivory', 'Pale Blue'],
            sizes: ['XS', 'S', 'M', 'L', 'XL']
          }
        ];
        const filtered = query
          ? mockProducts.filter(p => (`${p.name} ${p.category}`).toLowerCase().includes(query.toLowerCase()))
          : mockProducts;
        setProducts(filtered);
        setHasMore(false);
        setLoading(false);
      });
  }, [filters, sortBy, currentPage, query]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      gender: '',
      priceRange: '',
      color: '',
      size: '',
      brand: '',
      onSale: false,
      inStock: false,
      newArrival: false,
    });
    setSearchParams({});
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handleWishlistToggle = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const renderProductCard = (product) => {
    const slug = slugify(product.name || product.id);
    const go = () => navigate(`/products/${slug}`);
    return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="product-card-wrapper group"
    >
      <div className="product-card">
        <div className="product-image-container cursor-pointer" onClick={go}>
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
          
          {/* Badges */}
          <div className="product-badges">
            {product.isNew && (
              <span className="badge-new">New</span>
            )}
            {product.onSale && (
              <span className="badge-sale">
                {Math.round(((product.price - product.salePrice) / product.price) * 100)}% Off
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleWishlistToggle(product)}
              className="product-wishlist"
            >
              <Heart 
                className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddToCart(product)}
              className="product-wishlist"
            >
              <ShoppingBag className="w-4 h-4" />
            </motion.button>
            
            <button onClick={go}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="product-wishlist"
              >
                <Eye className="w-4 h-4" />
              </motion.button>
            </button>
          </div>
        </div>

        <div className="product-info">
          <div className="mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {product.category}
            </span>
          </div>
          
          <h3 className="product-title">
            <button onClick={go} className="hover:text-accent transition-colors">
              {product.name}
            </button>
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>
          
          <div className="product-price">
            {product.salePrice ? (
              <>
                <span className="product-current-price">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.salePrice)}
                </span>
                <span className="product-original-price">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}
                </span>
              </>
            ) : (
              <span className="product-current-price">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}
              </span>
            )}
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {product.colors && product.colors.slice(0, 3).map((color, colorIndex) => (
              <span
                key={colorIndex}
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
            {product.colors && product.colors.length > 3 && (
              <span className="text-xs text-gray-500">+{product.colors.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
  };

  const renderProductList = (product) => {
    const slug = slugify(product.name || product.id);
    const go = () => navigate(`/products/${slug}`);
    return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex gap-6">
        <div className="w-32 h-32 flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {product.category}
              </span>
              <h3 className="text-lg font-tenor text-gray-900 mt-1">
                <button onClick={go} className="hover:text-accent transition-colors">
                  {product.name}
                </button>
              </h3>
              <p className="text-sm text-gray-600 mt-2">{product.description}</p>
              
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="product-price mb-4">
                {product.salePrice ? (
                  <>
                    <span className="product-current-price">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.salePrice)}
                    </span>
                    <span className="product-original-price">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="product-current-price">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleWishlistToggle(product)}
                  className="p-2 rounded-full border border-gray-300 hover:border-accent transition-colors"
                >
                  <Heart 
                    className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddToCart(product)}
                  className="btn-primary px-4 py-2 text-sm rounded-[3px]"
                >
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-tenor font-bold text-gray-900 mb-2">
            Products
          </h1>
          <p className="text-gray-600">
            Discover our curated collection of elegant fashion pieces
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filter Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-700 hover:text-accent transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-accent transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* View Mode and Sort */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-gray-500 hover:text-accent'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-accent text-white' : 'text-gray-500 hover:text-accent'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
                    >
                      <option value="">All Categories</option>
                      <option value="Evening">Evening</option>
                      <option value="Day">Day</option>
                      <option value="Bridal">Bridal</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Jewelry">Jewelry</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
                    >
                      <option value="">All Prices</option>
                      <option value="0-500">Under ₹500</option>
                      <option value="500-1000">₹500 - ₹1,000</option>
                      <option value="1000-2000">₹1,000 - ₹2,000</option>
                      <option value="2000-5000">₹2,000 - ₹5,000</option>
                      <option value="5000-999999">Over ₹5,000</option>
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <select
                      value={filters.color}
                      onChange={(e) => handleFilterChange('color', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
                    >
                      <option value="">All Colors</option>
                      <option value="Black">Black</option>
                      <option value="White">White</option>
                      <option value="Navy">Navy</option>
                      <option value="Pink">Pink</option>
                      <option value="Blue">Blue</option>
                      <option value="Brown">Brown</option>
                      <option value="Cream">Cream</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                    </select>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <select
                      value={filters.size}
                      onChange={(e) => handleFilterChange('size', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
                    >
                      <option value="">All Sizes</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="One Size">One Size</option>
                    </select>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.onSale}
                      onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-gray-700">On Sale</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-gray-700">In Stock</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.newArrival}
                      onChange={(e) => handleFilterChange('newArrival', e.target.checked)}
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-gray-700">New Arrivals</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {products.length} products
          </p>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
            {products.map(product => 
              viewMode === 'grid' ? renderProductCard(product) : renderProductList(product)
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-tenor text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="btn-primary rounded-[3px]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products; 