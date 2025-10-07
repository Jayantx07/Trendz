import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api.js';

import { motion } from 'framer-motion';

const ApiStatus = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Checking API connection...');

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await apiFetch('/health');
        if (response.ok) {
          setStatus('connected');
          setMessage('API connected successfully');
        } else {
          setStatus('error');
          setMessage('API connection failed');
        }
      } catch (error) {
        setStatus('offline');
        setMessage('Using offline mode with demo data');
      }
    };

    checkApiStatus();
  }, []);

  if (status === 'connected') return null; // Don't show when everything is working

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 p-3 text-center text-sm font-medium ${
        status === 'offline' 
          ? 'bg-blue-500 text-white' 
          : 'bg-red-500 text-white'
      }`}
    >
      {message}
      {status === 'offline' && (
        <span className="ml-2 text-xs opacity-75">
          (Server may be starting up)
        </span>
      )}
    </motion.div>
  );
};

export default ApiStatus;