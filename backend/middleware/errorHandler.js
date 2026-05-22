const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  if (env.nodeEnv === 'development') {
    console.error(err);
  } else {
    console.error(err.message);
  }

  res.status(statusCode).json({
    ok: false,
    message: statusCode === 500 ? 'Algo salió mal en el servidor.' : err.message,
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
