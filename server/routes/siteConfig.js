const express = require('express');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const SiteConfig = require('../models/SiteConfig');

const router = express.Router();

// Public: get current site config
router.get('/', async (_req, res) => {
  try {
    const cfg = await SiteConfig.findOne().lean();
    res.json(cfg || {});
  } catch (err) {
    console.error('Get site-config error:', err);
    res.status(500).json({ message: 'Failed to load site config' });
  }
});

// Admin: get
router.get('/admin', auth, requireAdmin, async (_req, res) => {
  try {
    const cfg = await SiteConfig.findOne().lean();
    res.json(cfg || {});
  } catch (err) {
    console.error('Admin get site-config error:', err);
    res.status(500).json({ message: 'Failed to load site config' });
  }
});

// Admin: upsert
router.put('/admin', auth, requireAdmin, async (req, res) => {
  try {
    const update = req.body || {};
    const cfg = await SiteConfig.findOneAndUpdate({}, update, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ message: 'Site config updated', config: cfg });
  } catch (err) {
    console.error('Update site-config error:', err);
    res.status(500).json({ message: 'Failed to update site config' });
  }
});

module.exports = router;
