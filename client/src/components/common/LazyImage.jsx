import React from 'react';

// Simple lazy image that works well with Cloudinary f_auto,q_auto
// Accepts src, alt, className, sizes, srcSet (optional)
const LazyImage = ({ src, alt = '', className = '', sizes, srcSet }) => {
  const onError = (e) => {
    const el = e.currentTarget;
    if (el.dataset.fallbackApplied) return;
    el.dataset.fallbackApplied = '1';
    el.src = 'https://res.cloudinary.com/dhaegglsm/image/upload/site-assets/images/products/dresses.jpg';
  };
  // If a plain Cloudinary public URL is passed, it's already optimized server-side
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      sizes={sizes}
      srcSet={srcSet}
      referrerPolicy="no-referrer"
      onError={onError}
    />
  );
};

export default React.memo(LazyImage);
