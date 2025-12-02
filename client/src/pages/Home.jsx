import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Heart } from 'lucide-react';
import HeroSection from '../components/home/HeroSection.jsx';
import CategorySection from '../components/home/CategorySection.jsx';
import VideoCarousel from '../components/home/VideoCarousel.jsx';
import ProductShowcase from '../components/home/ProductShowcase.jsx';
import { apiFetch } from '../utils/api.js';

const Home = () => {
  // Home page category data fetched from API by category
  const [westernWear, setWesternWear] = useState([]);
  const [partyWear, setPartyWear] = useState([]);
  const [coOrdSets, setCoOrdSets] = useState([]);
  const [casualWear, setCasualWear] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadCategory = async (category, setter, limit = 4) => {
      try {
        const res = await apiFetch(`/products?category=${encodeURIComponent(category)}&limit=${limit}`);
        if (!res.ok) throw new Error('Failed to load ' + category);
        const data = await res.json();
        if (!isMounted) return;
        const list = Array.isArray(data?.products) ? data.products : [];
        setter(
          list.map((p) => ({
            id: p._id,
            name: p.name,
            image: p.primaryImage || (p.images && p.images[0]?.url) || '',
            altImage: undefined,
            price: (p.salePrice ?? p.price ?? p.basePrice) || 0,
            originalPrice: p.salePrice ? (p.price ?? p.basePrice) : undefined,
          }))
        );
      } catch (e) {
        console.error(e);
      }
    };

    const loadAll = async () => {
      setHomeLoading(true);
      setHomeError(null);
      try {
        await Promise.all([
          loadCategory('western-dress', setWesternWear),
          loadCategory('party-wear', setPartyWear),
          loadCategory('co-ord-set', setCoOrdSets),
          loadCategory('casual-wear', setCasualWear),
        ]);
      } catch (e) {
        if (isMounted) setHomeError(e.message || 'Failed to load home products');
      } finally {
        if (isMounted) setHomeLoading(false);
      }
    };

    loadAll();
    return () => {
      isMounted = false;
    };
  }, []);

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

        {/* Category listing between banner and product sections */}
        <CategorySection />

        {/* Key Category Showcases */}
        {homeError && (
          <div className="container mt-6 text-center text-red-600 text-sm">{homeError}</div>
        )}

        <ProductShowcase title="Western Wear" products={westernWear} />
        <ProductShowcase title="Party Wear" products={partyWear} />
        <ProductShowcase title="Co-Ord Sets" products={coOrdSets} />
        <ProductShowcase title="Casual Wear" products={casualWear} />

        {/* Video Carousel Section */}
        <VideoCarousel />


      </div>
    </>
  );
};

export default Home; 