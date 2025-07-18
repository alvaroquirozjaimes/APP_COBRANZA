// Importación de módulos necesarios
const express = require('express');          // Framework web para Node.js
const dotenv = require('dotenv');            // Carga variables de entorno desde un archivo .env
const cors = require('cors');                // Middleware para permitir solicitudes desde otros orígenes (CORS)

// Cargar variables de entorno desde el archivo .env (como el puerto, claves secretas, etc.)
dotenv.config();

// Crear una instancia de la aplicación Express
const app = express();

// ==========================
//        MIDDLEWARES
// ==========================

// Habilita CORS para permitir solicitudes desde el frontend (por ejemplo, desde React u otra app)
app.use(cors());

// Permite que Express entienda y procese cuerpos JSON en las solicitudes HTTP (POST, PUT, etc.)
app.use(express.json());


// ==========================
//   IMPORTAR RUTAS DE API
// ==========================

// Rutas relacionadas con la autenticación (login) para la app de Cobranza
const authRoutesCobranza = require('./routes/authRoutesCobranza');

// Rutas específicas para funcionalidades del sistema de Cobranza
const collectionRoutes = require('./routes/collectionRoutes');     // Resumen de cobranzas
const depositRoutes = require('./routes/depositRoutes');           // Registro y visualización de depósitos
const movementRoutes = require('./routes/movementRoutes');         // Movimientos de cuentas o dinero
const partnerRoutes = require('./routes/partnerRoutes');           // Gestión de socios y sus cuentas


// ==========================
//     MONTAR LAS RUTAS
// ==========================

// Rutas de autenticación (login, logout, verificación de tokens, etc.)
app.use('/api/cobranza/auth', authRoutesCobranza);  // Ejemplo: POST /api/cobranza/auth/login

// Rutas principales del sistema Cobranza, todas bajo el prefijo /api/cobranza
app.use('/api/cobranza', collectionRoutes);         // Ej: GET /api/cobranza/summary
app.use('/api/cobranza', depositRoutes);            // Ej: POST /api/cobranza/deposits
app.use('/api/cobranza', movementRoutes);           // Ej: GET /api/cobranza/movements
app.use('/api/cobranza', partnerRoutes);            // Ej: GET /api/cobranza/partners


// ==========================
//     RUTA DE PRUEBA
// ==========================

// Ruta raíz simple para verificar que el servidor esté funcionando correctamente
app.get('/', (req, res) => {
    res.send('API de Cobranza Móvil está funcionando!');
});


// ==========================
//  MANEJO CENTRALIZADO DE ERRORES
// ==========================

// Este middleware captura errores que ocurran en cualquier parte del backend
app.use((err, req, res, next) => {
    console.error(err.stack);                            // Imprime el error en la consola
    res.status(500).send('Algo salió mal en el servidor!'); // Respuesta genérica al cliente
});


// ==========================
//      INICIAR SERVIDOR
// ==========================

// El servidor escucha en el puerto especificado en el .env o el 5000 por defecto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor backend de Cobranza corriendo en el puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT}`);
});