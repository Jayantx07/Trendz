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
      image: "https://res.cloudinary.com/dhaegglsm/image/upload/v1760336008/site-assets/images/products/evening-gown-1.jpg",
      category: "Dresses",
      isNew: true,
      isSale: true
    },
    {
      id: 2,
      name: "Cherry Blossom Embroidered Cap Sleeve Dress",
      price: 995,
      originalPrice: 1990,
      image: "https://res.cloudinary.com/dhaegglsm/image/upload/v1760335108/site-assets/images/products/blouse-1.jpg",
      category: "Dresses",
      isNew: true,
      isSale: true
    },
    {
      id: 3,
      name: "Signature Handbag",
      price: 895,
      image: "https://res.cloudinary.com/dhaegglsm/image/upload/v1760336009/site-assets/images/products/handbag-1.jpg",
      category: "Bags & Accessories",
      isNew: false,
      isSale: false
    },
    {
      id: 4,
      name: "Evening Gown with Floral Embroidery",
      price: 2495,
      image: "https://res.cloudinary.com/dhaegglsm/image/upload/v1760336857/site-assets/images/products/dresses/full_length_pieces/evening-gown-1.jpg",
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
      image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335978/site-assets/images/products/dresses/gowns/blue_white_liquid_pattern_gown.jpg',
      price: 5200,
    },
    {
      name: 'Evening Gown',
      image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760336857/site-assets/images/products/dresses/full_length_pieces/evening-gown-1.jpg',
      price: 6400,
    },
    {
      name: 'Shiny Silver Dress',
      image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335960/site-assets/images/products/dresses/full_length_pieces/shiny_silver_dress.jpg',
      price: 5650,
    },
    {
      name: 'White Full Piece',
      image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335964/site-assets/images/products/dresses/full_length_pieces/white_full_piece.jpg',
      price: 4200,
    },
  ];

  const kurtas = [
    {
      name: 'Classic Kurta',
      image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335979/site-assets/images/products/dresses/kurtas/kurta.jpg',
      price: 3200,
    },
    {
      name: 'Frame Kurta',
      image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335975/site-assets/images/products/dresses/full_outfits/frame_kurta.jpg',
      price: 3300,
      altImage: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335974/site-assets/images/products/dresses/full_outfits/frame_kurta_2.jpg',
    },
    {
      name: 'Beige Outfit',
      image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335967/site-assets/images/products/dresses/full_outfits/biege_outifit.jpg',
      price: 3500,
    },
    {
      name: 'Black Outfit',
      image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335970/site-assets/images/products/dresses/full_outfits/black_outfit.jpg',
      price: 3600,
      altImage: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335968/site-assets/images/products/dresses/full_outfits/black_outfit_topper_view.jpg',
    },
  ];

  const onePiece = [
    {
      name: 'Maroon One Piece',
      image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335981/site-assets/images/products/dresses/one_piece/maroon_one_piece.jpg',
      price: 4800,
      altImage: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335982/site-assets/images/products/dresses/one_piece/maroon_piece_with_top.jpg',
    },
    {
      name: 'One-side Sleeve Black',
      image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335984/site-assets/images/products/dresses/one_piece/one_side_sleeve_black_one_piece.jpg',
      price: 5100,
    },
    {
      name: 'Side Cut Long Black',
      image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335963/site-assets/images/products/dresses/full_length_pieces/side_cut_long_piece_black.jpg',
      price: 4600,
      altImage: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335962/site-assets/images/products/dresses/full_length_pieces/side_cut_long_piece_black_2.jpg',
    },
    {
      name: 'Black Full Piece',
      image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335957/site-assets/images/products/dresses/full_length_pieces/black_full_piece.jpg',
      price: 5000,
    },
  ];

  const skirts = [
    { name: 'Beige Skirt', image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335985/site-assets/images/products/dresses/skirts/biege_skirt.jpg', price: 2100 },
    { name: 'Black & White Pattern', image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335987/site-assets/images/products/dresses/skirts/black_and_white_pattern_skirt.jpg', price: 2300 },
    { name: 'Green Velvet Skirt', image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335997/site-assets/images/products/dresses/skirts/green_valvet_skirt.jpg', price: 2600 },
    { name: 'Zebra Liquid Pattern', image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760336002/site-assets/images/products/dresses/skirts/zebra_liquid_pattern_skirt.jpg', price: 2400 },
  ];

  const toppers = [
    { name: 'Topper', image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760336003/site-assets/images/products/dresses/toppers/Topper.jpg', price: 2800 },
    { name: 'Scarf', image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335976/site-assets/images/products/dresses/full_outfits/scarf-1.jpg', price: 1400 },
    { name: 'Black Topper View', image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335968/site-assets/images/products/dresses/full_outfits/black_outfit_topper_view.jpg', price: 3000 },
    { name: 'Black Outfit', image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335970/site-assets/images/products/dresses/full_outfits/black_outfit.jpg', price: 3000 },
  ];

  const bottoms = [
    { name: 'Bottom', image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335115/site-assets/images/products/dresses/bottom/bottom.jpg', price: 1900 },
    { name: 'Black Skirt 1', image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760335988/site-assets/images/products/dresses/skirts/black_skirt_1-1.jpg', price: 2200 },
    { name: 'Black Skirt 2', image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760336889/site-assets/images/products/dresses/skirts/black_skirt_2-1.jpg', price: 2200 },
    { name: 'White Skirt', image: 'https://res.cloudinary.com/dhaegglsm/image/upload/v1760336000/site-assets/images/products/dresses/skirts/white_skirt_1-3.jpg', price: 2100 },
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