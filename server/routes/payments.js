const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');

// Initialize Razorpay with environment variables
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.warn('Razorpay credentials missing. Payment features will be disabled.');
}

// Create Razorpay Order
router.post('/create-order', auth, async (req, res) => {
  try {
    if (!razorpay) {
      console.error('Razorpay not initialized');
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }

    const { amount, currency = 'INR' } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency,
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Something went wrong with payment initialization' });
  }
});

// Verify Payment Signature
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Get Razorpay Key ID (for frontend)
router.get('/key', (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) {
    console.error('RAZORPAY_KEY_ID is missing');
    return res.status(500).json({ message: 'Payment configuration missing' });
  }
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
