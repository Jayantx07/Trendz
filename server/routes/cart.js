const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// Helper to compute the correct variant image for a cart item
function selectDisplayImage(product, cartItem) {
  if (!product) return undefined;
  
  const variantId = cartItem?.variant?.variantId;
  const size = cartItem?.variant?.size;
  const colorName = cartItem?.variant?.color?.name?.toLowerCase?.();
  const variantIndex = cartItem?.variant?.variantIndex;
  
  const topImages = Array.isArray(product.images) ? product.images : [];
  const variants = Array.isArray(product.variants) ? product.variants : [];
  
  // 1) Try to match product.images by variantIndex (MOST RELIABLE)
  if (typeof variantIndex === 'number') {
    const byVariantIndex = topImages.filter(img => typeof img.variantIndex === 'number' && img.variantIndex === variantIndex);
    if (byVariantIndex.length > 0) {
      const primary = byVariantIndex.find(img => img.isPrimary);
      const picked = primary || byVariantIndex[0];
      return { url: picked.url, publicId: picked.publicId };
    }
  }
  
  // 2) Try to find variant by Mongoose _id and check its images
  if (variantId) {
    const matchedVariant = variants.find(v => v._id && String(v._id) === String(variantId));
    if (matchedVariant && Array.isArray(matchedVariant.images) && matchedVariant.images.length > 0) {
      const primary = matchedVariant.images.find(img => img.isPrimary);
      const picked = primary || matchedVariant.images[0];
      if (picked) return { url: picked.url, publicId: picked.publicId };
    }
  }
  
  // 3) Try to match variant by size
  if (size) {
    const sizeVariants = variants.filter(v => v.size === size || (Array.isArray(v.sizes) && v.sizes.includes(size)));
    for (const v of sizeVariants) {
      if (Array.isArray(v.images) && v.images.length > 0) {
        const primary = v.images.find(img => img.isPrimary);
        const picked = primary || v.images[0];
        if (picked) return { url: picked.url, publicId: picked.publicId };
      }
    }
  }
  
  // 4) Try product-level images filtered by variantId
  if (variantId) {
    const byVariantId = topImages.filter(img => img.variantId && String(img.variantId) === String(variantId));
    if (byVariantId.length > 0) {
      const primary = byVariantId.find(img => img.isPrimary);
      const picked = primary || byVariantId[0];
      return { url: picked.url, publicId: picked.publicId };
    }
  }
  
  // 5) Try color match on top-level images
  if (colorName && topImages.length > 0) {
    const byColor = topImages.filter(img => img.colorName?.toLowerCase?.() === colorName);
    if (byColor.length > 0) {
      const primary = byColor.find(img => img.isPrimary);
      const picked = primary || byColor[0];
      return { url: picked.url, publicId: picked.publicId };
    }
  }
  
  // 6) Fallback to primary or first image
  const primary = topImages.find(img => img.isPrimary);
  if (primary) return { url: primary.url, publicId: primary.publicId };
  if (topImages[0]) return { url: topImages[0].url, publicId: topImages[0].publicId };
  
  return undefined;
}

// Get current user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
      await cart.save();
    }
    
    // Inject computed variant imageUrl for each cart item
    const cartObj = cart.toObject();
    cartObj.items = (cartObj.items || []).map((it) => {
      const displayImage = selectDisplayImage(it.product, it);
      const variant = { ...(it.variant || {}) };
      
      // CRITICAL: Trust the imageUrl from client if it exists (client knows what was displayed)
      // Only use server-computed displayImage as fallback
      if (!it.variant?.imageUrl && displayImage?.url) {
        variant.imageUrl = displayImage.url;
      }
      
      return { ...it, variant, displayImage };
    });
    
    res.json(cartObj);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// Add or update cart (replace all items)
router.post('/', auth, async (req, res) => {
  try {
    const { items } = req.body;
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items });
    } else {
      cart.items = items;
      cart.updatedAt = Date.now();
    }
    await cart.save();

    // Always return cart with populated product details so frontend
    // can reliably render names/images even after quantity updates.
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    
    // Inject computed variant imageUrl for each cart item
    const cartObj = populatedCart.toObject();
    cartObj.items = (cartObj.items || []).map((it) => {
      const displayImage = selectDisplayImage(it.product, it);
      const variant = { ...(it.variant || {}) };
      
      // CRITICAL: Trust the imageUrl from client if it exists
      if (!it.variant?.imageUrl && displayImage?.url) {
        variant.imageUrl = displayImage.url;
      }
      
      return { ...it, variant, displayImage };
    });
    
    res.json(cartObj);
  } catch (err) {
    res.status(500).json({ message: 'Error saving cart' });
  }
});

// Remove a specific item (product + optional variant) from cart
router.delete('/item/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { variant } = req.body || {};
    const size = variant?.size;
    const colorName = variant?.color?.name;

    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter((item) => {
      const sameProduct = item.product.toString() === productId;
      const sameSize = size ? item.variant?.size === size : true;
      const sameColor = colorName ? item.variant?.color?.name === colorName : true;
      // keep item when it does NOT match all provided keys
      return !(sameProduct && sameSize && sameColor);
    });
    cart.updatedAt = Date.now();
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    
    // Inject computed variant imageUrl for each cart item
    const cartObj = populatedCart.toObject();
    cartObj.items = (cartObj.items || []).map((it) => {
      const displayImage = selectDisplayImage(it.product, it);
      const variant = { ...(it.variant || {}) };
      
      // Trust client-provided imageUrl if exists
      if (!it.variant?.imageUrl && displayImage?.url) {
        variant.imageUrl = displayImage.url;
      }
      
      return { ...it, variant, displayImage };
    });
    
    res.json(cartObj);
  } catch (err) {
    res.status(500).json({ message: 'Error removing item' });
  }
});

// Clear cart
router.post('/clear', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    
    // Inject computed variant imageUrl for each cart item
    const cartObj = populatedCart.toObject();
    cartObj.items = (cartObj.items || []).map((it) => {
      const displayImage = selectDisplayImage(it.product, it);
      const variant = { ...(it.variant || {}) };
      
      // Trust client-provided imageUrl if exists
      if (!it.variant?.imageUrl && displayImage?.url) {
        variant.imageUrl = displayImage.url;
      }
      
      return { ...it, variant, displayImage };
    });
    
    res.json(cartObj);
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart' });
  }
});

module.exports = router; 