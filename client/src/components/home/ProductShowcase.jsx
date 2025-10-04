import React from 'react';
import { useNavigate } from 'react-router-dom';
import { slugify } from '../../utils/localProducts.js';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const slug = slugify(product.name);
  const go = () => navigate(`/products/${slug}`);
  return (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="group"
  >
    <div className="rounded-md overflow-hidden bg-white border border-gray-200">
      <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={go}>
        {/* Primary image */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-300 ${
            product.altImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'
          }`}
        />
        {/* Hover/alternate image if available */}
        {product.altImage && (
          <img
            src={product.altImage}
            alt={`${product.name} alternate view`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </div>
      <div className="p-4">
        <h4 className="text-gray-900 text-lg mb-3 cursor-pointer hover:text-accent" onClick={go}>{product.name}</h4>
        <div className="flex items-center gap-2 mb-4">
          {product.originalPrice && (
            <span className="text-gray-400 line-through">
              ₹ {product.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          )}
          <span className="text-gray-900 font-medium">
            ₹ {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <button
          type="button"
          className="w-full border border-gray-300 py-2 text-sm tracking-wide hover:bg-gray-50 transition-colors text-black"
          onClick={go}
        >
          QUICK VIEW
        </button>
      </div>
    </div>
  </motion.div>
  );
};

const ProductShowcase = ({ title, products }) => {
  return (
    <section className="py-16 bg-white">
      <div className="container">
        {title && (
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-tenor tracking-wide text-gray-900">
              {title}
            </h2>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p, i) => (
            <ProductCard key={i} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
