import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ApiStatus from './components/common/ApiStatus.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import PrivateRoute from './components/common/PrivateRoute.jsx';
import AdminRoute from './components/common/AdminRoute.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Account from './pages/Account.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Admin from './pages/Admin.jsx';
import WhatsAppButton from './components/common/WhatsAppButton.jsx';

import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import { MediaMapProvider } from './context/MediaMapContext.jsx';
import { SiteConfigProvider } from './context/SiteConfigContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const hideFooter = location.pathname.startsWith('/account') || location.pathname === '/wishlist' || isAdmin;
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <SearchProvider>
            <MediaMapProvider>
            <SiteConfigProvider>
            <ToastProvider>
            <div className="min-h-screen flex flex-col">
              <ApiStatus />
              {!isAdmin && <Navbar />}
              <ScrollToTop />
              <main className="flex-1">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/account/*" element={<PrivateRoute><Account /></PrivateRoute>} />
                    <Route path="/admin/*" element={<AdminRoute><Admin /></AdminRoute>} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Routes>
                </AnimatePresence>
              </main>
              {!hideFooter && <Footer />}
              <WhatsAppButton phone="919079005217" message="Hi, I need help with VASAAE." />
            </div>
            </ToastProvider>
            </SiteConfigProvider>
            </MediaMapProvider>
          </SearchProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
