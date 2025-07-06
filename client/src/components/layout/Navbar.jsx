import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

const NAV_LINKS_LEFT = [
  { name: 'Sale', href: '/products?sale=true' },
  { name: 'Ready-to-Wear', href: '/products?category=ready-to-wear' },
  { name: 'Accessories', href: '/products?category=accessories' },
  { name: 'Discover', href: '/discover' },
];
const NAV_LINKS_RIGHT = [
  { name: 'Search', href: '/search' },
  { name: 'Customer Care', href: '/customer-care' },
  { name: 'Sign In', href: '/account/login' },
  { name: 'Bag', href: '/cart' },
];

const Navbar = () => {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Dynamic classes for color and background
  const navBg = isScrolled ? 'bg-white shadow-lg' : 'bg-transparent';
  const linkColor = isScrolled ? 'text-gray-900 hover:text-accent' : 'text-white hover:text-accent';

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
        ${navBg}
        ${showNavbar ? 'translate-y-0' : '-translate-y-full'}
      `}
      style={{ minHeight: '80px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-20 relative">
        {/* Hamburger for mobile */}
        <button
          className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-10 h-10 focus:outline-none"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span className={`transition-transform duration-500 ${mobileMenuOpen ? 'rotate-[360deg]' : ''}`}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </span>
        </button>
        {/* Left links (desktop only) */}
        <div className="flex-1 items-center gap-x-6 hidden md:flex">
          {NAV_LINKS_LEFT.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-sm font-medium transition-colors px-1 md:px-1.5 lg:px-2 whitespace-nowrap ${linkColor}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        {/* Center logo (always visible) */}
        <div className="flex-1 flex justify-center">
          <Link to="/">
            <img
              src={isScrolled ? '/images/Logo black.png' : '/images/Logo white.png'}
              alt="Trendz Logo"
              className="h-6 md:h-8 object-contain mx-auto"
              style={{ maxHeight: '32px' }}
            />
          </Link>
        </div>
        {/* Right links (desktop only) */}
        <div className="flex-1 items-center justify-end gap-x-4 hidden md:flex">
          {NAV_LINKS_RIGHT.map((link) => {
            if (link.name === 'Bag') {
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-medium transition-colors px-1 md:px-1.5 lg:px-2 whitespace-nowrap ${linkColor}`}
                >
                  {link.name}
                </Link>
              );
            }
            if (link.name === 'Sign In' && user) {
              return (
                <Link
                  key="Account"
                  to="/account"
                  className={`text-sm font-medium transition-colors px-1 md:px-1.5 lg:px-2 whitespace-nowrap ${linkColor}`}
                >
                  {link.name}
                </Link>
              );
            }
            if (link.name === 'Search') {
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-medium transition-colors px-1 md:px-1.5 lg:px-2 whitespace-nowrap ${linkColor}`}
                >
                  {link.name}
                </Link>
              );
            }
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium transition-colors px-1 md:px-1.5 lg:px-2 whitespace-nowrap ${linkColor}`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
        {/* Mobile menu overlay */}
        {/* Remove overlay for solid white background */}
        {/* Mobile menu */}
        <div
          className={`fixed top-0 left-0 w-3/4 max-w-xs h-full bg-white z-50 shadow-lg transition-transform duration-500
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Close button top right */}
          <button
            className="absolute top-4 right-4 text-black p-2 rounded-full focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={32} />
          </button>
          <div className="flex flex-col gap-8 p-8 pt-20">
            {NAV_LINKS_LEFT.concat(NAV_LINKS_RIGHT).map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-lg font-tenor text-black font-bold hover:text-accent transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 