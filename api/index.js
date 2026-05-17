require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });

const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const consultationsRouter  = require('../backend/routes/consultations');
const ordersRouter         = require('../backend/routes/orders');
const adminRouter          = require('../backend/routes/admin');
const analyticsRouter      = require('../backend/routes/analytics');
const appointmentsRouter   = require('../backend/routes/appointments');

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-admin-key'],
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  skip: (req) => req.method === 'GET',
  message: { error: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/consultations', formLimiter);
app.use('/api/orders', formLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/consultations',  consultationsRouter);
app.use('/api/orders',         ordersRouter);
app.use('/api/admin',          adminRouter);
app.use('/api/analytics',      analyticsRouter);
app.use('/api/appointments',   appointmentsRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
