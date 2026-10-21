const router = require('express').Router(), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const User = require('../models/User'), { protect } = require('../middleware/auth'), { wrap, httpError } = require('../middleware/error');
const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const out = u => ({ _id: u._id, name: u.name, email: u.email, role: u.role, language: u.language });
const emailOk = e => /^\S+@\S+\.\S+$/.test(e || '');

router.post('/register', wrap(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name?.trim()) throw httpError(400, 'Name is required');
  if (!emailOk(email)) throw httpError(400, 'Enter a valid email');
  if (!password || password.length < 8) throw httpError(400, 'Password must be at least 8 characters');
  const u = await User.create({ name, email, phone, password: await bcrypt.hash(password, 10) }); // role is always farmer
  res.status(201).json({ token: sign(u), user: out(u) });
}));
router.post('/login', wrap(async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) throw httpError(401, 'Wrong email or password');
  res.json({ token: sign(u), user: out(u) });
}));
router.get('/me', protect, (req, res) => res.json(out(req.user)));
router.patch('/me', protect, wrap(async (req, res) => {
  if (req.body.language) req.user.language = req.body.language;
  await req.user.save(); res.json(out(req.user));
}));
module.exports = router;
