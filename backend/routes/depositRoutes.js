// routes/depositRoutes.js
const express = require('express');
const { createDeposit } = require('../controllers/depositController');
// Importa el middleware de protección específico para Cobranza
const { protectCobranza } = require('../middleware/authMiddlewareCobranza');

const router = express.Router();

// Ruta para registrar un nuevo depósito
// Se recomienda una ruta más explícita, como '/deposits' si la base es /api/cobranza
router.post('/deposits', protectCobranza, createDeposit);

module.exports = router;