import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api.js';

import { motion } from 'framer-motion';
const ApiStatus = () => {
  const SHOW = (import.meta.env.VITE_SHOW_API_STATUS === 'true') || import.meta.env.DEV;
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Checking API connection...');

  useEffect(() => {
    let attempts = 0;
    const checkApiStatus = async () => {
      try {
        const response = await apiFetch('/health');
        if (response.ok) {
          setStatus('connected');
          setMessage('API connected successfully');
          return true;
        }
      } catch (_) {}
      return false;
    };

    const run = async () => {
      // Try up to 5 times with backoff before showing offline
      while (attempts < 5) {
        const ok = await checkApiStatus();
        if (ok) return;
        attempts += 1;
        await new Promise(r => setTimeout(r, 1000 * Math.min(2 ** attempts, 5)));
      }
      setStatus('offline');
      setMessage('Using offline mode with demo data (Server may be starting up)');
    };

    run();
  }, []);

  if (!SHOW || status === 'connected') return null; // Hide in production or when OK

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
      <button onClick={() => window.location.reload()} className="underline mr-2">Retry</button>{message}
      {status === 'offline' && (
        <span className="ml-2 text-xs opacity-75">
          (Server may be starting up)
        </span>
      )}
    </motion.div>
  );
};

export default ApiStatus;