// routes/movementRoutes.js
const express = require('express');
const { getMovements } = require('../controllers/movementController');
// Importa el middleware de protección específico para Cobranza
const { protectCobranza } = require('../middleware/authMiddlewareCobranza');

const router = express.Router();

// Ruta para obtener movimientos por fecha para el cobrador autenticado
// Se recomienda una ruta más explícita, como '/movements' si la base es /api/cobranza
router.get('/movements', protectCobranza, getMovements);

module.exports = router;