import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Addresses = () => {
  const { user, updateProfile } = useAuth();
  const [items, setItems] = useState(user?.addresses || []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type:'home', street:'', city:'', state:'', zipCode:'', country:'India', isDefault:false });

  const reset = () => setForm({ type:'home', street:'', city:'', state:'', zipCode:'', country:'India', isDefault:false });

  const save = async () => {
    const next = editing!=null ? items.map((a,i)=> i===editing? form : a) : [...items, form];
    setItems(next);
    await updateProfile({ addresses: next });
    setEditing(null); reset();
  };

  const remove = async (idx) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    await updateProfile({ addresses: next });
  };

  return (
    <div className="container pt-24 md:pt-28 pb-12 text-black">
      <h1 className="text-2xl font-tenor font-bold text-black mb-6">Addresses</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((a, idx) => (
          <div key={idx} className="border border-gray-200 rounded p-4">
            <div className="text-sm mb-1">{a.type}</div>
            <div>{a.street}, {a.city}, {a.state} {a.zipCode}</div>
            <div className="text-sm">{a.country}</div>
            <div className="flex gap-2 mt-3">
              <button className="px-2 py-1 border rounded" onClick={() => { setEditing(idx); setForm(a); }}>Edit</button>
              <button className="px-2 py-1 border rounded text-red-600" onClick={() => remove(idx)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <h2 className="font-semibold mb-3 text-black">{editing != null ? 'Edit Address' : 'Add New Address'}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Street</label>
            <input className="w-full border rounded px-3 py-2 text-black placeholder-gray-500" placeholder="Street" value={form.street} onChange={(e) => setForm(f => ({ ...f, street: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">City</label>
            <input className="w-full border rounded px-3 py-2 text-black placeholder-gray-500" placeholder="City" value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">State</label>
            <input className="w-full border rounded px-3 py-2 text-black placeholder-gray-500" placeholder="State" value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm mb-1">ZIP</label>
            <input className="w-full border rounded px-3 py-2 text-black placeholder-gray-500" placeholder="ZIP" value={form.zipCode} onChange={(e) => setForm(f => ({ ...f, zipCode: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm mt-2">
            <input type="checkbox" checked={form.isDefault} onChange={(e)=>setForm(f=>({...f, isDefault: e.target.checked}))} />
            Set as default address
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          {editing != null && <button className="px-3 py-2 border rounded" onClick={() => { setEditing(null); reset(); }}>Cancel</button>}
          <button className="px-3 py-2 bg-black text-white rounded" onClick={save}>{editing != null ? 'Update' : 'Add'}</button>
        </div>
      </div>
    </div>
  );
};

export default Addresses;
