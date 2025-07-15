// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();

// Middleware:
// Habilita CORS para permitir solicitudes desde tu frontend de Cobranza
// En producción, deberías restringir esto a dominios específicos.
app.use(cors());
// Habilita el parseo de cuerpos de solicitud JSON
app.use(express.json());

// --- Importar las rutas específicas de la Aplicación de Cobranza ---

// Ruta de Autenticación para Cobranza
const authRoutesCobranza = require('./routes/authRoutesCobranza');

// Rutas de las funcionalidades de Cobranza (ya adaptadas en sus archivos)
const collectionRoutes = require('./routes/collectionRoutes'); // Contiene /summary
const depositRoutes = require('./routes/depositRoutes');    // Contiene /deposits
const movementRoutes = require('./routes/movementRoutes');   // Contiene /movements
const partnerRoutes = require('./routes/partnerRoutes');     // Contiene /partners y /partners/:id/accounts


// --- Montar las rutas de la API con prefijos claros para Cobranza ---

// Rutas de Autenticación para la aplicación de Cobranza
app.use('/api/cobranza/auth', authRoutesCobranza); // Ej: POST /api/cobranza/auth/login

// Rutas de funcionalidades específicas de la Aplicación de Cobranza
app.use('/api/cobranza', collectionRoutes); // Ej: GET /api/cobranza/summary
app.use('/api/cobranza', depositRoutes);    // Ej: POST /api/cobranza/deposits
app.use('/api/cobranza', movementRoutes);   // Ej: GET /api/cobranza/movements
app.use('/api/cobranza', partnerRoutes);    // Ej: GET /api/cobranza/partners, GET /api/cobranza/partners/:id/accounts


// Ruta de prueba para verificar que el servidor de Cobranza está funcionando
app.get('/', (req, res) => {
    res.send('API de Cobranza Móvil está funcionando!');
});

// Middleware de manejo de errores centralizado (opcional pero recomendado)
app.use((err, req, res, next) => {
    console.error(err.stack); // Loguea el stack de errores en la consola del servidor
    res.status(500).send('Algo salió mal en el servidor!'); // Envía una respuesta de error genérica al cliente
});

// Definir el puerto en el que escuchará el servidor
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor backend de Cobranza corriendo en el puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT}`);
});