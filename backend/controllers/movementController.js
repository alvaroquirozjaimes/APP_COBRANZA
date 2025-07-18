// ===============================================
// CONTROLADOR DE MOVIMIENTOS - COBRANZA
// ===============================================

// Importa la configuración de la base de datos (pool de PostgreSQL)
const db = require('../config/db');

// ===============================================
// FUNCIÓN: Obtener movimientos por fecha
// ===============================================

// @desc    Obtener movimientos realizados por un cobrador en un día específico
// @route   GET /api/cobranza/movements?date=<YYYY-MM-DD>
// @access  Private (requiere token de user_cob autenticado)
const getMovements = async (req, res) => {
    // Extrae la fecha desde los parámetros de consulta (query string)
    const { date } = req.query;

    // Extrae el ID del cobrador desde el token JWT decodificado (middleware)
    const userCobId = req.user.id;

    // Logs para depuración
    console.log('Backend: Solicitud GET /api/cobranza/movements recibida.');
    console.log('Backend: Fecha solicitada:', date);
    console.log('Backend: ID del cobrador (req.user.id):', userCobId);

    // Validación: Si no se envía fecha, responde con error
    if (!date) {
        return res.status(400).json({ message: 'Se requiere una fecha para obtener los movimientos.' });
    }

    try {
        // Consulta SQL para obtener los movimientos de un cobrador en una fecha específica
        const query = `
            SELECT
                m.id,
                m.amount,
                m.currency,                  -- Moneda del movimiento (PEN o USD)
                uc.name AS client_name,      -- Nombre del socio (user_cli)
                a.account_number,            -- Número de cuenta
                m.transaction_type,          -- Tipo de movimiento (ej: loan_payment, savings_deposit, etc.)
                m.transaction_date,          -- Fecha del movimiento
                m.description                -- Descripción del movimiento
            FROM movements m
            JOIN user_cli uc ON m.user_cli_id = uc.id -- Relación con tabla de clientes
            JOIN accounts a ON m.account_id = a.id     -- Relación con cuentas
            WHERE m.user_cob_id = $1                   -- ID del cobrador autenticado
              AND DATE(m.transaction_date) = $2        -- Filtra solo los movimientos de la fecha dada
            ORDER BY m.transaction_date DESC;          -- Ordena de más reciente a más antiguo
        `;

        // Logs de depuración
        console.log('Backend: Consulta SQL a ejecutar:', query);
        console.log('Backend: Parámetros de la consulta:', [userCobId, date]);

        // Ejecuta la consulta con los parámetros
        const result = await db.query(query, [userCobId, date]);

        // Logs para verificar resultados
        console.log('Backend: Resultado de la consulta (número de filas):', result.rows.length);
        console.log('Backend: Primeras 5 filas del resultado:', result.rows.slice(0, 5));

        // Inicializa totales por moneda
        let totalRecaudadoSoles = 0.00;
        let totalRecaudadoUSD = 0.00;

        // Recorre todos los movimientos y acumula montos según moneda
        result.rows.forEach(move => {
            if (move.currency === 'PEN') {
                totalRecaudadoSoles += parseFloat(move.amount);
            } else if (move.currency === 'USD') {
                totalRecaudadoUSD += parseFloat(move.amount);
            }
            // Se podrían añadir más monedas si se usan
        });

        // Devuelve la lista de movimientos + totales por moneda
        res.json({
            movements: result.rows,
            totalRecaudadoSoles: totalRecaudadoSoles.toFixed(2),
            totalRecaudadoUSD: totalRecaudadoUSD.toFixed(2)
        });

    } catch (error) {
        // Captura errores de base de datos o lógica
        console.error('Backend: Error al obtener movimientos:', error.message);
        res.status(500).json({ message: 'Error del servidor al obtener movimientos' });
    }
};

// Exporta el controlador para usarlo en las rutas
module.exports = { getMovements };
