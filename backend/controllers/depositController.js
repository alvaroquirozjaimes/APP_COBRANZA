// controllers/depositController.js
const db = require('../config/db');

// @desc    Registrar un nuevo depósito
// @route   POST /api/cobranza/deposits
// @access  Private (requiere token de user_cob)
const createDeposit = async (req, res) => {
    // Los nombres de los campos en req.body deben reflejar el nuevo esquema.
    // 'partnerId' ahora es 'user_cli_id'. Asegúrate de que el frontend lo envíe así.
    const { userCliId, accountId, amount, transactionType, currency } = req.body; // Añadimos 'currency'
    const userCobId = req.user.id; // ID del cobrador autenticado (user_cob.id)
    const transactionDate = new Date(); // Fecha actual del depósito

    // Validar campos obligatorios, incluyendo el nuevo 'currency'
    if (!userCliId || !accountId || !amount || !transactionType || !currency) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para el depósito (ID de cliente, ID de cuenta, monto, tipo de transacción, moneda).' });
    }

    // Iniciar una transacción para asegurar la atomicidad de la operación
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // 1. Insertar el movimiento en la tabla 'movements'
        // NOMBRES DE COLUMNAS ACTUALIZADOS: user_cli_id, user_cob_id, transaction_type, transaction_date
        const insertMovementQuery = `
            INSERT INTO movements (user_cli_id, user_cob_id, account_id, amount, currency, transaction_type, transaction_date, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;
        // Asumiendo una descripción genérica para depósitos o puedes pasarla desde el body
        const description = `Depósito de ${currency} ${amount} - ${transactionType}`; 

        const movementResult = await client.query(
            insertMovementQuery,
            [userCliId, userCobId, accountId, amount, currency, transactionType, transactionDate, description]
        );

        // 2. Actualizar el balance en la tabla 'accounts'
        // Esta parte no cambia porque las tablas y columnas 'accounts' y 'balance' se mantienen igual
        const updateAccountQuery = `
            UPDATE accounts
            SET balance = balance + $1
            WHERE id = $2 RETURNING *;
        `;
        const accountUpdateResult = await client.query(updateAccountQuery, [amount, accountId]);

        // Verificar si la cuenta fue realmente actualizada (id existe)
        if (accountUpdateResult.rows.length === 0) {
            throw new Error('Cuenta no encontrada o no actualizada.');
        }

        await client.query('COMMIT'); // Confirmar la transacción
        res.status(201).json({
            message: 'Depósito registrado y cuenta actualizada exitosamente.',
            movement: movementResult.rows[0],
            account: accountUpdateResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Revertir la transacción en caso de error
        console.error('Error al crear depósito:', error.message);
        res.status(500).json({ message: 'Error del servidor al registrar depósito: ' + error.message });
    } finally {
        client.release(); // Liberar el cliente de la pool de conexiones
    }
};

module.exports = { createDeposit };