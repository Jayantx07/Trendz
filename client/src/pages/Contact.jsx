import React from 'react';

const Contact = () => {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-tenor text-gray-900 mb-4">Contact</h1>
      <p className="text-gray-600 max-w-3xl mb-6">
        Reach us using the form or contact details below. This is a placeholder page; add your actual
        contact form and info later.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-gray-700"><strong>Email:</strong> hello@example.com</p>
          <p className="text-gray-700"><strong>Phone:</strong> +91 90000 00000</p>
          <p className="text-gray-700"><strong>Address:</strong> Your store address</p>
        </div>
        <form className="space-y-3">
          <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Name" />
          <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Email" />
          <textarea className="w-full border border-gray-300 rounded px-3 py-2" rows={4} placeholder="Message" />
          <button type="button" className="btn-primary rounded-[3px]">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
