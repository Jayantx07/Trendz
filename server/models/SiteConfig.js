const mongoose = require('mongoose');

const CarouselItemSchema = new mongoose.Schema({
  title: String,
  price: Number,
  currency: { type: String, default: 'INR' },
  url: String,
  poster: String,
}, { _id: false });

const SiteConfigSchema = new mongoose.Schema({
  heroVideo: {
    url: String,
    poster: String,
  },
  carousel: [CarouselItemSchema],
  categoryThumbnails: {
    Dresses: String,
    Kurtas: String,
    Tops: String,
    Bottoms: String,
    Accessories: String,
    Bridal: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('SiteConfig', SiteConfigSchema);
