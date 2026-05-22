const bcrypt = require('bcryptjs');
const db = require('../config/db');
const env = require('../config/env');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../middleware/asyncHandler');
const { normalizeText } = require('../validators/commonValidators');

const buildUserResponse = (user) => ({
  id: user.id,
  username: user.username,
  role: user.role,
  type: 'cobranza',
});

const loginUserCob = asyncHandler(async (req, res) => {
  const username = normalizeText(req.body?.username, 80);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    return res.status(400).json({ message: 'Ingrese usuario y contraseña.' });
  }

  const { rows } = await db.query(
    'SELECT id, username, password_hash, role FROM user_cob WHERE username = $1 LIMIT 1',
    [username]
  );

  const user = rows[0];

  if (!user) {
    return res.status(400).json({ message: 'Credenciales inválidas para personal de cobranza.' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return res.status(400).json({ message: 'Credenciales inválidas para personal de cobranza.' });
  }

  const token = generateToken(user);

  return res.status(200).json({
    message: 'Inicio de sesión de personal de cobranza exitoso',
    token,
    user: buildUserResponse(user),
  });
});

const registerUserCob = asyncHandler(async (req, res) => {
  if (!env.allowPublicRegister) {
    return res.status(403).json({ message: 'El registro público está deshabilitado.' });
  }

  const username = normalizeText(req.body?.username, 80);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const phoneNumber = normalizeText(req.body?.phone_number, 20);
  const defaultRole = 'cobrador';

  if (!username || !password) {
    return res.status(400).json({ message: 'Por favor, ingrese nombre de usuario y contraseña.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  if (phoneNumber && !/^\d{9}$/.test(phoneNumber)) {
    return res.status(400).json({ message: 'Ingrese un número de celular válido (9 dígitos) o déjelo vacío.' });
  }

  const existingUser = await db.query(
    'SELECT id FROM user_cob WHERE username = $1 LIMIT 1',
    [username]
  );

  if (existingUser.rows.length > 0) {
    return res.status(400).json({ message: 'El nombre de usuario ya está registrado.' });
  }

  const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
  const passwordHash = await bcrypt.hash(password, salt);

  const { rows } = await db.query(
    `
      INSERT INTO user_cob (username, password_hash, phone_number, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, role;
    `,
    [username, passwordHash, phoneNumber || null, defaultRole]
  );

  const newUser = rows[0];
  const token = generateToken(newUser);

  return res.status(201).json({
    message: 'Usuario de cobranza registrado exitosamente',
    token,
    user: buildUserResponse(newUser),
  });
});

module.exports = {
  loginUserCob,
  registerUserCob,
};
