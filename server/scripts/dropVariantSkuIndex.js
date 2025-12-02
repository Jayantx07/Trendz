const mongoose = require('mongoose');
require('dotenv').config();

// One-time script to remove the obsolete unique index on variants.sku
// which was causing E11000 duplicate key errors when sku is null.

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trendz_dev';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'products' }).toArray();
    if (!collections.length) {
      console.log('products collection does not exist yet, nothing to do');
      await mongoose.disconnect();
      return;
    }

    const indexes = await db.collection('products').indexes();
    const variantSkuIndex = indexes.find((idx) => idx.name === 'variants.sku_1');

    if (!variantSkuIndex) {
      console.log('variants.sku_1 index not found, nothing to drop');
    } else {
      console.log('Dropping index variants.sku_1 ...');
      await db.collection('products').dropIndex('variants.sku_1');
      console.log('Index variants.sku_1 dropped successfully');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Failed to drop variants.sku_1 index:', err);
    process.exitCode = 1;
  }
}

run();
