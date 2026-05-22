const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { isUuid, normalizeText } = require('../validators/commonValidators');

const getPartners = asyncHandler(async (req, res) => {
  const search = normalizeText(req.query?.search, 80);
  const userCobId = req.user.id;

  const params = [userCobId];
  let filter = '';

  if (search) {
    params.push(`%${search}%`);
    filter = 'AND (name ILIKE $2 OR document_number ILIKE $2)';
  }

  const result = await db.query(
    `
      SELECT id, name, document_number, email, phone_number
      FROM user_cli
      WHERE collector_id = $1
      ${filter}
      ORDER BY name ASC
      LIMIT 100;
    `,
    params
  );

  return res.json(result.rows);
});

const getPartnerAccounts = asyncHandler(async (req, res) => {
  const id = normalizeText(req.params?.id, 80);
  const userCobId = req.user.id;

  if (!isUuid(id)) {
    return res.status(400).json({ message: 'El identificador del socio no es válido.' });
  }

  const verifyResult = await db.query(
    `
      SELECT id
      FROM user_cli
      WHERE id = $1 AND collector_id = $2
      LIMIT 1;
    `,
    [id, userCobId]
  );

  if (verifyResult.rows.length === 0) {
    return res.status(403).json({
      message: 'Acceso denegado: El socio no está asignado a este cobrador o no existe.',
    });
  }

  const result = await db.query(
    `
      SELECT id, account_number, account_type, currency, balance
      FROM accounts
      WHERE user_cli_id = $1
      ORDER BY account_number ASC;
    `,
    [id]
  );

  return res.json(result.rows);
});

module.exports = {
  getPartners,
  getPartnerAccounts,
};
