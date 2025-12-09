import React, { useState, useEffect } from 'react';
import { apiAuthFetch } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User, Ban, CheckCircle, Search, Mail, Shield, Trash2 } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiAuthFetch('/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      } else {
        console.error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockStatus = async (customerId, currentStatus) => {
    const action = currentStatus ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const res = await apiAuthFetch(`/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked: !currentStatus }),
      });

      if (res.ok) {
        const updatedCustomer = await res.json();
        setCustomers(prevCustomers => prevCustomers.map(c => 
          c._id === customerId ? { ...c, isBlocked: updatedCustomer.isBlocked } : c
        ));
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  };

  const deleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await apiAuthFetch(`/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCustomers(customers.filter(c => c._id !== customerId));
      } else {
        console.error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
    const email = (customer.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 lg:p-8 bg-secondary min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 lg:mb-8 gap-4">
        <h1 className="text-2xl font-bold text-black">Customers</h1>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-black"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center text-gray-500">
            No customers found.
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div 
              key={customer._id} 
              className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {customer.avatar ? (
                    <img 
                      src={customer.avatar} 
                      alt={`${customer.firstName} ${customer.lastName}`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Mail className="w-3 h-3" />
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Shield className="w-3 h-3" />
                    {customer.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  customer.isBlocked 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {customer.isBlocked ? 'Blocked' : 'Active'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBlockStatus(customer._id, customer.isBlocked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      customer.isBlocked
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                    }`}
                    title={customer.isBlocked ? "Unblock User" : "Block User"}
                  >
                    {customer.isBlocked ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Unblock</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4" />
                        <span className="hidden sm:inline">Block</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => deleteCustomer(customer._id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-50 text-red-600 hover:bg-red-100"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Customers;
