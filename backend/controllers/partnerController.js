// controllers/partnerController.js
const db = require('../config/db');

// @desc    Obtener lista de socios asignados a un cobrador
// @route   GET /api/cobranza/partners?search=<query>
// @access  Private (requiere token de user_cob)
const getPartners = async (req, res) => {
    const { search } = req.query; // No necesitamos collectorId en query, lo obtenemos del token
    const userCobId = req.user.id; // ID del usuario de cobranza autenticado (user_cob.id)

    // La asignación de socios a cobradores se maneja con la columna 'collector_id' en user_cli
    let query = 'SELECT id, name, document_number, email, phone_number FROM user_cli WHERE collector_id = $1';
    let params = [userCobId]; // El collectorId es el ID del cobrador logueado

    if (search) {
        // Añadimos una condición OR para buscar tanto por nombre como por número de documento
        query += ' AND (name ILIKE $2 OR document_number ILIKE $2)'; // ILIKE para búsqueda insensible a mayúsculas/minúsculas
        params.push(`%${search}%`);
    }

    try {
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener socios:', error.message);
        res.status(500).json({ message: 'Error del servidor al obtener socios' });
    }
};

// @desc    Obtener cuentas de un socio
// @route   GET /api/cobranza/partners/:id/accounts
// @access  Private (requiere token de user_cob)
const getPartnerAccounts = async (req, res) => {
    const { id } = req.params; // ID del socio (user_cli.id)
    const userCobId = req.user.id; // ID del cobrador autenticado

    try {
        // ¡IMPORTANTE! Verificar que el socio (user_cli) pertenece al cobrador autenticado
        // o al menos que el cobrador tenga permiso para ver las cuentas de este socio.
        // Aquí se añade una verificación simple si el socio está asignado a este cobrador.
        const verifyPartnerQuery = `
            SELECT id FROM user_cli
            WHERE id = $1 AND collector_id = $2;
        `;
        const verifyResult = await db.query(verifyPartnerQuery, [id, userCobId]);

        if (verifyResult.rows.length === 0) {
            return res.status(403).json({ message: 'Acceso denegado: El socio no está asignado a este cobrador o no existe.' });
        }

        // Consulta para obtener cuentas. partner_id se cambia a user_cli_id.
        const result = await db.query(
            'SELECT id, account_number, account_type, currency, balance FROM accounts WHERE user_cli_id = $1', // Cambio de 'partner_id' a 'user_cli_id'
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener cuentas del socio:', error.message);
        res.status(500).json({ message: 'Error del servidor al obtener cuentas del socio' });
    }
};

module.exports = { getPartners, getPartnerAccounts };