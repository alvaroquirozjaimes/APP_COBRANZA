// Importa Express para crear un router modular (independiente para este conjunto de rutas)
const express = require('express');

// Importa el middleware de autenticación para proteger las rutas específicas de Cobranza
// Este middleware verifica que el token JWT enviado en la solicitud sea válido
const { protectCobranza } = require('../middleware/authMiddlewareCobranza');

// Importa el controlador que maneja la lógica del resumen de cobranza
const { getCollectionSummary } = require('../controllers/collectionController');

// Crea una instancia del router para definir rutas específicas de la colección (cobranza)
const router = express.Router();


// ===============================================
//   RUTA: GET /api/cobranza/summary
// ===============================================

// Esta ruta devuelve el resumen de cobranza mensual del cobrador autenticado.
// Está protegida con el middleware 'protectCobranza', lo que significa que
// el usuario debe estar autenticado (enviar un token JWT válido en el header).
//
// El flujo es:
// 1. protectCobranza verifica el token y extrae la info del usuario.
// 2. getCollectionSummary usa esa info para obtener los datos específicos del cobrador.
//
// Ejemplo de uso desde el frontend:
// GET /api/cobranza/summary  (con token en el header Authorization)
router.get('/summary', protectCobranza, getCollectionSummary);


// Exporta el router para que pueda ser usado en server.js
// bajo el prefijo: app.use('/api/cobranza', collectionRoutes);
module.exports = router;
