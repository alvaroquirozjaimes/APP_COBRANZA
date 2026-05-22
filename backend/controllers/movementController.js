const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { isValidDate } = require('../validators/commonValidators');

const getMovements = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const userCobId = req.user.id;

  if (!isValidDate(date)) {
    return res.status(400).json({ message: 'Se requiere una fecha válida con formato YYYY-MM-DD.' });
  }

  const result = await db.query(
    `
      SELECT
        m.id,
        m.amount,
        m.currency,
        uc.name AS client_name,
        a.account_number,
        m.transaction_type,
        m.transaction_date,
        m.description
      FROM movements m
      INNER JOIN user_cli uc ON m.user_cli_id = uc.id
      INNER JOIN accounts a ON m.account_id = a.id
      WHERE m.user_cob_id = $1
        AND m.transaction_date >= $2::date
        AND m.transaction_date < ($2::date + interval '1 day')
      ORDER BY m.transaction_date DESC;
    `,
    [userCobId, date]
  );

  let totalRecaudadoSoles = 0;
  let totalRecaudadoUSD = 0;

  result.rows.forEach((move) => {
    if (move.currency === 'PEN') totalRecaudadoSoles += Number(move.amount || 0);
    if (move.currency === 'USD') totalRecaudadoUSD += Number(move.amount || 0);
  });

  return res.json({
    movements: result.rows,
    totalRecaudadoSoles: totalRecaudadoSoles.toFixed(2),
    totalRecaudadoUSD: totalRecaudadoUSD.toFixed(2),
  });
});

module.exports = { getMovements };
