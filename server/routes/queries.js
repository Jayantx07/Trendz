const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Submit a new query (Public)
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const query = new Query({
      name,
      email,
      message
    });

    await query.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error submitting query:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all queries (Admin only)
router.get('/', auth, admin, async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update query status (Admin only)
router.patch('/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['New', 'Seen', 'Replied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const query = await Query.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    res.json(query);
  } catch (error) {
    console.error('Error updating query status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
