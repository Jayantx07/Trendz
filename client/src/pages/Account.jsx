import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Account = () => {
  const { user, loading, error, logout } = useAuth();
  const navigate = useNavigate();

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-tenor font-bold text-gray-900 mb-4">
            You are not logged in
          </h2>
          <p className="text-gray-600 mb-8">
            Please sign in to view your account.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Sign In
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-tenor font-bold text-gray-900 mb-8">
          My Account
        </h1>
        <div className="bg-white rounded-lg p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-tenor font-bold mb-2">Profile</h2>
            <div className="flex flex-col gap-2">
              <div><span className="font-medium">Name:</span> {user.firstName} {user.lastName}</div>
              <div><span className="font-medium">Email:</span> {user.email}</div>
            </div>
          </div>
          {/* Order history placeholder */}
          <div>
            <h2 className="text-xl font-tenor font-bold mb-2 mt-6">Order History</h2>
            <div className="text-gray-500">No orders yet.</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="btn-secondary mt-8"
          >
            Logout
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Account; 