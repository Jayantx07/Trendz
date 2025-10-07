import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';

import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  X, 
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const OrderHistory = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [token, filter]);

  const fetchOrders = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const response = await apiFetch(`/orders/my-orders?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data?.orders) ? data.orders : (Array.isArray(data) ? data : []));
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-500" />;
      case 'returned':
        return <RefreshCw className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-tenor font-bold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchOrders}
            className="btn-primary"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-tenor font-bold text-gray-900 mb-2">
            Order History
          </h1>
          <p className="text-gray-600">
            Track and manage your orders
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'pending', label: 'Pending' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'shipped', label: 'Shipped' },
              { key: 'delivered', label: 'Delivered' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-tenor font-semibold text-gray-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't placed any orders yet."
                : `No ${filter} orders found.`
              }
            </p>
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary"
              >
                Start Shopping
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-tenor font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹{order.total?.toLocaleString()}
                      </span>
                      <Link to={`/orders/${order._id}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-gray-600 hover:text-accent transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img
                          src={item.product?.images?.[0]?.url || '/images/placeholder.jpg'}
                          alt={item.product?.name || 'Product'}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product?.name || 'Product'}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-gray-500">
                              {item.variant.color?.name} • {item.variant.size}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Actions */}
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <div className="px-6 pb-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-secondary text-sm"
                      onClick={() => {
                        // TODO: Implement cancel order
                        console.log('Cancel order:', order._id);
                      }}
                    >
                      Cancel Order
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;