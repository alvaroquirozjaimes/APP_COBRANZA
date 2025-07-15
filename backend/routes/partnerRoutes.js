// routes/partnerRoutes.js
const express = require('express');
const { getPartners, getPartnerAccounts } = require('../controllers/partnerController');
// Importa el middleware de protección específico para Cobranza
const { protectCobranza } = require('../middleware/authMiddlewareCobranza');

const router = express.Router();

// Rutas para obtener socios y sus cuentas para el cobrador autenticado
// Se recomienda una ruta más explícita para el listado de socios
router.get('/partners', protectCobranza, getPartners);
router.get('/partners/:id/accounts', protectCobranza, getPartnerAccounts);

module.exports = router;