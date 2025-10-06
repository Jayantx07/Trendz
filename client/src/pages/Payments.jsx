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
    <div className="container pt-24 md:pt-28 pb-12 text-black">
      <h1 className="text-2xl font-tenor font-bold text-black mb-6">Payment Methods</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((p, idx)=> (
          <div key={idx} className="border rounded p-4">
            <div className="text-black font-medium">{p.brand} •••• {p.last4}</div>
            <div className="text-sm text-black">{p.type}{p.isDefault?' • Default':''}</div>
            <div className="mt-3 flex gap-2">
              <button className="px-2 py-1 border rounded text-red-600" onClick={()=>remove(idx)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <h2 className="font-semibold mb-3 text-black">Add New Card</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input className="border rounded px-3 py-2 text-black placeholder-gray-500" placeholder="Brand" value={form.brand} onChange={(e)=>setForm(f=>({...f, brand:e.target.value}))} />
          <input className="border rounded px-3 py-2 text-black placeholder-gray-500" placeholder="Last 4" value={form.last4} onChange={(e)=>setForm(f=>({...f, last4:e.target.value}))} />
          <label className="flex items-center gap-2 text-sm text-black"><input type="checkbox" checked={form.isDefault} onChange={(e)=>setForm(f=>({...f, isDefault:e.target.checked}))} /> Default</label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-3 py-2 bg-black text-white rounded" onClick={save}>Add Card</button>
        </div>
      </div>
    </div>
  );
};

export default Payments;
