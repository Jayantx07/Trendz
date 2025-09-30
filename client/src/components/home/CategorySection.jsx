import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const items = [
  {
    name: 'Dresses',
    href: '/products?category=Dresses',
    img: '/images/products/dresses.webp',
  },
  {
    name: 'Kurtas',
    href: '/products?category=Kurtas',
    img: '/images/products/kurta.jpg',
  },
  {
    name: 'Tops',
    href: '/products?category=Tops',
    img: '/images/products/Topper.jpg',
  },
  {
    name: 'Bottoms',
    href: '/products?category=Bottoms',
    img: '/images/products/bottom.webp',
  },
];

const CategoryCard = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.06 }}
  >
    <Link to={item.href} className="group block">
      <div className="overflow-hidden rounded-md">
        <img
          src={item.img}
          alt={item.name}
          className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center justify-between pt-3">
        <span className="text-sm md:text-base font-tenor text-gray-900">{item.name}</span>
        <span className="text-gray-500 group-hover:text-accent transition-colors">→</span>
      </div>
    </Link>
  </motion.div>
);

const CategorySection = () => {
  return (
    <section className="py-10 bg-white">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {items.map((item, i) => (
            <CategoryCard key={item.name} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
