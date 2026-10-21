// Owner-scoped CRUD router factory. Admins can see all records; farmers only their own.
const { Router } = require('express'), { protect } = require('../middleware/auth'), { wrap, httpError } = require('../middleware/error');
module.exports = (Model, { populate = '', fields = [], transform = d => d } = {}) => {
  const r = Router(); r.use(protect);
  const scope = req => req.user.role === 'admin' ? {} : { owner: req.user._id };
  const pick = b => Object.fromEntries(fields.filter(f => b[f] !== undefined).map(f => [f, b[f]]));
  r.get('/', wrap(async (req, res) => res.json((await Model.find(scope(req)).populate(populate).sort('-createdAt')).map(transform))));
  r.post('/', wrap(async (req, res) => res.status(201).json(await Model.create({ ...pick(req.body), owner: req.user._id }))));
  r.put('/:id', wrap(async (req, res) => {
    const d = await Model.findOne({ _id: req.params.id, ...scope(req) });
    if (!d) throw httpError(404, 'Not found');
    d.set(pick(req.body)); await d.save(); res.json(d);
  }));
  r.delete('/:id', wrap(async (req, res) => {
    const d = await Model.findOneAndDelete({ _id: req.params.id, ...scope(req) });
    if (!d) throw httpError(404, 'Not found'); res.json({ ok: true });
  }));
  return r;
};
