require('dotenv').config();
const express = require('express'), mongoose = require('mongoose'), cors = require('cors'), helmet = require('helmet');
const morgan = require('morgan'), path = require('path'), rateLimit = require('express-rate-limit'), bcrypt = require('bcryptjs');
const { notFound, errorHandler } = require('./middleware/error');
const User = require('./models/User'), Resource = require('./models/Resource');

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 600 }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', notFound);

const build = path.join(__dirname, '../client/build');
app.use(express.static(build));
app.get('*', (req, res) => res.sendFile(path.join(build, 'index.html')));
app.use(errorHandler);

async function seed() {
  const email = (process.env.ADMIN_EMAIL || 'admin@agritech.local').toLowerCase();
  if (!(await User.findOne({ email }))) {
    await User.create({ name: 'Admin', email, role: 'admin', password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 10) });
    console.log('Admin user created:', email);
  }
  if (!(await Resource.countDocuments())) {
    await Resource.insertMany([
      { name: 'Certified wheat seed (40 kg)', category: 'seed', price: 1600, stock: 100, description: 'High-yield, disease-tolerant variety.' },
      { name: 'Urea fertiliser (45 kg)', category: 'fertilizer', price: 270, stock: 200, description: 'Nitrogen source for top dressing.' },
      { name: 'Neem-based bio-pesticide (1 L)', category: 'pesticide', price: 420, stock: 80, description: 'Organic control for sucking pests.' },
      { name: 'Drip irrigation kit (1 acre)', category: 'equipment', price: 9500, stock: 15, description: 'Saves up to 50% water.' }
    ]);
  }
}

const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) { console.error('JWT_SECRET is required'); process.exit(1); }
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agritech')
  .then(seed).then(() => app.listen(PORT, () => console.log(`AgriTech running on :${PORT}`)))
  .catch(e => { console.error('Startup failed:', e.message); process.exit(1); });
