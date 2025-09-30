import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ShoppingBag, User, Heart, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';

const MAIN_LINKS = [
  { name: 'HOME', href: '/' },
  // SHOP handled separately with dropdown
  { name: 'CONTACT', href: '/contact' },
  { name: 'ABOUT', href: '/about' },
];

const SHOP_CATEGORIES = [
  { name: 'Dresses', value: 'Dresses' },
  { name: 'Kurtas', value: 'Kurtas' },
  { name: 'Tops', value: 'Tops' },
  { name: 'Bottoms', value: 'Bottoms' },
];

const Navbar = () => {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [shopOpen, setShopOpen] = useState(false);
  const shopCloseTimer = useRef(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setIsScrolled(currentScrollY > 10);
          if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
            setShowNavbar(false); // scroll down, hide
          } else {
            setShowNavbar(true); // scroll up, show
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide navbar on route change (for smoothness)
  useEffect(() => {
    setShowNavbar(true);
  }, [location]);

  const cartItemCount = (cartItems || []).reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = (wishlistItems || []).length;

  // Dynamic classes for color and background - Oscar de la Renta style
  const navBg = isScrolled ? 'bg-white shadow-sm' : 'bg-transparent';
  const linkColor = isScrolled ? 'text-gray-900 hover:text-accent' : 'text-white hover:text-white/80';
  const logoSrc = isScrolled ? '/images/Logo black.png' : '/images/Logo white.png';

  const submitSearch = (e) => {
    e && e.preventDefault();
    const q = searchInput.trim();
    if (q) {
      navigate(`/products?q=${encodeURIComponent(q)}`);
      setShowSearch(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300
        ${navBg}
        ${showNavbar ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Navigation */}
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo - Left */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img
                  src={logoSrc}
                  alt="Trendz Logo"
                  className="h-8 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Center Links */}
            <div className="hidden lg:flex items-center space-x-8">
              {MAIN_LINKS.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-xs font-tenor tracking-wider transition-colors ${linkColor}`}
                >
                  {link.name}
                </Link>
              ))}

              {/* SHOP dropdown */}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (shopCloseTimer.current) {
                    clearTimeout(shopCloseTimer.current);
                    shopCloseTimer.current = null;
                  }
                  setShopOpen(true);
                }}
                onMouseLeave={() => {
                  if (shopCloseTimer.current) clearTimeout(shopCloseTimer.current);
                  shopCloseTimer.current = setTimeout(() => setShopOpen(false), 150);
                }}
              >
                <button
                  className={`flex items-center gap-1 text-xs font-tenor tracking-wider transition-colors ${linkColor}`}
                  onClick={() => setShopOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={shopOpen}
                >
                  SHOP <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {shopOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute left-0 top-full w-56 mt-2"
                      onMouseEnter={() => {
                        if (shopCloseTimer.current) {
                          clearTimeout(shopCloseTimer.current);
                          shopCloseTimer.current = null;
                        }
                        setShopOpen(true);
                      }}
                      onMouseLeave={() => {
                        if (shopCloseTimer.current) clearTimeout(shopCloseTimer.current);
                        shopCloseTimer.current = setTimeout(() => setShopOpen(false), 150);
                      }}
                    >
                      <div className="bg-white shadow-lg border border-gray-200 rounded-md p-2">
                        <div className="grid grid-cols-1">
                          {SHOP_CATEGORIES.map((c) => (
                            <Link
                              key={c.value}
                              to={`/products?category=${encodeURIComponent(c.value)}`}
                              className="px-3 py-1.5 text-xs font-tenor tracking-wider text-gray-800 hover:text-accent hover:bg-gray-50 rounded"
                            >
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Icons */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search */}
              <button
                className={`p-2 transition-colors ${linkColor}`}
                onClick={() => setShowSearch((s) => !s)}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User */}
              <Link
                to={user ? "/account" : "/login"}
                className={`p-2 transition-colors ${linkColor}`}
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" className={`p-2 relative transition-colors ${linkColor}`}>
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className={`p-2 relative transition-colors ${linkColor}`}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className={`w-6 h-6 ${linkColor}`} />
              ) : (
                <Menu className={`w-6 h-6 ${linkColor}`} />
              )}
            </button>
          </div>

          {/* Search Bar (desktop) */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="hidden lg:flex justify-center mt-0 mb-1"
              >
                <form onSubmit={submitSearch} className="w-full max-w-xl">
                  <div className="relative w-fit mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700/80" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10 pr-16 py-2 w-[180px] focus:w-[420px] transition-all duration-200 ease-out rounded-full bg-white text-sm text-gray-900 placeholder:text-gray-500 border border-gray-800/40 focus:border-gray-800/70 shadow-sm mx-auto"
                    />
                    <button type="submit" className="hidden" aria-hidden="true" />
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
                {MAIN_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="block px-3 py-2 text-sm font-tenor tracking-wide text-gray-900 hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* SHOP dropdown items shown inline on mobile */}
                <div className="pt-2">
                  <div className="px-3 py-2 text-xs text-gray-500">Shop by Categories</div>
                  {SHOP_CATEGORIES.map((c) => (
                    <Link
                      key={c.value}
                      to={`/products?category=${encodeURIComponent(c.value)}`}
                      className="block px-5 py-2 text-sm text-gray-900 hover:text-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>

                {/* Search input */}
                <div className="px-2 pt-3">
                  <form onSubmit={submitSearch} className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="flex-1 outline-none text-sm"
                    />
                    <button type="submit" className="text-sm text-accent">Go</button>
                  </form>
                </div>

                <Link
                  to={user ? "/account" : "/login"}
                  className="block px-3 py-2 text-sm font-tenor tracking-wide text-gray-900 hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {user ? "ACCOUNT" : "SIGN IN"}
                </Link>
                <Link
                  to="/wishlist"
                  className="block px-3 py-2 text-sm font-tenor tracking-wide text-gray-900 hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  WISHLIST ({wishlistCount})
                </Link>
                <Link
                  to="/cart"
                  className="block px-3 py-2 text-sm font-tenor tracking-wide text-gray-900 hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  BAG ({cartItemCount})
                </Link>
              </div>
            </div>
          )}
        </div>
    </nav>
  );
};

export default Navbar; 