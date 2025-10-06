import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Payments = () => {
  const { user, updateProfile } = useAuth();
  const [items, setItems] = useState(user?.paymentMethods || []);
  const [form, setForm] = useState({ type:'card', brand:'VISA', last4:'', isDefault:false });

  const save = async () => {
    const next = [...items, form];
    setItems(next);
    await updateProfile({ paymentMethods: next });
    setForm({ type:'card', brand:'VISA', last4:'', isDefault:false });
  };
  const remove = async (idx) => {
    const next = items.filter((_,i)=>i!==idx);
    setItems(next);
    await updateProfile({ paymentMethods: next });
  };


  return (
    <div className="container pt-12 md:pt-12 pb-12 text-black">
      <h1 className="text-2xl font-tenor font-bold text-black mb-6">Payment Methods</h1>
      {/* Showcase-only; removed Add New Card section */}

      {/* Demo Checkout (Showcase only) */}
      <div className="mt-10 border-t pt-6">
        <h2 className="font-semibold mb-4 text-black">Checkout (Demo)</h2>
        <p className="text-sm mb-4">This section is for showcase only. Buttons and fields are non-functional.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Name on Card</label>
              <input className="w-full border rounded px-3 py-2 text-black placeholder-gray-500" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm mb-1">Card Number</label>
              <input className="w-full border rounded px-3 py-2 text-black placeholder-gray-500" placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">Expiry</label>
                <input className="w-full border rounded px-3 py-2 text-black placeholder-gray-500" placeholder="MM/YY" />
              </div>
              <div>
                <label className="block text-sm mb-1">CVC</label>
                <input className="w-full border rounded px-3 py-2 text-black placeholder-gray-500" placeholder="123" />
              </div>
              <div>
                <label className="block text-sm mb-1">ZIP</label>
                <input className="w-full border rounded px-3 py-2 text-black placeholder-gray-500" placeholder="10001" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-3">Payment Options</h3>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => alert('Demo only: Card payment is not active yet.')}
                  className="w-full px-4 py-2 bg-black text-white rounded"
                >
                  Pay Now (Card) — Demo
                </button>
                <button
                  type="button"
                  onClick={() => alert('Demo only: UPI/Wallet payment is not active yet.')}
                  className="w-full px-4 py-2 border border-gray-300 rounded hover:border-gray-500"
                >
                  Pay via UPI/Wallet — Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
