const User = require('../models/User');

module.exports = async function requireAdmin(req, res, next) {
  try {
    if (!req.user?.userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(req.user.userId).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ message: 'Server error validating admin' });
  }
};
