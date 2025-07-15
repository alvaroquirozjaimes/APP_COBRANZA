// middleware/authMiddlewareCobranza.js
const jwt = require('jsonwebtoken');

const protectCobranza = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verificar que el token es de un usuario de cobranza
            if (decoded.type !== 'cobranza') {
                return res.status(403).json({ message: 'Acceso denegado: Este token no es para el personal de cobranza.' });
            }

            // Adjuntar la información del usuario de cobranza a req.user
            req.user = {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role,
                type: 'cobranza'
            };
            next();
        } catch (error) {
            console.error('Error en la verificación del token de Cobranza:', error);
            if (error.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'No autorizado para Cobranza, token expirado' });
            } else if (error.name === 'JsonWebTokenError') {
                res.status(401).json({ message: 'No autorizado para Cobranza, token inválido' });
            } else {
                res.status(401).json({ message: 'No autorizado para Cobranza, token fallido' });
            }
        }
    } else {
        res.status(401).json({ message: 'No autorizado para Cobranza, no hay token' });
    }
};

module.exports = { protectCobranza };