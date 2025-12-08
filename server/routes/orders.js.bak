const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create new order from cart
router.post('/create', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, paymentToken } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock availability
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      const variant = product.variants.find(v => 
        v.size === item.variant.size && 
        v.color.name === item.variant.color.name
      );
      
      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name} - ${item.variant.color.name} - ${item.variant.size}` 
        });
      }
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      variant: item.variant,
      quantity: item.quantity,
      price: item.salePrice || item.price,
      totalPrice: (item.salePrice || item.price) * item.quantity
    }));

    // Create order
    const order = new Order({
      user: req.user.userId,
      items: orderItems,
      shipping: {
        address: shippingAddress,
        method: 'standard'
      },
      payment: {
        method: paymentMethod,
        status: 'pending',
        amount: 0 // Will be calculated
      }
    });

    // Calculate totals
    await order.calculateTotals();

    // TODO: Process payment with Stripe/Razorpay
    // For now, we'll mark as completed for testing
    order.payment.status = 'completed';
    order.payment.transactionId = `txn_${Date.now()}`;
    order.status = 'confirmed';

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      const variantIndex = product.variants.findIndex(v => 
        v.size === item.variant.size && 
        v.color.name === item.variant.color.name
      );
      
      if (variantIndex !== -1) {
        product.variants[variantIndex].stock -= item.quantity;
        await product.save();
      }
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name primaryImage')
      .populate('user', 'firstName lastName email');

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { user: req.user.userId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('items.product', 'name primaryImage slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Get single order
router.get('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user.userId 
    })
    .populate('items.product', 'name images slug brand category')
    .populate('user', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// Cancel order
router.patch('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user.userId 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ 
        message: 'Cannot cancel order that has been shipped or delivered' 
      });
    }

    await order.updateStatus('cancelled', reason || 'Cancelled by customer');

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      const variantIndex = product.variants.findIndex(v => 
        v.size === item.variant.size && 
        v.color.name === item.variant.color.name
      );
      
      if (variantIndex !== -1) {
        product.variants[variantIndex].stock += item.quantity;
        await product.save();
      }
    }

    // TODO: Process refund if payment was completed

    res.json({ 
      message: 'Order cancelled successfully',
      order: order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error cancelling order' });
  }
});

// Request return
router.post('/:orderId/return', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items, reason } = req.body;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user.userId 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.canBeReturned()) {
      return res.status(400).json({ 
        message: 'Order is not eligible for return' 
      });
    }

    // TODO: Implement return request logic
    // For now, just update status
    await order.updateStatus('returned', `Return requested: ${reason}`);

    res.json({ 
      message: 'Return request submitted successfully',
      order: order
    });

  } catch (error) {
    console.error('Return request error:', error);
    res.status(500).json({ message: 'Server error processing return request' });
  }
});

// Track order
router.get('/:orderId/tracking', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user.userId 
    }).select('orderNumber status statusHistory shipping');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const trackingInfo = {
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      trackingNumber: order.shipping.trackingNumber,
      carrier: order.shipping.carrier,
      estimatedDelivery: order.shipping.estimatedDelivery,
      statusHistory: order.statusHistory
    };

    res.json(trackingInfo);

  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Server error fetching tracking info' });
  }
});

// Admin routes (for order management)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // TODO: Add admin role check
    const { page = 1, limit = 20, status, search } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shipping.address.firstName': { $regex: search, $options: 'i' } },
        { 'shipping.address.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name primaryImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total
      }
    });

  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Admin update order status
router.patch('/admin/:orderId/status', auth, async (req, res) => {
  try {
    // TODO: Add admin role check
    const { orderId } = req.params;
    const { status, note, trackingNumber, carrier } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.updateStatus(status, note);

    if (trackingNumber) {
      order.shipping.trackingNumber = trackingNumber;
    }
    
    if (carrier) {
      order.shipping.carrier = carrier;
    }

    await order.save();

    res.json({ 
      message: 'Order status updated successfully',
      order: order
    });

  } catch (error) {
    console.error('Admin update order error:', error);
    res.status(500).json({ message: 'Server error updating order' });
  }
});

module.exports = router;