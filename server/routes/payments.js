const express = require('express');
const router = express.Router();

// Helpers to talk to PayPal REST without extra deps
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID?.replace('-', '_') || process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY || process.env.PAYPAL_SECRET || process.env.PAYPAL_SECRET_KEY;
const PAYPAL_ENV = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase();
const PAYPAL_API_BASE = PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET_KEY}`).toString('base64');
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal token error: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return data.access_token;
}

// Expose client id to frontend
router.get('/paypal/config', (req, res) => {
  if (!process.env.PAYPAL_CLIENT_ID) {
    return res.status(500).json({ message: 'Missing PAYPAL_CLIENT_ID' });
  }
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID, env: PAYPAL_ENV });
});

// Create order
router.post('/paypal/create-order', async (req, res) => {
  try {
    const { amount = '19.99', currency = 'USD' } = req.body || {};
    const accessToken = await getAccessToken();

    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: currency, value: String(amount) },
          },
        ],
      }),
    });

    const data = await orderRes.json();
    if (!orderRes.ok) {
      return res.status(orderRes.status).json(data);
    }
    return res.json({ id: data.id });
  } catch (err) {
    console.error('PayPal create-order error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Capture order
router.post('/paypal/capture/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const accessToken = await getAccessToken();
    const capRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await capRes.json();
    if (!capRes.ok) {
      return res.status(capRes.status).json(data);
    }
    return res.json(data);
  } catch (err) {
    console.error('PayPal capture error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
