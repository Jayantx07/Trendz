import React, { useState, useEffect, useRef } from 'react';
import { apiAuthFetch } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Eye, CheckCircle, Clock, Truck, ChevronLeft, ChevronRight } from 'lucide-react';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const tabsRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiAuthFetch(`/orders/admin/all?status=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending Orders', icon: Clock },
    { id: 'in-progress', label: 'In Progress', icon: Truck },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  return (
    <div className="p-4 lg:p-8 bg-secondary min-h-screen">
      <h1 className="text-2xl font-bold mb-6 lg:mb-8 text-black">Orders</h1>

      {/* Tabs */}
      <div className="relative flex items-center mb-6 lg:mb-8 border-b border-gray-200">
        <button 
          onClick={() => scrollTabs('left')}
          className="p-1 hover:bg-gray-100 rounded-full mr-1 text-black shrink-0 lg:hidden"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div 
          ref={tabsRef}
          className="flex gap-2 lg:gap-4 overflow-x-auto pb-2 flex-1 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <button 
          onClick={() => scrollTabs('right')}
          className="p-1 hover:bg-gray-100 rounded-full ml-1 text-black shrink-0 lg:hidden"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center p-10"><LoadingSpinner /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium text-gray-500">Order ID</th>
                <th className="p-4 font-medium text-gray-500">Customer</th>
                <th className="p-4 font-medium text-gray-500">Date</th>
                <th className="p-4 font-medium text-gray-500">Total</th>
                <th className="p-4 font-medium text-gray-500">Status</th>
                <th className="p-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="p-4">
                    <div className="font-medium">{order.shipping.address.fullName}</div>
                    <div className="text-sm text-gray-500">{order.user?.email}</div>
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-medium">₹{order.total}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 hover:bg-gray-100 rounded-full text-black"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {orders.length === 0 && (
            <div className="p-8 text-center text-gray-500">No orders found</div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-2 text-gray-500 uppercase text-xs">Customer</h3>
                <p className="font-medium">{selectedOrder.shipping.address.fullName}</p>
                <p>{selectedOrder.shipping.address.email}</p>
                <p>{selectedOrder.shipping.address.phone}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-500 uppercase text-xs">Shipping Address</h3>
                <p>{selectedOrder.shipping.address.street}</p>
                <p>{selectedOrder.shipping.address.city}, {selectedOrder.shipping.address.state}</p>
                <p>{selectedOrder.shipping.address.pincode}</p>
                <p>{selectedOrder.shipping.address.country}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-gray-500 uppercase text-xs">Items</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center border-b border-gray-100 pb-4">
                    <img 
                      src={item.product?.primaryImage?.url || '/placeholder.jpg'} 
                      className="w-16 h-16 object-cover rounded"
                      alt=""
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name || 'Product Removed'}</p>
                      <p className="text-sm text-gray-500">Size: {item.variant.size} | Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{item.totalPrice}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-sm text-gray-500">Payment ID: {selectedOrder.razorpay?.paymentId}</p>
                <p className="text-sm text-gray-500">Order Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-black">₹{selectedOrder.total}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
