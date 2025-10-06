import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const EditProfileModal = ({ open, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || ''
    });
  }, [open, user]);

  if (!open) return null;

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const res = await updateProfile({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      avatar: form.avatar,
    });
    setSaving(false);
    if (res.success) {
      setSuccess('Profile updated');
      setTimeout(onClose, 700);
    } else {
      setError(res.error || 'Failed to update');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow p-6 text-black">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">Edit Profile</h3>
          <button onClick={onClose} className="text-black/70 hover:text-black">✕</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {form.avatar ? (
                <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm text-black/70">No Image</span>
              )}
            </div>
            <div>
              <label className="block text-sm text-black mb-1">Profile Photo</label>
              <input id="avatar-input" type="file" accept="image/*" onChange={onFile} className="hidden" />
              <label htmlFor="avatar-input" className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded cursor-pointer hover:border-gray-500 text-black">
                Upload
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-black mb-1">First Name</label>
              <input className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500" value={form.firstName} onChange={(e)=>setForm(f=>({...f, firstName:e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm text-black mb-1">Last Name</label>
              <input className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500" value={form.lastName} onChange={(e)=>setForm(f=>({...f, lastName:e.target.value}))} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-black mb-1">Email</label>
              <input type="email" className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500" value={form.email} onChange={(e)=>setForm(f=>({...f, email:e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm text-black mb-1">Phone</label>
              <input className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500" value={form.phone} onChange={(e)=>setForm(f=>({...f, phone:e.target.value}))} />
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border border-gray-300 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-3 py-2 bg-black text-white rounded">{saving? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
