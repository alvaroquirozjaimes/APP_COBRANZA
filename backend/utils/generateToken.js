const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (user) => jwt.sign(
  {
    id: user.id,
    username: user.username,
    role: user.role,
    type: 'cobranza',
  },
  env.jwtSecret,
  { expiresIn: env.jwtExpiresIn }
);

module.exports = generateToken;
