import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Heart } from 'lucide-react';
import HeroSection from '../components/home/HeroSection.jsx';
import CategorySection from '../components/home/CategorySection.jsx';
import NewsletterSignup from '../components/home/NewsletterSignup.jsx';
import VideoCarousel from '../components/home/VideoCarousel.jsx';
import ProductShowcase from '../components/home/ProductShowcase.jsx';

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

  // Categorized showcases using images from public/images/products/dresses/
  const gowns = [
    {
      name: 'Liquid Pattern Gown',
      image: '/images/products/dresses/gowns/blue white liquid pattern gown.jpg',
      price: 5200,
    },
    {
      name: 'Evening Gown',
      image: '/images/products/dresses/full length pieces/evening-gown-1.jpg',
      price: 6400,
    },
    {
      name: 'Shiny Silver Dress',
      image: '/images/products/dresses/full length pieces/shiny silver dress.jpg',
      price: 5650,
    },
    {
      name: 'White Full Piece',
      image: '/images/products/dresses/full length pieces/white full piece.jpg',
      price: 4200,
    },
  ];

  const kurtas = [
    {
      name: 'Classic Kurta',
      image: '/images/products/dresses/kurtas/kurta.jpg',
      price: 3200,
    },
    {
      name: 'Frame Kurta',
      image: '/images/products/dresses/full outfits/frame kurta.jpg',
      price: 3300,
      altImage: '/images/products/dresses/full outfits/frame kurta 2.jpg',
    },
    {
      name: 'Beige Outfit',
      image: '/images/products/dresses/full outfits/biege outifit.jpg',
      price: 3500,
    },
    {
      name: 'Black Outfit',
      image: '/images/products/dresses/full outfits/black outfit.jpg',
      price: 3600,
      altImage: '/images/products/dresses/full outfits/black outfit topper view.jpg',
    },
  ];

  const onePiece = [
    {
      name: 'Maroon One Piece',
      image: '/images/products/dresses/one piece/maroon one piece.jpg',
      price: 4800,
      altImage: '/images/products/dresses/one piece/maroon piece with top.jpg',
    },
    {
      name: 'One-side Sleeve Black',
      image: '/images/products/dresses/one piece/one side sleeve black one piece.jpg',
      price: 5100,
    },
    {
      name: 'Side Cut Long Black',
      image: '/images/products/dresses/full length pieces/side cut long piece black.jpg',
      price: 4600,
      altImage: '/images/products/dresses/full length pieces/side cut long piece black 2.jpg',
    },
    {
      name: 'Black Full Piece',
      image: '/images/products/dresses/full length pieces/black full piece.jpg',
      price: 5000,
    },
  ];

  const skirts = [
    { name: 'Beige Skirt', image: '/images/products/dresses/skirts/biege skirt.jpg', price: 2100 },
    { name: 'Black & White Pattern', image: '/images/products/dresses/skirts/black and white pattern skirt.jpg', price: 2300 },
    { name: 'Green Velvet Skirt', image: '/images/products/dresses/skirts/green valvet skirt.jpg', price: 2600 },
    { name: 'Zebra Liquid Pattern', image: '/images/products/dresses/skirts/zebra liquid pattern skirt.jpg', price: 2400 },
  ];

  const toppers = [
    { name: 'Topper', image: '/images/products/dresses/toppers/Topper.jpg', price: 2800 },
    { name: 'Scarf', image: '/images/products/dresses/full outfits/scarf-1.jpg', price: 1400 },
    { name: 'Black Topper View', image: '/images/products/dresses/full outfits/black outfit topper view.jpg', price: 3000 },
    { name: 'Black Outfit', image: '/images/products/dresses/full outfits/black outfit.jpg', price: 3000 },
  ];

  const bottoms = [
    { name: 'Bottom', image: '/images/products/dresses/bottom/bottom.webp', price: 1900 },
    { name: 'Black Skirt 1', image: '/images/products/dresses/skirts/black skirt 1-1.jpg', price: 2200 },
    { name: 'Black Skirt 2', image: '/images/products/dresses/skirts/black skirt 2-1.jpg', price: 2200 },
    { name: 'White Skirt', image: '/images/products/dresses/skirts/white skirt 1-3.jpg', price: 2100 },
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

        {/* Categorized Product Showcases (before Video section) */}
        <ProductShowcase title="Gowns" products={gowns} />
        <ProductShowcase title="Kurtas & Outfits" products={kurtas} />
        <ProductShowcase title="One Piece" products={onePiece} />
        <ProductShowcase title="Skirts" products={skirts} />
        <ProductShowcase title="Toppers & Scarves" products={toppers} />
        <ProductShowcase title="Bottoms" products={bottoms} />

        {/* Video Carousel Section */}
        <VideoCarousel />


        {/* Newsletter Signup */}
        <NewsletterSignup />
      </div>
    </>
  );
};

export default Home; 