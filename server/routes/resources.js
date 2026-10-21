const router = require('express').Router(), Resource = require('../models/Resource');
const { protect, adminOnly } = require('../middleware/auth'), { wrap, httpError } = require('../middleware/error');
const F = ['name', 'description', 'category', 'price', 'stock'];
const pick = b => Object.fromEntries(F.filter(f => b[f] !== undefined).map(f => [f, b[f]]));
router.use(protect);
router.get('/', wrap(async (req, res) => res.json(await Resource.find().sort('category name'))));
router.post('/', adminOnly, wrap(async (req, res) => res.status(201).json(await Resource.create(pick(req.body)))));
router.put('/:id', adminOnly, wrap(async (req, res) => {
  const r = await Resource.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!r) throw httpError(404, 'Not found'); res.json(r);
}));
router.delete('/:id', adminOnly, wrap(async (req, res) => { await Resource.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));
module.exports = router;
