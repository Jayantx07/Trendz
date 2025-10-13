import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="https://res.cloudinary.com/dhaegglsm/video/upload/v1760336839/site-assets/Background_Video.jpg"
        >
          <source src="https://res.cloudinary.com/dhaegglsm/video/upload/v1760336839/site-assets/Background_Video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* COUTURE and LUXURY labels at bottom corners */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Left - COUTURE */}
        <div className="absolute bottom-12 left-12">
          <Link to="/products?category=couture" className="group">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-tenor text-white tracking-wider font-light group-hover:text-gray-300 transition-colors duration-300">
              COUTURE
            </h2>
          </Link>
        </div>
        
        {/* Right - LUXURY */}
        <div className="absolute bottom-12 right-12">
          <Link to="/products?category=luxury" className="group">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-tenor text-white tracking-wider font-light group-hover:text-gray-300 transition-colors duration-300">
              LUXURY
            </h2>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 