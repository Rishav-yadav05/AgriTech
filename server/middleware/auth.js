const jwt = require('jsonwebtoken'), User = require('../models/User');
exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return res.status(401).json({ message: 'Login required' });
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'Account not found' });
    next();
  } catch { res.status(401).json({ message: 'Session expired, please log in again' }); }
};
exports.adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access only' });
