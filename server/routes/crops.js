const { Router } = require('express'), crud = require('../utils/crud'), Crop = require('../models/Crop'), Farm = require('../models/Farm');
const analyse = require('../utils/soil'), { protect } = require('../middleware/auth'), { wrap, httpError } = require('../middleware/error');
const router = Router();
router.use(protect);
// A farmer can only attach crops to their own farms
router.use(wrap(async (req, res, next) => {
  if (['POST', 'PUT'].includes(req.method) && req.body.farm && req.user.role !== 'admin' && !(await Farm.exists({ _id: req.body.farm, owner: req.user._id })))
    throw httpError(403, 'Not your farm');
  next();
}));
router.post('/:id/logs', wrap(async (req, res) => {
  const c = await Crop.findOne({ _id: req.params.id, ...(req.user.role === 'admin' ? {} : { owner: req.user._id }) });
  if (!c) throw httpError(404, 'Not found');
  if (!req.body.note?.trim()) throw httpError(400, 'Note is empty');
  c.logs.push({ note: req.body.note }); await c.save(); res.json(c);
}));
router.use(crud(Crop, { populate: 'farm', fields: ['farm', 'name', 'sownOn', 'areaAcres', 'status', 'soil'], transform: d => ({ ...d.toObject(), analysis: analyse(d.soil) }) }));
module.exports = router;
