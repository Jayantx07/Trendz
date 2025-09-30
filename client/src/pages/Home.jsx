import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Heart } from 'lucide-react';
import HeroSection from '../components/home/HeroSection.jsx';
import NewArrivals from '../components/home/NewArrivals.jsx';
import CategorySection from '../components/home/CategorySection.jsx';
import NewsletterSignup from '../components/home/NewsletterSignup.jsx';

const Home = () => {
  // Featured products data (matching Oscar de la Renta style)
  const featuredProducts = [
    {
      id: 1,
      name: "Cherry Blossom Sequin Cocktail Dress",
      price: 1295,
      originalPrice: 2590,
      image: "/images/product-1.jpg",
      category: "Dresses",
      isNew: true,
      isSale: true
    },
    {
      id: 2,
      name: "Cherry Blossom Embroidered Cap Sleeve Dress",
      price: 995,
      originalPrice: 1990,
      image: "/images/product-2.jpg",
      category: "Dresses",
      isNew: true,
      isSale: true
    },
    {
      id: 3,
      name: "Signature Handbag",
      price: 895,
      image: "/images/product-3.jpg",
      category: "Bags & Accessories",
      isNew: false,
      isSale: false
    },
    {
      id: 4,
      name: "Evening Gown with Floral Embroidery",
      price: 2495,
      image: "/images/product-4.jpg",
      category: "Gowns & Caftans",
      isNew: true,
      isSale: false
    }
  ];

  const categories = [
    { name: "Ready-to-Wear", href: "/products?category=ready-to-wear" },
    { name: "Bags & Accessories", href: "/products?category=accessories" },
    { name: "Jewelry", href: "/products?category=jewelry" },
    { name: "Bridal", href: "/products?category=bridal" }
  ];

  return (
    <>
      <Helmet>
        <title>Trendz - Luxury Fashion E-commerce | Discover Elegant Collections</title>
        <meta name="description" content="Discover elegant collections, premium quality, and timeless style at Trendz. Luxury fashion inspired by Oscar de la Renta." />
        <meta property="og:title" content="Trendz - Luxury Fashion E-commerce" />
        <meta property="og:description" content="Discover elegant collections, premium quality, and timeless style at Trendz." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://trendz.com" />
        <link rel="canonical" href="https://trendz.com" />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* Spring 2026 Collection Banner - Oscar de la Renta inspired */}
        <section className="py-16 bg-white">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-sm font-tenor tracking-[0.3em] text-accent mb-4">
                INTRODUCING
              </h2>
              <h3 className="text-5xl md:text-6xl font-tenor font-light text-gray-900 mb-6">
                SPRING 2026
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                The Spring 2026 Collection explores the beauty of modern elegance, 
                with sophisticated silhouettes and exquisite craftsmanship that define luxury fashion.
              </p>
              <Link to="/products?collection=spring-2026">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-900 text-white px-8 py-4 font-tenor tracking-wide hover:bg-gray-800 transition-colors"
                >
                  DISCOVER NOW
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <CategorySection />

        {/* New Arrivals */}
        <NewArrivals />

        {/* Newsletter Signup */}
        <NewsletterSignup />
      </div>
    </>
  );
};

export default Home; 