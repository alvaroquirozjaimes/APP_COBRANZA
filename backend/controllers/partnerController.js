// ===============================================
// CONTROLADOR DE SOCIOS (user_cli) - COBRANZA
// ===============================================

const db = require('../config/db'); // Importa conexión a PostgreSQL

// ===============================================
// FUNCIÓN: Obtener socios asignados al cobrador logueado
// ===============================================

// @desc    Obtener lista de socios asignados a un cobrador
// @route   GET /api/cobranza/partners?search=<query>
// @access  Private (requiere token de user_cob)
const getPartners = async (req, res) => {
    const { search } = req.query; // Extrae parámetro de búsqueda opcional desde el frontend
    const userCobId = req.user.id; // Obtiene el ID del cobrador desde el token JWT

    // Base de la consulta: socios cuyo collector_id coincide con el usuario autenticado
    let query = `
        SELECT id, name, document_number, email, phone_number
        FROM user_cli
        WHERE collector_id = $1
    `;
    const params = [userCobId]; // Parámetro para el WHERE

    // Si se envió texto de búsqueda (nombre o documento), agrega un filtro adicional
    if (search) {
        query += ' AND (name ILIKE $2 OR document_number ILIKE $2)';
        params.push(`%${search}%`); // Busca parcialmente (LIKE '%texto%')
    }

    try {
        // Ejecuta la consulta con los parámetros correspondientes
        const result = await db.query(query, params);
        res.json(result.rows); // Devuelve el listado de socios al frontend
    } catch (error) {
        console.error('Error al obtener socios:', error.message);
        res.status(500).json({ message: 'Error del servidor al obtener socios' });
    }
};

// ===============================================
// FUNCIÓN: Obtener cuentas de un socio validando que sea del cobrador
// ===============================================

// @desc    Obtener cuentas de un socio
// @route   GET /api/cobranza/partners/:id/accounts
// @access  Private (requiere token de user_cob)
const getPartnerAccounts = async (req, res) => {
    const { id } = req.params;    // ID del socio (user_cli.id) recibido por la URL
    const userCobId = req.user.id; // ID del cobrador autenticado extraído del JWT

    try {
        // Verifica si el socio pertenece al cobrador logueado
        const verifyPartnerQuery = `
            SELECT id FROM user_cli
            WHERE id = $1 AND collector_id = $2;
        `;
        const verifyResult = await db.query(verifyPartnerQuery, [id, userCobId]);

        // Si no pertenece o no existe, rechaza la petición
        if (verifyResult.rows.length === 0) {
            return res.status(403).json({
                message: 'Acceso denegado: El socio no está asignado a este cobrador o no existe.'
            });
        }

        // Si pasa la validación, consulta las cuentas del socio
        const result = await db.query(
            `
            SELECT id, account_number, account_type, currency, balance
            FROM accounts
            WHERE user_cli_id = $1
            `,
            [id]
        );

        // Devuelve las cuentas asociadas al socio
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener cuentas del socio:', error.message);
        res.status(500).json({ message: 'Error del servidor al obtener cuentas del socio' });
    }
};

// ===============================================
// Exportación de controladores para usar en rutas
// ===============================================
module.exports = {
    getPartners,
    getPartnerAccounts
};
