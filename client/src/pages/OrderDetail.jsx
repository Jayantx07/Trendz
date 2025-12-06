import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api.js';

import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
  MapPin,
  CreditCard,
  Calendar,
  RefreshCw,
  AlertCircle,
  Download,
  MessageCircle
} from 'lucide-react';
  
const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, token]);

  const fetchOrder = async () => {
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch(`/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else if (response.status === 404) {
        setError('Order not found');
      } else {
        throw new Error('Failed to fetch order');
      }
    } catch (error) {
      console.error('Fetch order error:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'processing':
        return <Package className="w-6 h-6 text-purple-500" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'cancelled':
        return <X className="w-6 h-6 text-red-500" />;
      case 'returned':
        return <RefreshCw className="w-6 h-6 text-gray-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'returned':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusProgress = (status) => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-tenor font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/account')}
            className="btn-primary"
          >
            Back to Account
          </motion.button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/account')}
            className="p-2 text-gray-600 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-tenor font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h2 className="text-xl font-tenor font-semibold text-gray-900">
                      Order Status
                    </h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                {order.shipping?.trackingNumber && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-mono text-sm font-semibold text-accent">
                      {order.shipping.trackingNumber}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Progress */}
              {!['cancelled', 'returned'].includes(order.status) && (
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Order Placed</span>
                    <span>Confirmed</span>
                    <span>Processing</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getStatusProgress(order.status)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div>
                  <h3 className="font-tenor font-semibold text-gray-900 mb-4">Status History</h3>
                  <div className="space-y-3">
                    {order.statusHistory.map((status, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatDate(status.timestamp)}
                          </p>
                          {status.note && (
                            <p className="text-xs text-gray-500 mt-1">{status.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-tenor font-semibold text-gray-900 mb-6">
                Order Items ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 border border-gray-100 rounded-lg">
                    <img
                      src={item.product?.images?.[0]?.url || '/images/placeholder.jpg'}
                      alt={item.product?.name || 'Product'}
                      className="w-20 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {item.product?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product?.brand || 'VASAAE'}
                      </p>
                      {item.variant && (
                        <div className="text-sm text-gray-600 mb-2">
                          {item.variant.color?.name && (
                            <span>Color: {item.variant.color.name}</span>
                          )}
                          {item.variant.size && (
                            <span className="ml-3">Size: {item.variant.size}</span>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{item.totalPrice?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₹{item.price?.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-tenor font-semibold text-gray-900">
                  Shipping Address
                </h2>
              </div>
              {order.shipping?.address && (
                <div className="text-gray-700">
                  <p className="font-medium">
                    {order.shipping.address.firstName} {order.shipping.address.lastName}
                  </p>
                  <p>{order.shipping.address.street}</p>
                  <p>
                    {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zipCode}
                  </p>
                  <p>{order.shipping.address.country}</p>
                  {order.shipping.address.phone && (
                    <p className="mt-2 text-sm">Phone: {order.shipping.address.phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-tenor font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>₹{order.shipping?.cost?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₹{order.tax?.toLocaleString()}</span>
                </div>
                {order.discount?.amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{order.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-tenor font-semibold text-gray-900">
                  Payment Method
                </h2>
              </div>
              {order.payment && (
                <div className="text-gray-700">
                  <p className="font-medium capitalize">
                    {order.payment.method.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Status: <span className="capitalize">{order.payment.status}</span>
                  </p>
                  {order.payment.transactionId && (
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      Transaction ID: {order.payment.transactionId}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-tenor font-semibold text-gray-900 mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-secondary text-sm"
                    onClick={() => {
                      // TODO: Implement cancel order
                      console.log('Cancel order:', order._id);
                    }}
                  >
                    Cancel Order
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                  onClick={() => {
                    // TODO: Implement download invoice
                    console.log('Download invoice:', order._id);
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download Invoice
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                  onClick={() => {
                    // TODO: Implement contact support
                    console.log('Contact support for order:', order._id);
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Support
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;