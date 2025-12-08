import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // success | error

  const adminEmail = 'founder@vasaae.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await apiFetch('/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container pt-24 md:pt-28 pb-12">
      <h1 className="text-4xl font-tenor text-gray-900 mb-4">Contact</h1>
      <p className="text-gray-600 max-w-3xl mb-6">
        Reach us using the form or contact details below.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact details */}
        <div className="space-y-3">
          <p className="text-gray-700"><strong>Email:</strong> <a className="underline" href={`mailto:${adminEmail}`}>{adminEmail}</a></p>
          <p className="text-gray-700"><strong>Phone:</strong> +91 90790 05217</p>
          <p className="text-gray-700"><strong>Address:</strong> Sitapura Jaipur High Street, Rajasthan, India</p>
          <div className="rounded-lg overflow-hidden border border-gray-200 mt-4">
            <iframe
              title="VASAAE Location"
              src="https://www.google.com/maps?q=Sitapura%20Jaipur%20High%20Street,%20Rajasthan,%20India&output=embed"
              className="w-full h-64"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Contact form */}
        <form className="space-y-3" onSubmit={handleSubmit}>
          <input 
            className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500 focus:ring-accent focus:border-accent" 
            placeholder="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
          />
          <input 
            className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500 focus:ring-accent focus:border-accent" 
            placeholder="Email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <textarea 
            className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500 focus:ring-accent focus:border-accent" 
            rows={5} 
            placeholder="Message" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            required
          />
          
          {status === 'success' && (
            <div className="p-3 bg-green-50 text-green-700 rounded text-sm">
              Message sent successfully! We'll get back to you soon.
            </div>
          )}
          {status === 'error' && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
              Failed to send message. Please try again.
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary rounded-[3px] w-full flex justify-center items-center"
          >
            {loading ? <LoadingSpinner size="sm" color="white" /> : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
