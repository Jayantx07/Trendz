import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';

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
        >
          <source src="/Background Video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* No heading in center anymore */}
        </div>
      </div>
      {/* Split heading: COUTURE (left), LUXURY (right) */}
      <div className="absolute bottom-8 left-0 w-full flex flex-row justify-between items-center px-6 z-20 md:left-1/2 md:-translate-x-1/2 md:flex-row md:justify-between md:w-full md:px-4">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-tenor text-white drop-shadow-lg">
          COUTURE
        </h1>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-tenor text-white drop-shadow-lg">
          LUXURY
        </h1>
      </div>
    </section>
  );
};

export default HeroSection; 