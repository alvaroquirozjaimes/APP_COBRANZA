const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { isValidMonth } = require('../validators/commonValidators');

const getMonthRange = (month) => {
  const [year, monthNumber] = month.split('-').map(Number);
  const startDate = `${month}-01`;
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
};

const getCollectionSummary = asyncHandler(async (req, res) => {
  const { month } = req.query;
  const collectorId = req.user.id;

  if (!isValidMonth(month)) {
    return res.status(400).json({ message: 'Se requiere un mes válido con formato YYYY-MM.' });
  }

  const { startDate, endDate } = getMonthRange(month);

  const totalSociosResult = await db.query(
    `
      SELECT COUNT(DISTINCT uc.id) AS total_socios
      FROM user_cli uc
      WHERE uc.collector_id = $1;
    `,
    [collectorId]
  );

  const collectedPartnersResult = await db.query(
    `
      SELECT COUNT(DISTINCT m.user_cli_id) AS collected_partners
      FROM movements m
      WHERE m.user_cob_id = $1
        AND m.transaction_date >= $2::date
        AND m.transaction_date < ($3::date + interval '1 day');
    `,
    [collectorId, startDate, endDate]
  );

  const monthlySummaryRawResult = await db.query(
    `
      SELECT
        m.currency,
        m.transaction_type,
        COALESCE(SUM(m.amount), 0) AS total_amount
      FROM movements m
      WHERE m.user_cob_id = $1
        AND m.transaction_date >= $2::date
        AND m.transaction_date < ($3::date + interval '1 day')
      GROUP BY m.currency, m.transaction_type;
    `,
    [collectorId, startDate, endDate]
  );

  let dailyCollectionLessThan30 = 0;
  let dailyCollectionGreaterThan30 = 0;
  let totalContributions = 0;
  let totalLoanPaymentsPEN = 0;
  let totalLoanPaymentsUSD = 0;
  let totalSavingsPEN = 0;
  let totalSavingsUSD = 0;

  monthlySummaryRawResult.rows.forEach((row) => {
    const amount = Number(row.total_amount || 0);
    const type = row.transaction_type;
    const currency = row.currency;

    if (currency === 'PEN') {
      if (type === 'daily_collection_lt_30') dailyCollectionLessThan30 += amount;
      if (type === 'daily_collection_gt_30') dailyCollectionGreaterThan30 += amount;
      if (type === 'contribution') totalContributions += amount;
      if (type === 'loan_payment') totalLoanPaymentsPEN += amount;
      if (type === 'savings_deposit') totalSavingsPEN += amount;
    }

    if (currency === 'USD') {
      if (type === 'loan_payment') totalLoanPaymentsUSD += amount;
      if (type === 'savings_deposit') totalSavingsUSD += amount;
    }
  });

  const totalCollection = (
    dailyCollectionLessThan30
    + dailyCollectionGreaterThan30
    + totalContributions
    + totalLoanPaymentsPEN
    + totalSavingsPEN
  );

  return res.json({
    zoneName: 'CAYHUAYNA',
    totalPartners: Number(totalSociosResult.rows[0]?.total_socios || 0),
    collectedPartners: Number(collectedPartnersResult.rows[0]?.collected_partners || 0),
    dailyCollectionLessThan30: dailyCollectionLessThan30.toFixed(2),
    dailyCollectionGreaterThan30: dailyCollectionGreaterThan30.toFixed(2),
    totalContributions: totalContributions.toFixed(2),
    loans: totalLoanPaymentsPEN.toFixed(2),
    contributionsCollected: totalContributions.toFixed(2),
    totalSavingsPEN: totalSavingsPEN.toFixed(2),
    totalSavingsUSD: totalSavingsUSD.toFixed(2),
    totalCollection: totalCollection.toFixed(2),
    totalLoanPaymentsPEN: totalLoanPaymentsPEN.toFixed(2),
    totalLoanPaymentsUSD: totalLoanPaymentsUSD.toFixed(2),
  });
});

module.exports = { getCollectionSummary };
