import React from 'react';
import HorizontalScrollCarousel from '../components/ui/HorizontalScrollCarousel.jsx';

const About = () => {
  return (
    <div className="container pt-24 md:pt-28 pb-16">
      {/* Intro */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-tenor text-gray-900 mb-3">About VASAAE</h1>
        <p className="text-gray-600 max-w-3xl">
          Inspired by timeless silhouettes and modern craftsmanship, VASAAE creates elegant pieces designed
          to be worn and loved beyond seasons.
        </p>
      </header>

      {/* Story section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-10">
        <div>
          <h2 className="text-2xl font-tenor text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We started with a simple belief: luxury should feel effortless. Each garment is crafted with
            attention to detail, premium fabrics, and refined finishes—so you can focus on how you feel in it.
          </p>
          <p className="text-gray-700 leading-relaxed">
            From everyday essentials to occasion pieces, our collections balance comfort and sophistication,
            honoring artisanal techniques while embracing contemporary design.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden border border-gray-200 h-64 md:h-72">
          <img
            src="https://res.cloudinary.com/dbx8ravps/image/upload/v1765021119/Screenshot_1-12-2025_204435_-removebg-preview_convm7.png"
            alt="VASAAE brand"
            className="w-full h-full object-contain bg-white p-8"
          />
        </div>
      </section>

      {/* Values */}
      <section className="mb-10">
        <h2 className="text-2xl font-tenor text-gray-900 mb-6">What We Value</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-lg font-tenor text-gray-900 mb-2">Craftsmanship</h3>
            <p className="text-gray-700 text-sm">Tailored cuts, thoughtful details, and quality that lasts.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-lg font-tenor text-gray-900 mb-2">Timeless Design</h3>
            <p className="text-gray-700 text-sm">Pieces that transcend trends and feel modern for years.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-lg font-tenor text-gray-900 mb-2">Comfort & Fit</h3>
            <p className="text-gray-700 text-sm">Beautiful garments you’ll actually enjoy wearing every day.</p>
          </div>
        </div>
      </section>

      {/* Horizontal Scroll Carousel */}
      <section className="mt-4">
        <HorizontalScrollCarousel
          cards={[
            { id: 1, title: 'Evening Gown', url: '/images/products/dresses/full length pieces/evening-gown-1.jpg' },
            { id: 2, title: 'Beige Skirt', url: '/images/products/dresses/skirts/biege skirt.jpg' },
            { id: 3, title: 'Maroon One Piece', url: '/images/products/dresses/one piece/maroon one piece.jpg' },
            { id: 4, title: 'Black Outfit', url: '/images/products/dresses/full outfits/black outfit.jpg' },
            { id: 5, title: 'Pattern Gown', url: '/images/products/dresses/gowns/blue white liquid pattern gown.jpg' },
            { id: 6, title: 'Shiny Silver Dress', url: '/images/products/dresses/full length pieces/shiny silver dress.jpg' },
            { id: 7, title: 'White Full Piece', url: '/images/products/dresses/full length pieces/white full piece.jpg' },
            { id: 8, title: 'Pattern Skirt', url: '/images/products/dresses/skirts/black and white pattern skirt.jpg' },
          ]}
        />
      </section>
    </div>
  );
};

export default About;
