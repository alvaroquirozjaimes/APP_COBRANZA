// Importa Express para poder crear un router modular
const express = require('express');

// Importa los controladores que manejan la lógica de autenticación y registro
const { loginUserCob, registerUserCob } = require('../controllers/authControllerCobranza');

// Crea una instancia del router de Express para definir rutas de forma modular
const router = express.Router();


// ==============================
//  RUTAS DE AUTENTICACIÓN COBRANZA
// ==============================

// Ruta para iniciar sesión del personal de cobranza
// Espera un POST con las credenciales y devuelve un token JWT si son válidas
// Ejemplo de body: { "email": "user@dominio.com", "password": "123456" }
router.post('/login', loginUserCob);

// Ruta para registrar a un nuevo usuario del sistema de cobranza
// Normalmente, solo un administrador debería poder usar esta ruta
// Recomendación: proteger esta ruta en producción
router.post('/register', registerUserCob);


// Exporta el router para que pueda ser usado en server.js bajo el prefijo /api/cobranza/auth
module.exports = router;