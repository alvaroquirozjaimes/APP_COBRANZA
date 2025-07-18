// Importa Express para crear un enrutador modular (agrupado por funcionalidad)
const express = require('express');

// Importa el controlador encargado de obtener los movimientos del sistema
const { getMovements } = require('../controllers/movementController');

// Importa el middleware de autenticación JWT específico para la app de Cobranza
const { protectCobranza } = require('../middleware/authMiddlewareCobranza');

// Crea una instancia del router de Express
const router = express.Router();


// ===============================================
//   RUTA: GET /api/cobranza/movements
// ===============================================

// Esta ruta permite obtener los movimientos (por ejemplo: pagos, transferencias, ingresos) 
// registrados por el cobrador autenticado, posiblemente filtrados por fecha.
// La ruta está protegida por el middleware 'protectCobranza', por lo que:
// - El cliente debe enviar un token JWT válido en el header de autorización
// - El middleware valida el token y extrae el ID del cobrador (req.user.id)

// Ejemplo de cómo se puede consumir esta ruta:
// GET /api/cobranza/movements?startDate=2025-07-01&endDate=2025-07-15
// Headers: Authorization: Bearer <token JWT>
router.get('/movements', protectCobranza, getMovements);


// Exporta el router para que pueda integrarse en server.js
// con app.use('/api/cobranza', movementRoutes);
module.exports = router;
