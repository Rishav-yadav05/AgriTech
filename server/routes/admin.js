const router = require('express').Router(), User = require('../models/User'), Farm = require('../models/Farm'), Crop = require('../models/Crop'), Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth'), { wrap, httpError } = require('../middleware/error');
router.use(protect, adminOnly);
router.get('/stats', wrap(async (req, res) => {
  const [users, farms, crops, orders, rev] = await Promise.all([User.countDocuments(), Farm.countDocuments(), Crop.countDocuments(), Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, t: { $sum: '$total' } } }])]);
  res.json({ users, farms, crops, orders, revenue: rev[0]?.t || 0 });
}));
router.get('/users', wrap(async (req, res) => res.json(await User.find().select('-password').sort('-createdAt'))));
router.delete('/users/:id', wrap(async (req, res) => {
  if (req.params.id === String(req.user._id)) throw httpError(400, 'You cannot delete yourself');
  await Promise.all([User.findByIdAndDelete(req.params.id), Farm.deleteMany({ owner: req.params.id }), Crop.deleteMany({ owner: req.params.id })]);
  res.json({ ok: true });
}));
module.exports = router;
