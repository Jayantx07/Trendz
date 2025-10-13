const express = require('express');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const Product = require('../models/Product');
const { initCloudinary, cloudinary } = require('../config/cloudinary');

initCloudinary();
const router = express.Router();

// List products (admin)
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { q, limit = 50 } = req.query;
    const filter = q
      ? { name: { $regex: q, $options: 'i' } }
      : {};
    const list = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('name slug category basePrice salePrice isOnSale primaryImage images _id');
    res.json(list);
  } catch (err) {
    console.error('List admin products error:', err);
    res.status(500).json({ message: 'Failed to list products' });
  }
});

// Get single product
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Get admin product error:', err);
    res.status(500).json({ message: 'Failed to get product' });
  }
});

// Create product
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(400).json({ message: 'Failed to create product', error: err.message });
  }
});

// Update product
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(400).json({ message: 'Failed to update product', error: err.message });
  }
});

// Delete product (and optionally delete Cloudinary assets)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { purgeAssets } = req.query; // 'true' to delete from Cloudinary as well
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (purgeAssets === 'true') {
      // delete images
      await Promise.all((product.images || []).map(img => img.publicId ? cloudinary.uploader.destroy(img.publicId, { resource_type: 'image' }) : null));
      // delete videos
      await Promise.all((product.videos || []).map(v => v.publicId ? cloudinary.uploader.destroy(v.publicId, { resource_type: 'video' }) : null));
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
});

// Attach images metadata after /api/media/upload usage
router.post('/:id/images', auth, requireAdmin, async (req, res) => {
  try {
    const { images = [] } = req.body; // [{url, publicId, alt, isPrimary}]
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    images.forEach(img => {
      product.images.push({
        url: img.url,
        publicId: img.publicId,
        alt: img.alt,
        isPrimary: !!img.isPrimary,
        assetType: 'image',
      });
    });

    // ensure one primary
    if (!product.images.some(i => i.isPrimary) && product.images.length) {
      product.images[0].isPrimary = true;
    }

    await product.save();
    res.json(product.images);
  } catch (err) {
    console.error('Add images error:', err);
    res.status(400).json({ message: 'Failed to add images', error: err.message });
  }
});

// Remove image by publicId
router.delete('/:id/images/:publicId', auth, requireAdmin, async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const { deleteFromCloudinary = 'false' } = req.query;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.images = product.images.filter(img => img.publicId !== publicId);
    await product.save();

    if (deleteFromCloudinary === 'true') {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    }

    res.json({ message: 'Image removed', images: product.images });
  } catch (err) {
    console.error('Remove image error:', err);
    res.status(500).json({ message: 'Failed to remove image', error: err.message });
  }
});

// Attach videos metadata
router.post('/:id/videos', auth, requireAdmin, async (req, res) => {
  try {
    const { videos = [] } = req.body; // [{url, publicId, type, duration}]
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    videos.forEach(v => {
      product.videos.push({
        url: v.url,
        publicId: v.publicId,
        type: v.type || 'preview',
        duration: v.duration,
        assetType: 'video',
      });
    });

    await product.save();
    res.json(product.videos);
  } catch (err) {
    console.error('Add videos error:', err);
    res.status(400).json({ message: 'Failed to add videos', error: err.message });
  }
});

// Remove video by publicId
router.delete('/:id/videos/:publicId', auth, requireAdmin, async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const { deleteFromCloudinary = 'false' } = req.query;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.videos = product.videos.filter(v => v.publicId !== publicId);
    await product.save();

    if (deleteFromCloudinary === 'true') {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    }

    res.json({ message: 'Video removed', videos: product.videos });
  } catch (err) {
    console.error('Remove video error:', err);
    res.status(500).json({ message: 'Failed to remove video', error: err.message });
  }
});

// Set primary image
router.put('/:id/images/primary', auth, requireAdmin, async (req, res) => {
  try {
    const { index, publicId } = req.body; // choose by index or publicId
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.images.forEach(img => (img.isPrimary = false));
    if (publicId) {
      const im = product.images.find(i => i.publicId === publicId);
      if (im) im.isPrimary = true;
    } else if (typeof index === 'number' && product.images[index]) {
      product.images[index].isPrimary = true;
    }

    await product.save();
    res.json(product.images);
  } catch (err) {
    console.error('Set primary image error:', err);
    res.status(400).json({ message: 'Failed to set primary image', error: err.message });
  }
});

module.exports = router;
