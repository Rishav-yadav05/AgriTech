const router = require('express').Router(), Farm = require('../models/Farm'), WeatherData = require('../models/WeatherData'), Post = require('../models/Post');
const { protect } = require('../middleware/auth'), { wrap, httpError } = require('../middleware/error');

function alerts(w) {
  const a = [], d = w.daily, c = w.current || {};
  d.time.forEach((day, i) => {
    const hum = d.relative_humidity_2m_mean?.[i], max = d.temperature_2m_max[i], rain = d.precipitation_sum[i];
    if (hum > 85 && max >= 20 && max <= 32) a.push({ day, level: 'warning', text: 'Warm and humid: high risk of blight, rust and fungal disease. Inspect leaves and plan a preventive spray.' });
    if (rain >= 25) a.push({ day, level: 'danger', text: `Heavy rain (${rain} mm): clear drainage, delay spraying and fertiliser.` });
    if (max >= 40) a.push({ day, level: 'danger', text: `Heat stress (${max}°C): irrigate in the evening and mulch.` });
    if (d.temperature_2m_min[i] <= 4) a.push({ day, level: 'danger', text: 'Frost risk: cover nurseries and irrigate lightly at night.' });
  });
  if (c.wind_speed_10m > 30) a.push({ day: 'now', level: 'info', text: 'Strong wind: avoid pesticide spraying today.' });
  return a;
}

router.get('/:farmId', protect, wrap(async (req, res) => {
  const farm = await Farm.findOne({ _id: req.params.farmId, ...(req.user.role === 'admin' ? {} : { owner: req.user._id }) });
  if (!farm) throw httpError(404, 'Farm not found');
  let cached = await WeatherData.findOne({ farm: farm._id });
  if (!cached || Date.now() - cached.fetchedAt > 30 * 60 * 1000) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${farm.lat}&longitude=${farm.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean&timezone=auto&forecast_days=7`;
    const r = await fetch(url).catch(() => null);
    if (!r || !r.ok) { if (!cached) throw httpError(502, 'Weather service unavailable'); }
    else cached = await WeatherData.findOneAndUpdate({ farm: farm._id }, { data: await r.json(), fetchedAt: new Date() }, { upsert: true, new: true });
  }
  const expertAlerts = await Post.find({ type: 'pestAlert' }).sort('-createdAt').limit(5).select('title body createdAt');
  res.json({ ...cached.data, farmName: farm.name, alerts: alerts(cached.data), expertAlerts });
}));
module.exports = router;
