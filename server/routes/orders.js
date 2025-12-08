const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

// Create new order (Razorpay flow)
router.post('/create', auth, async (req, res) => {
  try {
    const { 
      shippingAddress, 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature,
      amount 
    } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
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
        method: 'razorpay',
        status: 'completed', // Assuming verification passed before calling this or verified here
        amount: amount
      },
      razorpay: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature
      },
      subtotal: amount, // Simplified for now, should be calculated
      total: amount,
      status: 'paid' // Default status as per requirement
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        const variantIndex = product.variants.findIndex(v => 
          v.size === item.variant.size && 
          v.color.name === item.variant.color.name
        );
        
        if (variantIndex !== -1) {
          product.variants[variantIndex].stock -= item.quantity;
          await product.save();
        }
      }
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate('items.product', 'name primaryImage slug')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// --- ADMIN ROUTES ---

// Get Dashboard Stats
router.get('/admin/stats', auth, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    const salesData = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$total" } } }
    ]);
    const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

    const aov = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;

    // Calculate Monthly Growth
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Sales & Orders This Month
    const currentMonthData = await Order.aggregate([
      { $match: { createdAt: { $gte: firstDayCurrentMonth } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
    ]);
    const salesThisMonth = currentMonthData.length ? currentMonthData[0].total : 0;
    const ordersThisMonth = currentMonthData.length ? currentMonthData[0].count : 0;

    // Sales & Orders Last Month
    const lastMonthData = await Order.aggregate([
      { $match: { createdAt: { $gte: firstDayLastMonth, $lt: firstDayCurrentMonth } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
    ]);
    const salesLastMonth = lastMonthData.length ? lastMonthData[0].total : 0;
    const ordersLastMonth = lastMonthData.length ? lastMonthData[0].count : 0;

    const salesGrowth = salesLastMonth === 0 ? (salesThisMonth > 0 ? 100 : 0) : ((salesThisMonth - salesLastMonth) / salesLastMonth) * 100;
    const ordersGrowth = ordersLastMonth === 0 ? (ordersThisMonth > 0 ? 100 : 0) : ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100;

    // Returning customers (users with > 1 order)
    const userOrderCounts = await Order.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: "returning" }
    ]);
    const returningCustomersCount = userOrderCounts.length > 0 ? userOrderCounts[0].returning : 0;
    const totalCustomers = await User.countDocuments({ role: 'user' }); // Assuming 'user' role
    const returningCustomersPercentage = totalCustomers > 0 ? ((returningCustomersCount / totalCustomers) * 100).toFixed(1) : 0;

    // Sales Performance (Daily)
    const salesPerformance = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 } // Last 30 days
    ]);

    // Best Selling Categories
    // This requires joining with Products to get category
    const bestSellingCategories = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          revenue: { $sum: "$items.totalPrice" }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Top Products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.name",
          unitsSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalSales,
      totalOrders,
      aov,
      returningCustomers: returningCustomersPercentage,
      salesGrowth: salesGrowth.toFixed(1),
      ordersGrowth: ordersGrowth.toFixed(1),
      salesPerformance,
      bestSellingCategories,
      topProducts
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// Get All Orders (Admin)
router.get('/admin/all', auth, admin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    // Map frontend status tabs to backend status
    if (status === 'pending') filter.status = { $in: ['pending', 'paid', 'processing'] }; // "Pending" tab
    else if (status === 'in-progress') filter.status = { $in: ['shipped', 'out-for-delivery'] }; // "In Progress" tab
    else if (status === 'completed') filter.status = { $in: ['delivered', 'completed'] }; // "Completed" tab
    
    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name primaryImage')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Admin all orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

module.exports = router;
