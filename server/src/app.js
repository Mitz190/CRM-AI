const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const { isProd, clientUrl } = require('./config/env');
const healthRoutes = require('./routes/healthRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1); // Render sits behind a proxy; needed for correct rate-limit IPs.

// --- Security & parsing ---
app.use(helmet());
app.use(cors({ origin: isProd ? false : clientUrl, credentials: true })); // same-origin in prod
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // blocks NoSQL operator injection ($, .)
app.use(compression());
if (!isProd) app.use(morgan('dev'));

// --- API ---
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/api/health', healthRoutes);
// Future modules mount here, e.g. app.use('/api/auth', authRoutes);
app.use('/api', notFound); // unknown /api routes return JSON 404

// --- React production build + client-side routing fallback ---
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (!isProd) return next(); // in dev, Vite serves the UI
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use(errorHandler);

module.exports = app;