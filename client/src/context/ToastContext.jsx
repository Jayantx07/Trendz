import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', image = null) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, image }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const { id, message, type, image } = toast;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      layout
      className="pointer-events-auto min-w-[300px] max-w-md bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden flex items-center"
    >
      {image && (
        <div className="w-12 h-12 flex-shrink-0 bg-white">
          <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className={`flex-1 p-3 flex items-center gap-3 ${!image ? 'pl-4' : ''}`}>
        {!image && (
          <div className="flex-shrink-0">
            {type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
            {type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
        )}
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="p-2 hover:bg-white/10 transition-colors self-stretch flex items-center justify-center"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </motion.div>
  );
};
