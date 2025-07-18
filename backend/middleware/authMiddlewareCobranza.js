// ===============================================
// MIDDLEWARE DE AUTENTICACIÓN PARA COBRANZA
// ===============================================

// Importa la librería jsonwebtoken para verificar tokens JWT
const jwt = require('jsonwebtoken');

// Middleware para proteger rutas que requieren un token de usuario de cobranza
const protectCobranza = (req, res, next) => {
    let token; // Variable para almacenar el token extraído del header

    // Verifica si el header Authorization está presente y comienza con 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrae el token eliminando la palabra 'Bearer'
            token = req.headers.authorization.split(' ')[1];

            // Verifica y decodifica el token usando la clave secreta
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verifica que el token corresponda a un usuario del tipo 'cobranza'
            if (decoded.type !== 'cobranza') {
                return res.status(403).json({ message: 'Acceso denegado: Este token no es para el personal de cobranza.' });
            }

            // Adjunta los datos del usuario autenticado al objeto `req`
            req.user = {
                id: decoded.id,             // ID del usuario
                username: decoded.username, // Nombre de usuario
                role: decoded.role,         // Rol del usuario (ej. cobrador, admin)
                type: 'cobranza'            // Tipo de token, para diferenciación
            };

            // Pasa al siguiente middleware o controlador
            next();

        } catch (error) {
            console.error('Error en la verificación del token de Cobranza:', error);

            // Maneja diferentes tipos de errores posibles del token
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'No autorizado para Cobranza, token expirado' });
            } else if (error.name === 'JsonWebTokenError') {
                res.status(401).json({ message: 'No autorizado para Cobranza, token inválido' });
            } else {
                res.status(401).json({ message: 'No autorizado para Cobranza, token fallido' });
            }
        }

    } else {
        // Si no hay token en el header, devuelve error 401 (no autorizado)
        res.status(401).json({ message: 'No autorizado para Cobranza, no hay token' });
    }
};

// Exporta el middleware para que pueda usarse en las rutas protegidas
module.exports = { protectCobranza };
