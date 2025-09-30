import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react';
import OrderHistory from './OrderHistory.jsx';
import OrderDetail from './OrderDetail.jsx';

const Account = () => {
  const { user, loading, error, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User, path: '/account' },
    { id: 'orders', label: 'Order History', icon: Package, path: '/account/orders' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/account/wishlist' },
    { id: 'addresses', label: 'Addresses', icon: MapPin, path: '/account/addresses' },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard, path: '/account/payments' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/account/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 shadow-lg"
          >
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-tenor font-bold text-gray-900 mb-4">
              You are not logged in
            </h2>
            <p className="text-gray-600 mb-8">
              Please log in to access your account and view your orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register')}
                className="btn-secondary"
              >
                Create Account
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Check if we're on a sub-route
  const isSubRoute = location.pathname !== '/account';

  if (isSubRoute) {
    return (
      <Routes>
        <Route path="orders" element={<OrderHistory />} />
        <Route path="orders/:orderId" element={<OrderDetail />} />
        {/* Add other sub-routes here */}
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-tenor font-bold text-gray-900 mb-2">
            My Account
          </h1>
          <p className="text-gray-600">
            Manage your profile, orders, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-r from-accent to-accent-dark rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-tenor font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-accent text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </Link>
                  );
                })}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-tenor font-bold text-gray-900 mb-6">
                Profile Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-tenor font-semibold text-gray-900 mb-4">
                    Personal Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    
                    {user.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-medium text-gray-900">{user.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Stats */}
                <div>
                  <h3 className="text-lg font-tenor font-semibold text-gray-900 mb-4">
                    Account Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Package className="w-8 h-8 text-accent mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">0</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">0</p>
                      <p className="text-sm text-gray-600">Wishlist Items</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-tenor font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Link to="/account/orders">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      View Orders
                    </motion.button>
                  </Link>
                  
                  <Link to="/products">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-secondary flex items-center gap-2"
                    >
                      Continue Shopping
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account; 