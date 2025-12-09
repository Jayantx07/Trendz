import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  Search,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { slugify } from '../utils/localProducts.js';
import LazyImage from '../components/common/LazyImage.jsx';
import { apiFetch } from '../utils/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useMedia } from '../context/MediaMapContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const FILTER_CATEGORIES = [
  { label: 'Kurti', value: 'kurti' },
  { label: 'One Piece', value: 'one-piece' },
  { label: 'Dungaree', value: 'dungaree' },
  { label: 'Gown', value: 'gown' },
  { label: 'Lehenga', value: 'lehenga' },
  { label: 'Co-ord Set', value: 'co-ord-set' },
  { label: 'Ethnic Dress', value: 'ethnic-dress' },
  { label: 'Western Dress', value: 'western-dress' },
  { label: 'Party Wear', value: 'party-wear' },
  { label: 'Casual Wear', value: 'casual-wear' }
];

const PRICE_RANGES = [
  { label: 'Under ₹500', value: '0-500' },
  { label: '₹500 - ₹1,000', value: '500-1000' },
  { label: '₹1,000 - ₹2,000', value: '1000-2000' },
  { label: '₹2,000 - ₹5,000', value: '2000-5000' },
  { label: 'Over ₹5,000', value: '5000-999999' },
];

const FILTER_DISCOUNTS = [
  { label: '10% and above', value: '10' },
  { label: '20% and above', value: '20' },
  { label: '30% and above', value: '30' },
  { label: '40% and above', value: '40' },
  { label: '50% and above', value: '50' },
  { label: '60% and above', value: '60' },
  { label: '70% and above', value: '70' },
  { label: '80% and above', value: '80' },
  { label: '90% and above', value: '90' },
];

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <span className="font-bold text-gray-900 text-sm uppercase tracking-wider">{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Products = () => {
  const { resolve, ready } = useMedia();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  
  const query = searchParams.get('q') || '';
  const [localSearch, setLocalSearch] = useState(query);

  // Sync local state with URL query on mount/navigation
  useEffect(() => {
    if (query !== localSearch) {
      setLocalSearch(query);
    }
  }, [query]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      const currentQ = params.get('q') || '';
      const newQ = localSearch.trim();

      if (currentQ !== newQ) {
        if (newQ) {
          params.set('q', newQ);
        } else {
          params.delete('q');
        }
        params.set('page', '1');
        setSearchParams(params);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, searchParams, setSearchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearch.trim()) {
      params.set('q', localSearch.trim());
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    priceRange: searchParams.get('priceRange') || '',
    brand: searchParams.get('brand') || '',
    discount: searchParams.get('discount') || '',
    onSale: searchParams.get('onSale') === 'true',
    inStock: searchParams.get('inStock') === 'true',
    newArrival: searchParams.get('newArrival') === 'true',
  });

  // Sync filters from URL
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      gender: searchParams.get('gender') || '',
      priceRange: searchParams.get('priceRange') || '',
      brand: searchParams.get('brand') || '',
      discount: searchParams.get('discount') || '',
      onSale: searchParams.get('onSale') === 'true',
      inStock: searchParams.get('inStock') === 'true',
      newArrival: searchParams.get('newArrival') === 'true',
    });
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();

    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters.category) params.append('category', filters.category);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.discount) params.append('discount', filters.discount);
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-');
      if (min) params.append('minPrice', min);
      if (max) params.append('maxPrice', max);
    }
    if (filters.onSale) params.append('onSale', 'true');
    if (filters.inStock) params.append('inStock', 'true');
    if (filters.newArrival) params.append('newArrivals', 'true');
    if (sortBy && sortBy !== 'relevance') params.append('sort', sortBy);
    params.append('page', currentPage);
    params.append('limit', 48);

    apiFetch(`/products?${params.toString()}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        const apiList = Array.isArray(data?.products) ? data.products.map(p => {
          const raw = p.primaryImage || (p.images && p.images[0]?.url) || p.image || '';
          const filled = raw ? resolve(raw) : '';
          return { ...p, image: filled, primaryImage: filled };
        }) : [];
        setProducts(apiList);
        setHasMore(Boolean(data.pagination?.hasNext));
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to fetch products');
          setProducts([]);
          setHasMore(false);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [filters, sortBy, currentPage, query, ready, resolve]);

  const handleFilterChange = (key, value, type = 'single') => {
    let newValue;
    
    if (type === 'multi') {
      const current = filters[key] ? filters[key].split(',').filter(Boolean) : [];
      if (current.includes(value)) {
        newValue = current.filter(item => item !== value).join(',');
      } else {
        newValue = [...current, value].join(',');
      }
    } else {
      // Toggle for single select (like radio behavior but unselectable) or just set
      newValue = filters[key] === value ? '' : value;
    }

    // Special case for boolean flags
    if (typeof value === 'boolean') {
      newValue = value;
    }

    const newFilters = { ...filters, [key]: newValue };
    setFilters(newFilters);
    
    const params = new URLSearchParams(searchParams);
    if (newValue) {
      params.set(key, newValue);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      gender: '',
      priceRange: '',
      brand: '',
      discount: '',
      onSale: false,
      inStock: false,
      newArrival: false,
    });
    setSearchParams({});
  };

  const handleAddToCart = (product) => {
    const slug = product.slug || (product._id ? product._id : slugify(product.name || product.id));
    navigate(`/products/${slug}`);
  };

  const handleWishlistToggle = (product) => {
    const productId = product._id || product.id;
    const image = resolve(product.image || product.primaryImage || '');
    
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
      showToast('Item removed from wishlist', 'info', image);
    } else {
      if (user) {
        addToWishlist(product);
        showToast('Item added to wishlist', 'success', image);
      } else {
        localStorage.setItem('pendingWishlist', JSON.stringify(product));
        navigate('/login', { state: { from: location.pathname } });
      }
    }
  };

  const renderProductCard = (product) => {
    const slug = product.slug || (product._id ? product._id : slugify(product.name || product.id));
    const go = () => navigate(`/products/${slug}`);
    const imageSrc = resolve(product.image || product.primaryImage || '');
    const curPrice = product.salePrice || product.price || product.basePrice;
    const origPrice = product.salePrice ? (product.price || product.basePrice) : null;
    const hasDiscount = origPrice && curPrice < origPrice;
    
    if (!imageSrc) return null;
    
    return (
      <motion.div
        key={product._id || product.slug || slug}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        <div className="rounded-md overflow-hidden bg-white border border-gray-200 flex flex-col h-full hover:shadow-md transition-shadow duration-300">
          <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={go}>
            <LazyImage
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            />
            <div className="product-badges">
              {product.isNew && <span className="badge-new">New</span>}
            </div>
            
            {/* Persistent Wishlist Icon (Visible when NOT hovering) */}
            {isInWishlist(product._id || product.id) && (
              <div className="absolute top-2 right-2 z-10 transition-opacity duration-300 group-hover:opacity-0">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </div>
            )}

            {/* Quick Actions Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
               <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleWishlistToggle(product);
                }}
                className="w-full bg-white text-black py-2 text-sm font-medium rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product._id || product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                {isInWishlist(product._id || product.id) ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>
          </div>

          <div className="p-3 md:p-4 flex flex-col flex-1">
            <h3 className="text-gray-900 text-base font-medium mb-1 cursor-pointer hover:text-accent line-clamp-1">
              <button onClick={go} className="text-left w-full">
                {product.name}
              </button>
            </h3>
            <p className="text-sm text-gray-500 mb-2 line-clamp-1">{product.category}</p>

            <div className="flex flex-col gap-1 mb-3">
              {hasDiscount && (
                <span className="text-gray-400 line-through text-xs">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(origPrice)}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-normal text-lg">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(curPrice || 0)}
                </span>
                {hasDiscount && (
                  <span className="text-orange-500 text-xs font-medium">
                    ({Math.round(((origPrice - curPrice) / origPrice) * 100)}% OFF)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const removeFilter = (key, value) => {
    let newValue;
    if (key === 'category') {
      const current = filters[key] ? filters[key].split(',').filter(Boolean) : [];
      newValue = current.filter(item => item !== value).join(',');
    } else {
      newValue = '';
    }

    const newFilters = { ...filters, [key]: newValue };
    setFilters(newFilters);
    
    const params = new URLSearchParams(searchParams);
    if (newValue) {
      params.set(key, newValue);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const ActiveFilters = () => {
    const activeFilters = [];

    if (filters.category) {
      filters.category.split(',').forEach(cat => {
        const label = FILTER_CATEGORIES.find(c => c.value === cat)?.label || cat;
        activeFilters.push({ key: 'category', value: cat, label });
      });
    }
    if (filters.priceRange) {
      const label = PRICE_RANGES.find(r => r.value === filters.priceRange)?.label || filters.priceRange;
      activeFilters.push({ key: 'priceRange', value: filters.priceRange, label });
    }
    if (filters.discount) {
      const label = FILTER_DISCOUNTS.find(d => d.value === filters.discount)?.label || `${filters.discount}% and above`;
      activeFilters.push({ key: 'discount', value: filters.discount, label });
    }
    if (sortBy && sortBy !== 'relevance') {
      let label = 'Sort: Relevance';
      if (sortBy === 'newest') label = 'Sort: Newest';
      if (sortBy === 'price-low') label = 'Sort: Price Low to High';
      if (sortBy === 'price-high') label = 'Sort: Price High to Low';
      if (sortBy === 'rating') label = 'Sort: Highest Rated';
      
      activeFilters.push({ key: 'sort', value: sortBy, label });
    }

    if (activeFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {activeFilters.map((filter, idx) => (
          <div key={`${filter.key}-${filter.value}-${idx}`} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700 shadow-sm">
            <span>{filter.label}</span>
            <button 
              onClick={() => {
                if (filter.key === 'sort') {
                  setSortBy('relevance');
                } else {
                  removeFilter(filter.key, filter.value);
                }
              }}
              className="hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button 
          onClick={clearFilters}
          className="text-sm text-accent font-medium hover:underline ml-2"
        >
          Clear All
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container pt-24 md:pt-28 pb-12">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Fashion Store
              <span className="text-gray-500 font-normal ml-2">
                - {products.length} items
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Sort By */}
             <div className="relative group">
                <div className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 cursor-pointer hover:border-gray-400 bg-white">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {sortBy === 'price-low' ? 'Price: Low to High' : 
                     sortBy === 'price-high' ? 'Price: High to Low' : 
                     sortBy}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden hidden group-hover:block z-20">
                  {[
                    { label: 'Relevance', value: 'relevance' },
                    { label: 'Newest', value: 'newest' },
                    { label: 'Price: Low to High', value: 'price-low' },
                    { label: 'Price: High to Low', value: 'price-high' },
                    { label: 'Highest Rated', value: 'rating' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === opt.value ? 'font-bold text-accent' : 'text-gray-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>

        <ActiveFilters />

        <div className="flex gap-8 relative">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-gray-900">FILTERS</span>
                <button onClick={clearFilters} className="text-xs text-accent font-medium hover:underline">CLEAR ALL</button>
              </div>

              <FilterSection title="Categories">
                {FILTER_CATEGORIES.map(cat => (
                  <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.category.split(',').includes(cat.value)}
                        onChange={() => handleFilterChange('category', cat.value, 'multi')}
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 checked:border-accent checked:bg-accent transition-all"
                      />
                      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-black">{cat.label}</span>
                  </label>
                ))}
              </FilterSection>

              <FilterSection title="Price">
                {PRICE_RANGES.map(range => (
                  <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === range.value}
                        onChange={() => handleFilterChange('priceRange', range.value)}
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-accent checked:bg-white checked:border-[5px] transition-all"
                      />
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-black">{range.label}</span>
                  </label>
                ))}
              </FilterSection>

              <FilterSection title="Discount Range">
                {FILTER_DISCOUNTS.map(discount => (
                  <label key={discount.value} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        name="discount"
                        checked={filters.discount === discount.value}
                        onChange={() => handleFilterChange('discount', discount.value)}
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-accent checked:bg-white checked:border-[5px] transition-all"
                      />
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-black">{discount.label}</span>
                  </label>
                ))}
              </FilterSection>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="bg-black text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium"
            >
              <Filter className="w-4 h-4" />
              FILTERS
            </button>
          </div>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {showMobileFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileFilters(false)}
                  className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween' }}
                  className="fixed inset-y-0 right-0 w-full max-w-xs bg-white z-50 lg:hidden overflow-y-auto"
                >
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="font-bold text-lg">Filters</h2>
                    <button onClick={() => setShowMobileFilters(false)}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-4 space-y-6">
                    {/* Reusing filter sections for mobile */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm uppercase">Categories</h3>
                      {FILTER_CATEGORIES.map(cat => (
                        <label key={cat.value} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={filters.category.split(',').includes(cat.value)}
                            onChange={() => handleFilterChange('category', cat.value, 'multi')}
                            className="rounded border-gray-300 text-accent focus:ring-accent"
                          />
                          <span className="text-sm text-gray-700">{cat.label}</span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm uppercase">Price</h3>
                      {PRICE_RANGES.map(range => (
                        <label key={range.value} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="priceRangeMobile"
                            checked={filters.priceRange === range.value}
                            onChange={() => handleFilterChange('priceRange', range.value)}
                            className="text-accent focus:ring-accent"
                          />
                          <span className="text-sm text-gray-700">{range.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-sm uppercase">Discount Range</h3>
                      {FILTER_DISCOUNTS.map(discount => (
                        <label key={discount.value} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="discountMobile"
                            checked={filters.discount === discount.value}
                            onChange={() => handleFilterChange('discount', discount.value)}
                            className="text-accent focus:ring-accent"
                          />
                          <span className="text-sm text-gray-700">{discount.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
                    <div className="flex gap-4">
                      <button 
                        onClick={clearFilters}
                        className="flex-1 py-3 border border-gray-300 rounded text-sm font-medium"
                      >
                        Clear All
                      </button>
                      <button 
                        onClick={() => setShowMobileFilters(false)}
                        className="flex-1 py-3 bg-accent text-white rounded text-sm font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map(product => renderProductCard(product))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8 border-t border-gray-200 pt-8">
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    
                    <span className="text-sm text-gray-600">
                      Page <span className="font-medium text-gray-900">{currentPage}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
                    </span>

                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  We couldn't find any products matching your filters. Try adjusting your search or filter criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products; 