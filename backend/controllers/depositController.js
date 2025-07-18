// ===============================================
// CONTROLADOR DE DEPÓSITOS PARA COBRANZA
// ===============================================

const db = require('../config/db'); // Importa el pool de conexión a PostgreSQL


// ===============================================
// FUNCIÓN: Registrar un nuevo depósito
// ===============================================
// @desc    Crea un nuevo depósito y actualiza el balance de la cuenta asociada
// @route   POST /api/cobranza/deposits
// @access  Privado (requiere autenticación con JWT)
const createDeposit = async (req, res) => {
    // Extraer datos del cuerpo de la solicitud
    // ⚠️ El frontend debe enviar estos campos con estos nombres:
    const { userCliId, accountId, amount, transactionType, currency } = req.body;

    // Extraer el ID del cobrador autenticado desde el token JWT (middleware `protectCobranza`)
    const userCobId = req.user.id;

    // Establecer la fecha actual como fecha de la transacción
    const transactionDate = new Date();

    // Validar que todos los campos obligatorios estén presentes
    if (!userCliId || !accountId || !amount || !transactionType || !currency) {
        return res.status(400).json({ 
            message: 'Faltan campos obligatorios para el depósito (ID de cliente, ID de cuenta, monto, tipo de transacción, moneda).' 
        });
    }

    // Obtener un cliente de la pool para iniciar una transacción (con BEGIN/COMMIT/ROLLBACK)
    const client = await db.getClient();

    try {
        // Inicia una transacción SQL
        await client.query('BEGIN');

        // =======================================
        // 1. Insertar nuevo movimiento en `movements`
        // =======================================
        const insertMovementQuery = `
            INSERT INTO movements (
                user_cli_id, user_cob_id, account_id,
                amount, currency, transaction_type, transaction_date, description
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;

        // Puedes personalizar esta descripción o permitir que el frontend la envíe
        const description = `Depósito de ${currency} ${amount} - ${transactionType}`; 

        // Ejecutar la inserción
        const movementResult = await client.query(insertMovementQuery, [
            userCliId,
            userCobId,
            accountId,
            amount,
            currency,
            transactionType,
            transactionDate,
            description
        ]);

        // =======================================
        // 2. Actualizar balance de la cuenta afectada
        // =======================================
        const updateAccountQuery = `
            UPDATE accounts
            SET balance = balance + $1
            WHERE id = $2
            RETURNING *;
        `;

        // Sumar el monto al balance actual
        const accountUpdateResult = await client.query(updateAccountQuery, [
            amount,
            accountId
        ]);

        // Validar que la cuenta existe y fue actualizada
        if (accountUpdateResult.rows.length === 0) {
            throw new Error('Cuenta no encontrada o no actualizada.');
        }

        // Confirmar la transacción si todo salió bien
        await client.query('COMMIT');

        // Enviar respuesta exitosa al cliente
        res.status(201).json({
            message: 'Depósito registrado y cuenta actualizada exitosamente.',
            movement: movementResult.rows[0],
            account: accountUpdateResult.rows[0]
        });

    } catch (error) {
        // Si algo falla, se revierte todo lo que se hizo dentro de la transacción
        await client.query('ROLLBACK');
        console.error('Error al crear depósito:', error.message);

        res.status(500).json({
            message: 'Error del servidor al registrar depósito: ' + error.message
        });
    } finally {
        // Liberar el cliente de la pool (siempre, pase lo que pase)
        client.release();
    }
};

// Exportar función para que pueda ser usada en las rutas
module.exports = { createDeposit };
