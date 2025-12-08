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
            { id: 1, title: 'Party Wear', url: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764709225/Party-wear_nzxs8i.jpg' },
            { id: 2, title: 'Western Wear', url: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764709510/Western-wear_skuoka.png' },
            { id: 3, title: 'Casual Wear', url: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764709510/Casual-wear_vgvvdn.png' },
            { id: 4, title: 'Co-ord Set', url: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764709200/Co-ord_set_ihclt5.jpg' },
            { id: 5, title: 'Collection Piece', url: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764706441/products/file_xzilso.webp' },
            { id: 6, title: 'Collection Piece', url: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764705963/products/file_uupjut.webp' },
            { id: 7, title: 'Collection Piece', url: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764705634/products/file_vixiau.jpg' },
            { id: 8, title: 'Collection Piece', url: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764702550/products/file_xr70tf.webp' },
            { id: 9, title: 'Collection Piece', url: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764701887/products/file_qfqbmo.webp' },
            { id: 10, title: 'Collection Piece', url: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764685123/products/file_erdwm2.webp' },
            { id: 11, title: 'Collection Piece', url: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764675935/products/file_svgv20.jpg' },
          ]}
        />
      </section>
    </div>
  );
};

export default About;
