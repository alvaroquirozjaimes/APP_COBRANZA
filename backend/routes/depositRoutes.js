// Importa Express para crear un enrutador modular
const express = require('express');

// Importa el controlador encargado de manejar la lógica para registrar depósitos
const { createDeposit } = require('../controllers/depositController');

// Importa el middleware que protege la ruta con autenticación JWT específica para Cobranza
const { protectCobranza } = require('../middleware/authMiddlewareCobranza');

// Crea una instancia del router de Express
const router = express.Router();


// ===============================================
//   RUTA: POST /api/cobranza/deposits
// ===============================================

// Esta ruta permite que el cobrador autenticado registre un nuevo depósito.
// La ruta está protegida con el middleware 'protectCobranza', por lo tanto:
// - El cliente (por ejemplo, una app móvil) debe enviar un token JWT válido en los headers
// - Si el token es válido, se ejecuta la función 'createDeposit' del controlador

// Ejemplo de body que podría enviarse desde el frontend:
// {
//   "amount": 150.00,
//   "date": "2025-07-15",
//   "collector_id": "uuid-del-cobrador",
//   "bank_account": "BCP-12345"
// }

// Ejemplo de solicitud HTTP desde el frontend:
// POST /api/cobranza/deposits
// Headers: Authorization: Bearer <token>
router.post('/deposits', protectCobranza, createDeposit);


// Exporta el router para que pueda ser usado en server.js
// bajo el prefijo: app.use('/api/cobranza', depositRoutes);
module.exports = router;
