import React, { useState } from 'react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const adminEmail = 'founder@vasaae.com';

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = `Inquiry from ${name || 'VASAAE visitor'}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    window.location.href = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="container pt-24 md:pt-28 pb-12">
      <h1 className="text-4xl font-tenor text-gray-900 mb-4">Contact</h1>
      <p className="text-gray-600 max-w-3xl mb-6">
        Reach us using the form or contact details below. This is a placeholder page, add your actual
        contact form and info later.
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
          <input className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <textarea className="w-full border border-gray-300 rounded px-3 py-2 text-black placeholder-gray-500" rows={5} placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit" className="btn-primary rounded-[3px]">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
