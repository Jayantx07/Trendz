import React from 'react';

// Simple lazy image that works well with Cloudinary f_auto,q_auto
// Accepts src, alt, className, sizes, srcSet (optional)
const LazyImage = ({ src, alt = '', className = '', sizes, srcSet }) => {
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
    />
  );
};

export default React.memo(LazyImage);
