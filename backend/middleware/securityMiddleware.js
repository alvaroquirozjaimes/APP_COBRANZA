const cors = require('cors');
const helmet = require('helmet');
const env = require('../config/env');

const parseAllowedOrigins = () => {
  if (!env.corsOrigin || env.corsOrigin === '*') return '*';
  return env.corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);
};

const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = parseAllowedOrigins();

    if (allowedOrigins === '*') {
      return callback(null, true);
    }

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const configureSecurity = (app) => {
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
};

module.exports = configureSecurity;
