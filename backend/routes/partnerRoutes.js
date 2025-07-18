// Importa Express para crear un router modular
const express = require('express');

// Importa los controladores que manejan la lógica relacionada con socios y sus cuentas
const { getPartners, getPartnerAccounts } = require('../controllers/partnerController');

// Importa el middleware de autenticación JWT específico para la app de Cobranza
const { protectCobranza } = require('../middleware/authMiddlewareCobranza');

// Crea una instancia del router de Express para agrupar rutas relacionadas con "partners"
const router = express.Router();


// ==========================================================
//   RUTAS: GET /api/cobranza/partners Y /partners/:id/accounts
// ==========================================================

// Ruta para obtener el listado de socios (partners) disponibles para el cobrador autenticado
// Esta información puede ser usada para ver con quiénes está trabajando el cobrador
// Está protegida con JWT mediante 'protectCobranza'
//
// Ejemplo de llamada desde el frontend:
// GET /api/cobranza/partners
// Header: Authorization: Bearer <token JWT>
router.get('/partners', protectCobranza, getPartners);


// Ruta para obtener las cuentas asociadas a un socio específico, usando su ID como parámetro
// Es útil para visualizar las cuentas del socio seleccionado por el cobrador
//
// Ejemplo de llamada desde el frontend:
// GET /api/cobranza/partners/uuid-del-socio/accounts
// Header: Authorization: Bearer <token JWT>
router.get('/partners/:id/accounts', protectCobranza, getPartnerAccounts);


// Exporta el router para que se integre en server.js con:
// app.use('/api/cobranza', partnerRoutes);
module.exports = router;
