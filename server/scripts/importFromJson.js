#!/usr/bin/env node
/**
 * One-time migration: import products from a JSON file and upload images to Cloudinary
 *
 * Usage:
 *   node server/scripts/importFromJson.js path/to/products.json
 *
 * JSON shape (array of items):
 * [
 *   {
 *     "name": "Maroon One Piece",
 *     "category": "One Piece",       // will be normalized if needed
 *     "gender": "women",             // optional, defaults to 'women'
 *     "price": 4800,                  // base price
 *     "description": "...",          // optional
 *     "images": [
 *       "client/public/images/products/dresses/one piece/maroon one piece.jpg",
 *       "client/public/images/products/dresses/one piece/maroon piece with top.jpg"
 *     ]
 *   }
 * ]
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');

// Load env from server/.env
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const Product = require('../models/Product');
const { initCloudinary } = require('../config/cloudinary');

initCloudinary();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const CAT_MAP = {
  'One Piece': 'dresses',
  'Gowns': 'dresses',
  'Kurtas': 'tops',
  'Outfits': 'outerwear',
  'Toppers': 'tops',
  'Accessories': 'accessories',
  'Bottoms': 'bottoms',
  'Skirts': 'bottoms',
};

async function uploadToCloudinary(filePath, folder = 'products') {
  const res = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
  });
  return { url: res.secure_url, publicId: res.public_id };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI missing in server/.env');
    process.exit(1);
  }
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node server/scripts/importFromJson.js path/to/products.json');
    process.exit(1);
  }
  const absJson = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(absJson)) {
    console.error('JSON file not found:', absJson);
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const raw = fs.readFileSync(absJson, 'utf-8');
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) throw new Error('JSON must be an array');

    for (const item of items) {
      const name = item.name?.trim();
      if (!name) continue;
      const slug = item.slug || slugify(name);
      const category = CAT_MAP[item.category] || (String(item.category || 'dresses').toLowerCase());
      const gender = item.gender || 'women';
      const basePrice = Number(item.price || item.basePrice || 0);
      const description = item.description || '';
      const images = Array.isArray(item.images) ? item.images : [];

      console.log('Importing:', name);

      // Upload images sequentially (simple and safe)
      const cloudImgs = [];
      for (let i = 0; i < images.length; i++) {
        const p = images[i];
        const absImg = path.resolve(process.cwd(), p);
        if (!fs.existsSync(absImg)) {
          console.warn('  - Image not found, skipping:', absImg);
          continue;
        }
        const up = await uploadToCloudinary(absImg, 'products');
        cloudImgs.push({ url: up.url, publicId: up.publicId, isPrimary: i === 0, assetType: 'image' });
      }

      let doc = await Product.findOne({ slug });
      if (doc) {
        // Update existing
        doc.name = name;
        doc.category = category;
        doc.gender = gender;
        doc.basePrice = basePrice;
        doc.description = description || doc.description;
        if (cloudImgs.length) doc.images = cloudImgs;
        doc.status = 'active';
        await doc.save();
        console.log('  Updated existing product:', slug);
      } else {
        doc = new Product({
          name,
          slug,
          description,
          category,
          gender,
          basePrice,
          images: cloudImgs,
          status: 'active',
        });
        await doc.save();
        console.log('  Created product:', slug);
      }
    }

    console.log('DONE');
  } catch (err) {
    console.error('Import failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
