import React from 'react';
import { LayoutDashboard, Package, Users, ShoppingBag, MessageSquare, LogOut, X, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Customers', icon: Users, path: '/admin/customers' },
    { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'Queries', icon: MessageSquare, path: '/admin/queries' },
  ];

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <img 
            src="https://res.cloudinary.com/dbx8ravps/image/upload/v1765021119/Screenshot_1-12-2025_204435_-removebg-preview_convm7.png" 
            alt="VASAAE" 
            className="h-8 w-auto object-contain"
          />
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded">
            <X size={20} className="text-black" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}

          <button
            onClick={() => handleNavigation('/')}
            className="w-full flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
