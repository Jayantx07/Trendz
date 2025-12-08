import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/admin/Sidebar';
import Dashboard from './admin/Dashboard';
import Products from './admin/Products';
import Orders from './admin/Orders';
import Customers from './admin/Customers';
import Queries from './admin/Queries';

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-secondary">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsSidebarOpen(true)} 
        className="lg:hidden fixed top-4 left-4 z-40 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        <Menu size={20} />
        <span className="text-sm font-medium">Menu</span>
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 overflow-x-hidden pt-16 lg:pt-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/queries" element={<Queries />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
