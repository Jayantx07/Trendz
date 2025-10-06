import React, { useEffect, useState } from 'react';
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
import Wishlist from './Wishlist.jsx';
import Addresses from './Addresses.jsx';
import Payments from './Payments.jsx';
import SettingsPage from './Settings.jsx';
import EditProfileModal from '../components/account/EditProfileModal.jsx';

const Account = () => {
  const { user, loading, error, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [editOpen, setEditOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    // Fetch wishlist count from server
    const loadWishlist = async () => {
      try {
        const res = await fetch('/api/auth/wishlist', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setWishlistCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (_) {}
    };
    loadWishlist();
    // Orders count: placeholder (0) unless you have an orders API
    setOrdersCount(0);
  }, []);

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User, path: '/account' },
    { id: 'orders', label: 'Order History', icon: Package, path: '/account/orders' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/account/wishlist' },
    { id: 'addresses', label: 'Addresses', icon: MapPin, path: '/account/addresses' },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard, path: '/account/payments' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/account/settings' },
  ];

  // Check if we're on a sub-route
  const isSubRoute = location.pathname !== '/account';

  if (isSubRoute) {
    return (
      <Routes>
        <Route path="orders" element={<OrderHistory />} />
        <Route path="orders/:orderId" element={<OrderDetail />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="addresses" element={<Addresses />} />
        <Route path="payments" element={<Payments />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container pt-24 md:pt-28 pb-12">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              {/* User Info */}
              <div className="mb-6 pb-6 border-b border-gray-200 text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-accent to-accent-dark rounded-full flex items-center justify-center text-white text-lg font-semibold overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                  )}
                </div>
                <h3 className="mt-3 font-tenor font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
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
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-black">
              <h2 className="text-2xl font-tenor font-bold text-black mb-6">
                Profile Information
              </h2>
              <div className="mb-6">
                <button onClick={() => setEditOpen(true)} className="px-3 py-2 text-sm border border-gray-300 rounded hover:border-gray-500">Edit Profile</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-tenor font-semibold text-black mb-4">
                    Personal Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-black" />
                      <div>
                        <p className="text-sm text-black">Full Name</p>
                        <p className="font-medium text-black">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-black" />
                      <div>
                        <p className="text-sm text-black">Email Address</p>
                        <p className="font-medium text-black">{user.email}</p>
                      </div>
                    </div>

                    {user.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-black" />
                        <div>
                          <p className="text-sm text-black">Phone Number</p>
                          <p className="font-medium text-black">{user.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Summary (right) */}
                <div>
                  <h3 className="text-lg font-tenor font-semibold text-black mb-4">Account Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                      <Package className="w-8 h-8 text-black mx-auto mb-2" />
                      <p className="text-2xl font-bold text-black">{ordersCount}</p>
                      <p className="text-sm text-black">Total Orders</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                      <Heart className="w-8 h-8 text-black mx-auto mb-2" />
                      <p className="text-2xl font-bold text-black">{wishlistCount}</p>
                      <p className="text-sm text-black">Wishlist Items</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
};

export default Account;