// routes/collectionRoutes.js
const express = require('express');
// Importa el middleware de protección específico para Cobranza
const { protectCobranza } = require('../middleware/authMiddlewareCobranza');
const { getCollectionSummary } = require('../controllers/collectionController');

const router = express.Router();

// Ruta para obtener el resumen de cobranza por mes para el cobrador autenticado
// Se recomienda una ruta más explícita, como '/summary' si la base es /api/cobranza
router.get('/summary', protectCobranza, getCollectionSummary); 

module.exports = router;