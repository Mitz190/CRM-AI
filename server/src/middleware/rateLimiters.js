const rateLimit = require('express-rate-limit');

// Stricter limit for credential endpoints (on top of the global /api limit).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
});

module.exports = { authLimiter };