const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// Get current user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
      await cart.save();
    }
    res.json(cart);
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
    res.json(populatedCart);
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
    res.json(populatedCart);
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
    res.json(populatedCart);
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart' });
  }
});

module.exports = router; 