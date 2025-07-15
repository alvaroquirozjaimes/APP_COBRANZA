// routes/authRoutesCobranza.js
const express = require('express');
const { loginUserCob, registerUserCob } = require('../controllers/authControllerCobranza');

const router = express.Router();

// Rutas para autenticación y registro de personal de Cobranza
router.post('/login', loginUserCob);
router.post('/register', registerUserCob); // Considera proteger esta ruta en producción (solo accesible para admins)

module.exports = router;