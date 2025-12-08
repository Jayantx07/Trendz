import React, { useState, useEffect } from 'react';
import { apiAuthFetch } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Mail, Check, Clock, Eye, Inbox, MessageSquare } from 'lucide-react';

const Queries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('New');

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const res = await apiAuthFetch('/queries');
      if (res.ok) {
        const data = await res.json();
        setQueries(data);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await apiAuthFetch(`/queries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setQueries(queries.map(q => q._id === id ? { ...q, status } : q));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const counts = {
    New: queries.filter(q => q.status === 'New').length,
    Seen: queries.filter(q => q.status === 'Seen').length,
    Replied: queries.filter(q => q.status === 'Replied').length
  };

  const filteredQueries = queries.filter(q => q.status === activeTab);

  const tabs = [
    { id: 'New', label: 'Inbox', icon: Inbox },
    { id: 'Seen', label: 'Seen', icon: Eye },
    { id: 'Replied', label: 'Replied', icon: Check }
  ];

  return (
    <div className="p-4 lg:p-8 bg-secondary min-h-screen">
      <h1 className="text-2xl font-bold mb-6 lg:mb-8 text-black">Customer Queries</h1>

      {/* Tabs */}
      <div className="flex gap-2 lg:gap-4 mb-6 lg:mb-8 border-b border-gray-200 pb-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 rounded-t-lg font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-black bg-white border-t border-x border-gray-200 -mb-[1px]' 
                : 'text-gray-500 hover:text-black hover:bg-white/50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><LoadingSpinner /></div>
      ) : (
        <div className="grid gap-4">
          {filteredQueries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No {activeTab.toLowerCase()} queries found</p>
            </div>
          ) : (
            filteredQueries.map((query) => (
              <div key={query._id} className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full shrink-0">
                      <Mail size={20} className="text-black" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-black truncate">{query.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{query.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(query.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      query.status === 'New' ? 'bg-blue-100 text-blue-700' :
                      query.status === 'Seen' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {query.status}
                    </span>
                  </div>
                </div>
                
                <div className="text-black mb-4 bg-gray-50 p-4 rounded-lg text-sm lg:text-base break-words">
                  {query.message}
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  {query.status === 'New' && (
                    <button 
                      onClick={() => updateStatus(query._id, 'Seen')}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-black bg-gray-100 hover:bg-gray-200 rounded transition-colors w-full sm:w-auto"
                    >
                      <Eye size={16} /> Mark as Seen
                    </button>
                  )}
                  {query.status !== 'Replied' && (
                    <button 
                      onClick={() => updateStatus(query._id, 'Replied')}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded transition-colors w-full sm:w-auto"
                    >
                      <Check size={16} /> Mark as Replied
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Queries;
