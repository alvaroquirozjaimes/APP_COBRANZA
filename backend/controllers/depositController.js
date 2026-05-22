const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { isUuid, normalizeAmount, normalizeText } = require('../validators/commonValidators');

const ALLOWED_CURRENCIES = new Set(['PEN', 'USD']);
const ALLOWED_TRANSACTION_TYPES = new Set([
  'daily_collection_lt_30',
  'daily_collection_gt_30',
  'contribution',
  'loan_payment',
  'savings_deposit',
  'deposit',
]);

const createDeposit = asyncHandler(async (req, res) => {
  const userCliId = normalizeText(req.body?.userCliId, 80);
  const accountId = normalizeText(req.body?.accountId, 80);
  const amount = normalizeAmount(req.body?.amount);
  const transactionType = normalizeText(req.body?.transactionType, 80);
  const currency = normalizeText(req.body?.currency, 10).toUpperCase();
  const userCobId = req.user.id;
  const transactionDate = new Date();

  if (!userCliId || !accountId || amount === null || !transactionType || !currency) {
    return res.status(400).json({
      message: 'Faltan campos obligatorios para el depósito (ID de cliente, ID de cuenta, monto, tipo de transacción, moneda).',
    });
  }

  if (!isUuid(userCliId) || !isUuid(accountId)) {
    return res.status(400).json({ message: 'El cliente o la cuenta no tienen un identificador válido.' });
  }

  if (!ALLOWED_CURRENCIES.has(currency)) {
    return res.status(400).json({ message: 'La moneda enviada no es válida.' });
  }

  if (!ALLOWED_TRANSACTION_TYPES.has(transactionType)) {
    return res.status(400).json({ message: 'El tipo de transacción enviado no es válido.' });
  }

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const accountValidation = await client.query(
      `
        SELECT a.id, a.currency
        FROM accounts a
        INNER JOIN user_cli uc ON uc.id = a.user_cli_id
        WHERE a.id = $1
          AND uc.id = $2
          AND uc.collector_id = $3
        FOR UPDATE;
      `,
      [accountId, userCliId, userCobId]
    );

    if (accountValidation.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        message: 'Acceso denegado: la cuenta no pertenece al socio asignado al cobrador autenticado.',
      });
    }

    if (accountValidation.rows[0].currency !== currency) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'La moneda del depósito no coincide con la moneda de la cuenta.' });
    }

    const description = `Depósito de ${currency} ${amount.toFixed(2)} - ${transactionType}`;

    const movementResult = await client.query(
      `
        INSERT INTO movements (
          user_cli_id, user_cob_id, account_id,
          amount, currency, transaction_type, transaction_date, description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `,
      [userCliId, userCobId, accountId, amount, currency, transactionType, transactionDate, description]
    );

    const accountUpdateResult = await client.query(
      `
        UPDATE accounts
        SET balance = balance + $1
        WHERE id = $2
        RETURNING *;
      `,
      [amount, accountId]
    );

    if (accountUpdateResult.rows.length === 0) {
      throw new Error('Cuenta no encontrada o no actualizada.');
    }

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Depósito registrado y cuenta actualizada exitosamente.',
      movement: movementResult.rows[0],
      account: accountUpdateResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

module.exports = { createDeposit };
