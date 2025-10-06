import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [newsletter, setNewsletter] = useState(!!user?.newsletterSubscribed);
  const [size, setSize] = useState(user?.preferences?.size || 'M');

  const save = async () => {
    await updateProfile({ preferences: { size } });
    await fetch('/api/auth/newsletter', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ subscribed: newsletter }),
    });
  };

  return (
    <div className="container pt-24 md:pt-28 pb-12 text-black">
      <h1 className="text-2xl font-tenor font-bold text-black mb-6">Settings</h1>
      <div className="bg-white border rounded p-6 space-y-4 text-black">
        <label className="flex items-center gap-2 text-black">
          <input type="checkbox" checked={newsletter} onChange={(e)=>setNewsletter(e.target.checked)} />
          <span>Subscribe to newsletter</span>
        </label>
        <div>
          <label className="block text-sm text-black mb-1">Preferred Size</label>
          <select className="border rounded px-3 py-2 text-black" value={size} onChange={(e)=>setSize(e.target.value)}>
            {['XS','S','M','L','XL','XXL'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex justify-end">
          <button onClick={save} className="px-3 py-2 bg-black text-white rounded">Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
