import React from 'react';

const WhatsAppButton = ({ phone = '919999999999', message = 'Hi! I need help with Trendz.' }) => {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 bottom-5 right-5 rounded-full w-14 h-14 bg-black shadow-lg hover:shadow-xl transition-shadow ring-2 ring-white/70 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <img
        src="/images/logo/Whatsapp.jpg"
        alt="WhatsApp"
        className="w-8 h-8 object-contain"
      />
    </a>
  );
};

export default WhatsAppButton;
