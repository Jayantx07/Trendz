import React, { useRef } from "react";
import { motion, useTransform, useScroll } from "framer-motion";

// Reusable horizontal scroll on vertical scroll component
// Usage: <HorizontalScrollCarousel cards={[{id:1, url:"/images/...", title:"..."}, ...]} />
export const HorizontalScrollCarousel = ({ cards: inputCards }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);

  const cards = inputCards && inputCards.length > 0 ? inputCards : defaultCards;

  return (
    <section ref={targetRef} className="relative h-[220vh] md:h-[260vh] bg-white">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-4 px-4">
          {cards.map((card) => (
            <Card card={card} key={card.id} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const Card = ({ card }) => {
  const url = encodeURI(card.url || "");
  return (
    <div
      key={card.id}
      className="group relative h-[320px] w-[320px] md:h-[420px] md:w-[420px] overflow-hidden rounded-xl border border-gray-200 bg-neutral-100"
    >
      <div
        style={{
          backgroundImage: `url("${url}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-105"
      />
      {/* Fallback img element to ensure rendering when CSS background fails */}
      <img
        src={url}
        alt={card.title || "carousel image"}
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-0"
        loading="lazy"
      />
      {card.title && (
        <div className="absolute inset-0 z-10 grid place-content-end p-4">
          <p className="inline-block rounded-md bg-black/50 px-3 py-1 text-white text-sm">
            {card.title}
          </p>
        </div>
      )}
    </div>
  );
};

const defaultCards = [
  {
    url: "/images/products/dresses/full length pieces/evening-gown-1.jpg",
    title: "Evening Gown",
    id: 1,
  },
  {
    url: "/images/products/dresses/skirts/biege skirt.jpg",
    title: "Beige Skirt",
    id: 2,
  },
  {
    url: "/images/products/dresses/one piece/maroon one piece.jpg",
    title: "Maroon One Piece",
    id: 3,
  },
  {
    url: "/images/products/dresses/full outfits/black outfit.jpg",
    title: "Black Outfit",
    id: 4,
  },
  {
    url: "/images/products/dresses/gowns/blue white liquid pattern gown.jpg",
    title: "Pattern Gown",
    id: 5,
  },
];

export default HorizontalScrollCarousel;
