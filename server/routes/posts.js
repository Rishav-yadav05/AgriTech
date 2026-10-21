const router = require('express').Router(), Post = require('../models/Post');
const { protect } = require('../middleware/auth'), { wrap, httpError } = require('../middleware/error');
router.use(protect);
const pop = [{ path: 'author', select: 'name role' }, { path: 'replies.author', select: 'name role' }];
router.get('/', wrap(async (req, res) => {
  const q = req.query.type ? { type: req.query.type } : {};
  // Consultations are private: farmers see only their own questions; admins (experts) see all
  if (req.query.type === 'consult' && req.user.role !== 'admin') q.author = req.user._id;
  res.json(await Post.find(q).populate(pop).sort('-createdAt').limit(100));
}));
router.post('/', wrap(async (req, res) => {
  const { type = 'forum', title, body } = req.body;
  if (type === 'pestAlert' && req.user.role !== 'admin') throw httpError(403, 'Only experts can publish pest alerts');
  res.status(201).json(await Post.create({ author: req.user._id, type, title, body }));
}));
router.post('/:id/replies', wrap(async (req, res) => {
  const p = await Post.findById(req.params.id);
  if (!p) throw httpError(404, 'Not found');
  if (p.type === 'consult' && req.user.role !== 'admin' && !p.author.equals(req.user._id)) throw httpError(403, 'Private consultation');
  if (!req.body.body?.trim()) throw httpError(400, 'Reply is empty');
  p.replies.push({ author: req.user._id, body: req.body.body }); await p.save();
  res.json(p);
}));
router.delete('/:id', wrap(async (req, res) => {
  const p = await Post.findById(req.params.id);
  if (!p) throw httpError(404, 'Not found');
  if (req.user.role !== 'admin' && !p.author.equals(req.user._id)) throw httpError(403, 'Not allowed');
  await p.deleteOne(); res.json({ ok: true });
}));
module.exports = router;
