import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const SettingsPage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [newsletter, setNewsletter] = useState(!!user?.newsletterSubscribed);
  const [size, setSize] = useState(user?.preferences?.size || 'M');
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const [pwdMsg, setPwdMsg] = useState('');

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

  const submitPassword = async () => {
    setPwdMsg('');
    const res = await changePassword(pwd.currentPassword, pwd.newPassword);
    setPwdMsg(res.success ? 'Password changed successfully' : (res.error || 'Failed to change password'));
    if (res.success) setPwd({ currentPassword: '', newPassword: '' });
  };

  return (
    <div className="container pt-12 md:pt-12 pb-12 text-black">
      <h1 className="text-2xl font-tenor font-bold text-black mb-6">Settings</h1>
      <div className="bg-white border rounded p-6 space-y-6 text-black">
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

        <hr />

        {/* Change Password */}
        <div>
          <h2 className="font-semibold mb-3">Change Password</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Current Password</label>
              <input type="password" className="w-full border rounded px-3 py-2 text-black" value={pwd.currentPassword} onChange={(e)=>setPwd(p=>({...p, currentPassword: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm mb-1">New Password</label>
              <input type="password" className="w-full border rounded px-3 py-2 text-black" value={pwd.newPassword} onChange={(e)=>setPwd(p=>({...p, newPassword: e.target.value}))} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <button onClick={submitPassword} className="px-3 py-2 bg-black text-white rounded">Update Password</button>
            {pwdMsg && <span className={`text-sm ${pwdMsg.includes('success')?'text-green-600':'text-red-600'}`}>{pwdMsg}</span>}
          </div>
        </div>

        <hr />

        {/* Delete Account (showcase only) */}
        <div className="border border-red-200 rounded p-4 bg-red-50">
          <h2 className="font-semibold mb-2 text-red-700">Delete Account</h2>
          <p className="text-sm text-red-700 mb-3">This is a showcase-only action. No account will be deleted.</p>
          <button type="button" className="px-3 py-2 border border-red-600 text-red-700 rounded" onClick={()=>alert('Demo only: delete account is not active yet.')}>Delete My Account</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
