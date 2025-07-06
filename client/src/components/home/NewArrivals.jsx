import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';

const NewArrivals = () => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

  // Mock data for new arrivals
  const newArrivals = [
    {
      id: 1,
      name: 'Silk Evening Gown',
      price: 2800,
      salePrice: null,
      image: '/images/products/evening-gown-1.jpg',
      category: 'Evening',
      isNew: true,
      colors: ['Black', 'Navy', 'Burgundy'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    {
      id: 2,
      name: 'Floral Day Dress',
      price: 1200,
      salePrice: 960,
      image: '/images/products/day-dress-1.jpg',
      category: 'Day',
      isNew: true,
      colors: ['Blue', 'Pink', 'White'],
      sizes: ['XS', 'S', 'M', 'L']
    },
    {
      id: 3,
      name: 'Signature Handbag',
      price: 1800,
      salePrice: null,
      image: '/images/products/handbag-1.jpg',
      category: 'Accessories',
      isNew: true,
      colors: ['Black', 'Brown', 'Cream'],
      sizes: ['One Size']
    },
    {
      id: 4,
      name: 'Embroidered Blouse',
      price: 850,
      salePrice: null,
      image: '/images/products/blouse-1.jpg',
      category: 'Day',
      isNew: true,
      colors: ['White', 'Ivory', 'Pale Blue'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    {
      id: 5,
      name: 'Crystal Earrings',
      price: 450,
      salePrice: null,
      image: '/images/products/earrings-1.jpg',
      category: 'Jewelry',
      isNew: true,
      colors: ['Gold', 'Silver'],
      sizes: ['One Size']
    },
    {
      id: 6,
      name: 'Velvet Evening Jacket',
      price: 1600,
      salePrice: null,
      image: '/images/products/jacket-1.jpg',
      category: 'Evening',
      isNew: true,
      colors: ['Black', 'Emerald', 'Burgundy'],
      sizes: ['XS', 'S', 'M', 'L']
    },
    {
      id: 7,
      name: 'Silk Scarf',
      price: 280,
      salePrice: null,
      image: '/images/products/scarf-1.jpg',
      category: 'Accessories',
      isNew: true,
      colors: ['Multi', 'Navy', 'Burgundy'],
      sizes: ['One Size']
    },
    {
      id: 8,
      name: 'Bridal Gown',
      price: 3500,
      salePrice: null,
      image: '/images/products/bridal-1.jpg',
      category: 'Bridal',
      isNew: true,
      colors: ['White', 'Ivory'],
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    }
  ];

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handleWishlistToggle = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <section className="section-padding bg-white">
      <div className="flex items-center justify-between mb-6 px-6">
        <h2 className="text-3xl md:text-4xl font-tenor text-black">NEW ARRIVALS</h2>
        <Link to="/products?new=true" className="text-base font-tenor underline underline-offset-4 hover:text-accent transition-colors text-black">Shop all</Link>
      </div>
      <div className="section-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="product-card-wrapper group"
            >
              <div className="product-card">
                <div className="product-image-container relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                  {/* Badges */}
                  <div className="absolute top-0 left-0 flex flex-col gap-2 z-10">
                    {product.isNew && (
                      <span className="px-2 py-1 pl-1 bg-black text-white text-xs font-semibold rounded-none badge-new">New</span>
                    )}
                    {product.salePrice && (
                      <span className="px-2 py-1 pl-1 bg-red-600 text-white text-xs font-semibold rounded-none badge-sale">
                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% Off
                      </span>
                    )}
                  </div>
                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 z-10">
                    <Star className={`w-5 h-5 cursor-pointer ${isInWishlist(product.id) ? 'fill-accent text-accent' : 'text-black'}`} />
                  </div>
                </div>

                <div className="product-info">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {product.category}
                    </span>
                  </div>
                  
                  <h3 className="product-title">
                    <Link to={`/product/${product.id}`} className="hover:text-accent transition-colors">
                      {product.name}
                    </Link>
                  </h3>
                  
                  <div className="product-price">
                    {product.salePrice ? (
                      <>
                        <span className="product-current-price">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.salePrice)}</span>
                        <span className="product-original-price">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}</span>
                      </>
                    ) : (
                      <span className="product-current-price">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}</span>
                    )}
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {product.colors.slice(0, 3).map((color, colorIndex) => (
                      <span
                        key={colorIndex}
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                    {product.colors.length > 3 && (
                      <span className="text-xs text-gray-500">+{product.colors.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link to="/products?new=true">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary text-lg px-8 py-4"
            >
              View All New Arrivals
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default NewArrivals; 