const jwt = require('jsonwebtoken');
const env = require('../config/env');

const protectCobranza = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado para Cobranza, no hay token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (decoded.type !== 'cobranza') {
      return res.status(403).json({ message: 'Acceso denegado: Este token no es para el personal de cobranza.' });
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      type: 'cobranza',
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'No autorizado para Cobranza, token expirado' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'No autorizado para Cobranza, token inválido' });
    }

    return res.status(401).json({ message: 'No autorizado para Cobranza, token fallido' });
  }
};

module.exports = { protectCobranza };
