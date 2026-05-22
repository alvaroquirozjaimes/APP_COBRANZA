const rateLimit = require('express-rate-limit');

const buildMessage = (message) => ({
  ok: false,
  message,
});

const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: buildMessage('Demasiadas solicitudes. Intenta nuevamente más tarde.'),
});

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: buildMessage('Demasiados intentos. Intenta nuevamente más tarde.'),
});

const writeLimiter = rateLimit({
  windowMs: Number(process.env.WRITE_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.WRITE_RATE_LIMIT_MAX || 80),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: buildMessage('Demasiadas operaciones. Intenta nuevamente más tarde.'),
});

module.exports = {
  generalLimiter,
  authLimiter,
  writeLimiter,
};
