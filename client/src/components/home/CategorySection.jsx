import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMedia } from '../../context/MediaMapContext.jsx';

const items = [
  {
    name: 'Western Wear',
    href: '/products?category=western-dress',
    img: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764709510/Western-wear_skuoka.png',
  },
  {
    name: 'Party Wear',
    href: '/products?category=party-wear',
    img: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764709225/Party-wear_nzxs8i.jpg',
  },
  {
    name: 'Co-Ord Sets',
    href: '/products?category=co-ord-set',
    img: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764709200/Co-ord_set_ihclt5.jpg',
  },
  {
    name: 'Casual Wear',
    href: '/products?category=casual-wear',
    img: 'https://res.cloudinary.com/dbx8ravps/image/upload/v1764709510/Casual-wear_vgvvdn.png',
  },
];

const CategoryCard = ({ item, index }) => {
  const { resolve } = useMedia();
  const src = resolve(item.img);
  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.06 }}
  >
    <Link to={item.href} className="group block">
      <div className="overflow-hidden rounded-md">
        <img
          src={src}
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
}

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
