const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MOGO_URI || 'mongodb+srv://Trendz:Jayant007@trendz.lgqn2jj.mongodb.net/';

const sampleProducts = [
  {
    name: 'Cherry Blossom Sequin Cocktail Dress',
    slug: 'cherry-blossom-sequin-cocktail-dress',
    description: 'Pink ombre mini dress with mosaic sequin embroidery, cherry blossoms embroidered across, and a vine-inspired halter neckline.',
    brand: 'Trendz',
    category: 'dresses',
    gender: 'women',
    collections: ['Fall 2025', 'Dark Florals'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
        alt: 'Cherry Blossom Sequin Cocktail Dress',
        isPrimary: true
      }
    ],
    variants: [
      {
        size: 'XS',
        color: { name: 'Pink', hex: '#F8C8DC' },
        stock: 5,
        sku: 'CBSD-XS',
        price: 896700,
        isOnSale: false
      },
      {
        size: 'S',
        color: { name: 'Pink', hex: '#F8C8DC' },
        stock: 7,
        sku: 'CBSD-S',
        price: 896700,
        isOnSale: false
      }
    ],
    basePrice: 896700,
    isOnSale: false,
    tags: ['cherry blossom', 'cocktail', 'dress', 'sequin'],
    status: 'active'
  },
  {
    name: 'Cherry Blossom Embroidered Cap Sleeve Dress',
    slug: 'cherry-blossom-embroidered-cap-sleeve-dress',
    description: 'White mini dress with cherry blossom embroidery and cap sleeves.',
    brand: 'Trendz',
    category: 'dresses',
    gender: 'women',
    collections: ['Fall 2025', 'Dark Florals'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
        alt: 'Cherry Blossom Embroidered Cap Sleeve Dress',
        isPrimary: true
      }
    ],
    variants: [
      {
        size: 'M',
        color: { name: 'White', hex: '#FFFFFF' },
        stock: 4,
        sku: 'CBECSD-M',
        price: 313300,
        isOnSale: false
      },
      {
        size: 'L',
        color: { name: 'White', hex: '#FFFFFF' },
        stock: 3,
        sku: 'CBECSD-L',
        price: 313300,
        isOnSale: false
      }
    ],
    basePrice: 313300,
    isOnSale: false,
    tags: ['cherry blossom', 'embroidered', 'dress'],
    status: 'active'
  },
  {
    name: 'Cherry Blossom Cotton Poplin Dress',
    slug: 'cherry-blossom-cotton-poplin-dress',
    description: 'Light pink cotton poplin dress with cherry blossom print and adjustable straps.',
    brand: 'Trendz',
    category: 'dresses',
    gender: 'women',
    collections: ['Day Wear'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
        alt: 'Cherry Blossom Cotton Poplin Dress',
        isPrimary: true
      }
    ],
    variants: [
      {
        size: 'S',
        color: { name: 'Light Pink', hex: '#FADADD' },
        stock: 6,
        sku: 'CBCPD-S',
        price: 214600,
        isOnSale: false
      },
      {
        size: 'M',
        color: { name: 'Light Pink', hex: '#FADADD' },
        stock: 2,
        sku: 'CBCPD-M',
        price: 214600,
        isOnSale: false
      }
    ],
    basePrice: 214600,
    isOnSale: false,
    tags: ['cherry blossom', 'cotton', 'poplin', 'dress'],
    status: 'active'
  },
  {
    name: 'Cherry Blossom Threadwork Cardigan',
    slug: 'cherry-blossom-threadwork-cardigan',
    description: 'Light pink cardigan with cherry blossom threadwork and button front.',
    brand: 'Trendz',
    category: 'tops',
    gender: 'women',
    collections: ['Day Wear'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?auto=format&fit=crop&w=600&q=80',
        alt: 'Cherry Blossom Threadwork Cardigan',
        isPrimary: true
      }
    ],
    variants: [
      {
        size: 'M',
        color: { name: 'Blush', hex: '#F4C2C2' },
        stock: 8,
        sku: 'CBTC-M',
        price: 196600,
        isOnSale: false
      },
      {
        size: 'L',
        color: { name: 'Blush', hex: '#F4C2C2' },
        stock: 5,
        sku: 'CBTC-L',
        price: 196600,
        isOnSale: false
      }
    ],
    basePrice: 196600,
    isOnSale: false,
    tags: ['cherry blossom', 'threadwork', 'cardigan'],
    status: 'active'
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');

    await Product.deleteMany({});
    console.log('Old products removed');

    await Product.insertMany(sampleProducts);
    console.log('Sample products inserted!');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedProducts(); 