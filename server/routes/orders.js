const router = require('express').Router(), Order = require('../models/Order'), Resource = require('../models/Resource');
const { protect, adminOnly } = require('../middleware/auth'), { wrap, httpError } = require('../middleware/error');
router.use(protect);
router.get('/', wrap(async (req, res) => {
  const q = req.user.role === 'admin' && req.query.all ? {} : { user: req.user._id };
  res.json(await Order.find(q).populate('user', 'name email').sort('-createdAt'));
}));
router.post('/', wrap(async (req, res) => {
  const { items, address } = req.body;
  if (!Array.isArray(items) || !items.length) throw httpError(400, 'Cart is empty');
  const lines = [];
  for (const it of items) {
    const qty = Math.floor(Number(it.qty));
    if (!(qty > 0)) throw httpError(400, 'Invalid quantity');
    // Atomic stock decrement; price always comes from the database, never from the client
    const r = await Resource.findOneAndUpdate({ _id: it.resource, stock: { $gte: qty } }, { $inc: { stock: -qty } });
    if (!r) { for (const l of lines) await Resource.findByIdAndUpdate(l.resource, { $inc: { stock: l.qty } }); throw httpError(400, 'An item is out of stock or missing'); }
    lines.push({ resource: r._id, name: r.name, qty, price: r.price });
  }
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  res.status(201).json(await Order.create({ user: req.user._id, items: lines, total, address }));
}));
router.patch('/:id/status', adminOnly, wrap(async (req, res) => {
  const o = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!o) throw httpError(404, 'Not found'); res.json(o);
}));
module.exports = router;
