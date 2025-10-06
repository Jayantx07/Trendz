import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
      setFormError('Please fill all fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    const success = await register(form.firstName, form.lastName, form.email, form.password);
    if (success) navigate('/account');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container pt-24 md:pt-28 pb-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-tenor font-bold text-center mb-8 text-gray-900">Register</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-900 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500"
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-900 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500"
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-900 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-gray-900 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-black placeholder-gray-500"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-900 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-black placeholder-gray-500"
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {(formError || error) && (
              <div className="text-red-600 text-sm">{formError || error}</div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary text-lg py-3 mt-2 rounded-[3px]"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </motion.button>
          </form>
          <div className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <button
              className="text-accent hover:underline"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;