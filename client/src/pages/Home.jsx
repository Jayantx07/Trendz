import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Heart } from 'lucide-react';
import HeroSection from '../components/home/HeroSection.jsx';
import NewArrivals from '../components/home/NewArrivals.jsx';
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

        {/* Minimal SALE block as in screenshot 1 */}
        <div className="w-full flex flex-col items-center justify-center mt-8 mb-16">
          <div className="text-center">
            <div className="text-lg tracking-widest mb-2 font-tenor text-black">UP TO 50% OFF</div>
            <div className="text-6xl font-tenor font-normal mb-2 text-black">SALE</div>
            <a href="/products?sale=true" className="inline-block mt-2 text-lg underline underline-offset-4 hover:text-accent transition-colors font-tenor text-black">Shop Now</a>
          </div>
        </div>

        {/* New Arrivals */}
        <NewArrivals />

        {/* Newsletter Signup */}
        <NewsletterSignup />
      </div>
    </>
  );
};

export default Home; 