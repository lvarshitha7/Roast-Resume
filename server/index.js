require('dotenv').config();
// Force Google DNS (8.8.8.8) to resolve MongoDB Atlas SRV records
// bypassing routers that block the default DNS SRV lookup
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const resumeRoutes = require('./routes/resumeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  'https://resumeflame.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Stricter limit for AI analysis (expensive endpoint)
const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: 'Analysis limit reached. Please wait before submitting again.' },
});
app.use('/api/resume/analyze', analyzeLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoState] || 'unknown';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongo: mongoStatus,
    mongoRequired: mongoState === 1,
  });
});

// Middleware: returns 503 when MongoDB is not connected (used on DB-dependent routes)
const requireMongo = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database is currently unavailable. Resume analysis still works, but saving/history requires a database connection.',
      hint: 'Contact the admin or try again later.',
    });
  }
  next();
};

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/resume', resumeRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─── MongoDB Connection + Server Boot ─────────────────────────────────────────
let mongoConnected = false;

const connectWithRetry = async (retries = 3, delay = 4000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        family: 4, // force IPv4 to avoid IPv6 resolution issues
      });
      mongoConnected = true;
      console.log('✅  MongoDB connected');
      return;
    } catch (err) {
      console.error(`❌  MongoDB connection attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) await new Promise(r => setTimeout(r, delay));
    }
  }
  console.warn('⚠️   MongoDB unavailable — server will start without DB. Save/history endpoints will return 503.');
};

const startServer = async () => {
  // Start server immediately, connect to MongoDB in parallel
  app.listen(PORT, () => {
    console.log(`🚀  ResumeFlame API running on http://localhost:${PORT}`);
    console.log(`📋  Environment: ${process.env.NODE_ENV}`);
  });
  // Attempt DB connection after server is up
  await connectWithRetry();
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
