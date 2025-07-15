// controllers/movementController.js
const db = require('../config/db');

// @desc    Obtener movimientos realizados por un cobrador en un día específico
// @route   GET /api/cobranza/movements?date=<YYYY-MM-DD>
// @access  Private (requiere token de user_cob)
const getMovements = async (req, res) => {
    const { date } = req.query; // Fecha en formato YYYY-MM-DD
    const userCobId = req.user.id; // ID del cobrador autenticado (user_cob.id)

    console.log('Backend: Solicitud GET /api/cobranza/movements recibida.');
    console.log('Backend: Fecha solicitada:', date);
    console.log('Backend: ID del cobrador (req.user.id):', userCobId);

    if (!date) {
        return res.status(400).json({ message: 'Se requiere una fecha para obtener los movimientos.' });
    }

    try {
        // Consulta para obtener movimientos. JOINs actualizados y columnas renombradas.
        const query = `
            SELECT
                m.id,
                m.amount,
                m.currency,       -- Nueva columna de moneda
                uc.name AS client_name, -- Renombrado de 'p' a 'uc' y 'p.name' a 'uc.name'
                a.account_number,
                m.transaction_type, -- Renombrado de 'm.type' a 'm.transaction_type'
                m.transaction_date, -- Renombrado de 'm.date' a 'm.transaction_date'
                m.description
            FROM movements m
            JOIN user_cli uc ON m.user_cli_id = uc.id -- Cambio de 'partners p' a 'user_cli uc' y 'm.partner_id' a 'm.user_cli_id'
            JOIN accounts a ON m.account_id = a.id
            WHERE m.user_cob_id = $1 AND DATE(m.transaction_date) = $2 -- Cambio de 'm.collector_id' a 'm.user_cob_id' y 'm.date' a 'm.transaction_date'
            ORDER BY m.transaction_date DESC;
        `;
        console.log('Backend: Consulta SQL a ejecutar:', query);
        console.log('Backend: Parámetros de la consulta:', [userCobId, date]);

        const result = await db.query(query, [userCobId, date]);
        console.log('Backend: Resultado de la consulta (número de filas):', result.rows.length);
        console.log('Backend: Primeras 5 filas del resultado:', result.rows.slice(0, 5));

        // Calcular el total recaudado por moneda
        let totalRecaudadoSoles = 0.00;
        let totalRecaudadoUSD = 0.00;

        result.rows.forEach(move => {
            if (move.currency === 'PEN') {
                totalRecaudadoSoles += parseFloat(move.amount);
            } else if (move.currency === 'USD') {
                totalRecaudadoUSD += parseFloat(move.amount);
            }
            // Puedes añadir más monedas si es necesario
        });

        res.json({
            movements: result.rows,
            totalRecaudadoSoles: totalRecaudadoSoles.toFixed(2),
            totalRecaudadoUSD: totalRecaudadoUSD.toFixed(2)
        });

    } catch (error) {
        console.error('Backend: Error al obtener movimientos:', error.message);
        res.status(500).json({ message: 'Error del servidor al obtener movimientos' });
    }
};

module.exports = { getMovements };