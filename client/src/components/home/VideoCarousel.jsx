import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Videos live in client/public/videos so they are accessible at /videos/<name>.mp4
// Add/rename items here to control the carousel contents.
const useVideos = () =>
  useMemo(
    () => [
      {
        src: 'https://res.cloudinary.com/dhaegglsm/video/upload/site-assets/videos/reel_01.mp4',
        poster: 'https://res.cloudinary.com/dhaegglsm/video/upload/site-assets/videos/reel_01.jpg',
        title: 'Raahat Ruffled Dress',
        price: 4600,
        currency: '₹',
      },
      {
        src: 'https://res.cloudinary.com/dhaegglsm/video/upload/site-assets/videos/REEL_02.mp4',
        poster: 'https://res.cloudinary.com/dhaegglsm/video/upload/site-assets/videos/REEL_02.jpg',
        title: 'Saanjh Long Dress',
        price: 4200,
        currency: '₹',
      },
      {
        src: 'https://res.cloudinary.com/dhaegglsm/video/upload/site-assets/videos/reel_03.mp4',
        poster: 'https://res.cloudinary.com/dhaegglsm/video/upload/site-assets/videos/reel_03.jpg',
        title: 'Maati Kurta',
        price: 3200,
        currency: '₹',
      },
      {
        src: 'https://res.cloudinary.com/dhaegglsm/video/upload/site-assets/videos/product_01.mp4',
        poster: 'https://res.cloudinary.com/dhaegglsm/video/upload/site-assets/videos/product_01.jpg',
        title: 'Saanjh Short Dress',
        price: 4100,
        currency: '₹',
      },
      {
        src: 'https://res.cloudinary.com/dhaegglsm/video/upload/site-assets/videos/reel_05.mp4',
        poster: 'https://res.cloudinary.com/dhaegglsm/video/upload/site-assets/videos/reel_05.jpg',
        title: 'Bloom Co-ord',
        price: 3500,
        currency: '₹',
      },
    ],
    []
  );

const VideoCard = ({ item }) => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const vis = entry.isIntersecting && entry.intersectionRatio > 0.4;
        setIsVisible(vis);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isVisible) {
      // play only when visible
      const playPromise = v.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    } else {
      v.pause();
    }
  }, [isVisible]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="snap-start shrink-0 w-[270px] sm:w-[300px] md:w-[320px] lg:w-[340px]"
    >
      <div className="relative rounded-xl overflow-hidden shadow-lg bg-black">
        <video
          ref={videoRef}
          className="w-full h-[420px] object-cover"
          src={item.src}
          poster={item.poster}
          muted
          playsInline
          preload="none"
          loop
        />
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
          <div className="flex items-start gap-3">
            {/* Optional small image placeholder circle to mimic inspo layout */}
            <div className="w-10 h-10 rounded-lg bg-white/80 ring-1 ring-white/40 overflow-hidden flex items-center justify-center text-xs text-gray-700">
              Vid
            </div>
            <div className="flex-1">
              <h4 className="font-medium leading-tight">{item.title}</h4>
              <p className="text-sm opacity-90">
                {item.currency} {item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="mt-3 w-full bg-black/70 hover:bg-black text-white text-sm py-2 rounded-md transition-colors"
            onClick={() => {}}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const VideoCarousel = () => {
  const items = useVideos();
  const scrollerRef = useRef(null);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector(':scope > *');
    const amount = card ? card.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-tenor tracking-wide text-gray-900">
              Video Highlights
            </h2>
            <p className="text-gray-600 mt-1">Explore our looks in motion.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              aria-label="Previous"
              className="p-2 rounded-full bg-black text-white hover:bg-black/90"
              onClick={() => scrollBy(-1)}
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <button
              aria-label="Next"
              className="p-2 rounded-full bg-black text-white hover:bg-black/90"
              onClick={() => scrollBy(1)}
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="relative">
          {/* Mobile nav buttons overlay */}
          <div className="sm:hidden absolute inset-y-0 left-0 flex items-center">
            <button
              className="m-2 p-2 rounded-full bg-black text-white shadow"
              onClick={() => scrollBy(-1)}
              aria-label="Previous"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
          </div>
          <div className="sm:hidden absolute inset-y-0 right-0 flex items-center">
            <button
              className="m-2 p-2 rounded-full bg-black text-white shadow"
              onClick={() => scrollBy(1)}
              aria-label="Next"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </div>

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pr-2"
          >
            {items.map((it, idx) => (
              <VideoCard key={idx} item={it} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoCarousel;
