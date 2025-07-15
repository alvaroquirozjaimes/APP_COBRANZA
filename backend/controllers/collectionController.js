/* // controllers/collectionController.js
const db = require('../config/db');

// @desc    Obtener resumen de la zona de cobranza para un cobrador
// @route   GET /api/cobranza/summary?month=<YYYY-MM>
// @access  Private (requiere token de user_cob)
const getCollectionSummary = async (req, res) => {
    const { month } = req.query; // Mes en formato YYYY-MM
    // req.user.id proviene del JWT, que para un usuario de cobranza será su id de user_cob
    const collectorId = req.user.id; 

    if (!month) {
        return res.status(400).json({ message: 'Se requiere un mes para obtener el resumen de cobranza.' });
    }

    const startDate = `${month}-01`;
    // Calcular el último día del mes
    const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1));
    endDate.setDate(endDate.getDate() - 1); // Restar un día para obtener el último día del mes
    const endDateFormatted = endDate.toISOString().split('T')[0];


    try {
        // --- Consultas adaptadas al nuevo esquema de DB ---

        // 1. Contar socios asignados al cobrador (o socios con movimientos en el mes asociados a este cobrador)
        // Usamos user_cli y filtramos por collector_id asignado en la tabla user_cli
        const totalSociosResult = await db.query(
            `SELECT COUNT(DISTINCT uc.id) AS total_socios
             FROM user_cli uc
             WHERE uc.collector_id = $1;`,
            [collectorId]
        );
        const totalSocios = parseInt(totalSociosResult.rows[0]?.total_socios || 0);

        // 2. Obtener socios cobrados en el mes por este cobrador
        // Contamos movimientos asociados al user_cob_id del cobrador en el rango de fechas
        const collectedPartnersResult = await db.query(
            `SELECT COUNT(DISTINCT m.user_cli_id) AS collected_partners
             FROM movements m
             WHERE m.user_cob_id = $1
             AND m.transaction_date BETWEEN $2 AND ($3::date + interval '1 day');`, // Usamos transaction_date y ajustamos el final del rango
            [collectorId, startDate, endDateFormatted]
        );
        const collectedPartners = parseInt(collectedPartnersResult.rows[0]?.collected_partners || 0);

        // 3. Suma de montos por tipo de movimiento en el mes (ejemplo)
        // Adaptamos a 'transaction_type' y 'transaction_date'
        const monthlySummaryResult = await db.query(
            `SELECT
                COALESCE(SUM(CASE WHEN m.transaction_type = 'daily_collection_lt_30' THEN m.amount ELSE 0 END), 0) AS daily_collection_lt_30,
                COALESCE(SUM(CASE WHEN m.transaction_type = 'daily_collection_gt_30' THEN m.amount ELSE 0 END), 0) AS daily_collection_gt_30,
                COALESCE(SUM(CASE WHEN m.transaction_type = 'contribution' THEN m.amount ELSE 0 END), 0) AS total_contributions,
                COALESCE(SUM(CASE WHEN m.transaction_type = 'loan_payment' THEN m.amount ELSE 0 END), 0) AS total_loans_collected,
                COALESCE(SUM(CASE WHEN m.transaction_type = 'savings_deposit' THEN m.amount ELSE 0 END), 0) AS total_savings_collected
             FROM movements m
             WHERE m.user_cob_id = $1 AND m.transaction_date BETWEEN $2 AND ($3::date + interval '1 day');`, // Ajuste para endDate
            [collectorId, startDate, endDateFormatted]
        );

        const monthlySummary = monthlySummaryResult.rows[0];

        // Nota sobre los tipos de transacción:
        // 'Cob Diaria <=30' -> 'daily_collection_lt_30'
        // 'Cob Diaria >30'  -> 'daily_collection_gt_30'
        // 'Aportes'         -> 'contribution'
        // 'Prestamo'        -> 'loan_payment' (asumiendo que es un pago de préstamo)
        // 'Ahorro'          -> 'savings_deposit' (asumiendo que es un depósito de ahorro)
        // Asegúrate de que estos 'transaction_type' coincidan con los valores que usas al insertar movimientos.

        const summaryData = {
            zoneName: 'CAYHUAYNA', // Esto sigue siendo un valor estático; si viene de la DB, necesitarías una tabla de zonas
            totalPartners: totalSocios,
            dailyCollectionLessThan30: parseFloat(monthlySummary.daily_collection_lt_30 || 0).toFixed(2),
            dailyCollectionGreaterThan30: parseFloat(monthlySummary.daily_collection_gt_30 || 0).toFixed(2),
            totalContributions: parseFloat(monthlySummary.total_contributions || 0).toFixed(2),
            collectedPartners: collectedPartners,
            loans: parseFloat(monthlySummary.total_loans_collected || 0).toFixed(2), // Renombrado
            contributionsCollected: parseFloat(monthlySummary.total_contributions || 0).toFixed(2),
            savings: parseFloat(monthlySummary.total_savings_collected || 0).toFixed(2), // Renombrado
            // totalCollected ahora debe sumar las nuevas categorías relevantes para la cobranza
            totalCollected: (
                parseFloat(monthlySummary.daily_collection_lt_30 || 0) +
                parseFloat(monthlySummary.daily_collection_gt_30 || 0) +
                parseFloat(monthlySummary.total_contributions || 0) +
                parseFloat(monthlySummary.total_loans_collected || 0) +
                parseFloat(monthlySummary.total_savings_collected || 0)
            ).toFixed(2),
        };

        res.json(summaryData);

    } catch (error) {
        console.error('Error al obtener resumen de cobranza:', error.message);
        res.status(500).json({ message: 'Error del servidor al obtener resumen de cobranza' });
    }
};

module.exports = { getCollectionSummary }; */



// controllers/collectionController.js
const db = require('../config/db');

// @desc    Obtener resumen de la zona de cobranza para un cobrador
// @route   GET /api/cobranza/summary?month=<YYYY-MM>
// @access  Private (requiere token de user_cob)
const getCollectionSummary = async (req, res) => {
    const { month } = req.query; // Mes en formato YYYY-MM
    const collectorId = req.user.id;

    if (!month) {
        return res.status(400).json({ message: 'Se requiere un mes para obtener el resumen de cobranza.' });
    }

    const startDate = `${month}-01`;
    // Calcular el último día del mes
    const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1));
    endDate.setDate(endDate.getDate() - 1); // Restar un día para obtener el último día del mes
    const endDateFormatted = endDate.toISOString().split('T')[0];


    try {
        // --- Consultas adaptadas al nuevo esquema de DB ---

        // 1. Contar socios asignados al cobrador
        const totalSociosResult = await db.query(
            `SELECT COUNT(DISTINCT uc.id) AS total_socios
             FROM user_cli uc
             WHERE uc.collector_id = $1;`,
            [collectorId]
        );
        const totalSocios = parseInt(totalSociosResult.rows[0]?.total_socios || 0);

        // 2. Obtener socios cobrados en el mes por este cobrador (los que tienen al menos 1 movimiento)
        const collectedPartnersResult = await db.query(
            `SELECT COUNT(DISTINCT m.user_cli_id) AS collected_partners
             FROM movements m
             WHERE m.user_cob_id = $1
             AND m.transaction_date BETWEEN $2 AND ($3::date + interval '1 day');`,
            [collectorId, startDate, endDateFormatted]
        );
        const collectedPartners = parseInt(collectedPartnersResult.rows[0]?.collected_partners || 0);

        // 3. Obtener todos los montos por tipo de movimiento y moneda en el mes
        const monthlySummaryRawResult = await db.query(
            `SELECT
                m.currency,
                m.transaction_type,
                COALESCE(SUM(m.amount), 0) AS total_amount
             FROM movements m
             WHERE m.user_cob_id = $1
               AND m.transaction_date BETWEEN $2 AND ($3::date + interval '1 day')
             GROUP BY m.currency, m.transaction_type;`,
            [collectorId, startDate, endDateFormatted]
        );

        // Inicializar todas las sumas a 0. Las pasamos a números para poder operar con ellas.
        let dailyCollectionLessThan30 = 0;
        let dailyCollectionGreaterThan30 = 0;
        let totalContributions = 0; // Se refiere a 'contribution' en PEN
        let totalLoanPaymentsPEN = 0;
        let totalLoanPaymentsUSD = 0;
        let totalSavingsPEN = 0; // Se refiere a 'savings_deposit' en PEN
        let totalSavingsUSD = 0; // Se refiere a 'savings_deposit' en USD

        monthlySummaryRawResult.rows.forEach(row => {
            const amount = parseFloat(row.total_amount);
            const type = row.transaction_type;
            const currency = row.currency;

            if (currency === 'PEN') {
                if (type === 'daily_collection_lt_30') {
                    dailyCollectionLessThan30 += amount;
                } else if (type === 'daily_collection_gt_30') {
                    dailyCollectionGreaterThan30 += amount;
                } else if (type === 'contribution') {
                    totalContributions += amount;
                } else if (type === 'loan_payment') {
                    totalLoanPaymentsPEN += amount;
                }
                // Si 'contribution' TAMBIÉN se cuenta como 'savings_deposit' para el total de ahorros,
                // DEBES añadirlo aquí. O si 'savings_deposit' es un tipo real de tu DB.
                // Basado en tu esquema de `movements`, 'savings_deposit' sería el tipo de transacción.
                else if (type === 'savings_deposit') { // <-- Asegúrate que 'savings_deposit' sea el tipo que usas para Ahorros
                    totalSavingsPEN += amount;
                }
            } else if (currency === 'USD') {
                // Aquí podrías agregar lógica para otros tipos de transacción en USD si los manejas
                if (type === 'loan_payment') {
                    totalLoanPaymentsUSD += amount;
                } else if (type === 'savings_deposit') { // <-- Asegúrate que 'savings_deposit' sea el tipo que usas para Ahorros
                    totalSavingsUSD += amount;
                }
            }
        });

        // Calcular el 'totalCollection' sumando todos los montos relevantes en PEN.
        // Aquí incluimos todos los tipos de movimientos en PEN que representan 'recaudación'.
        const totalCollection = (
            dailyCollectionLessThan30 +
            dailyCollectionGreaterThan30 +
            totalContributions + // Aportes
            totalLoanPaymentsPEN + // Pagos de Préstamos
            totalSavingsPEN // Depósitos de Ahorro
        );

        // Construir el objeto de respuesta con los nombres de propiedades que el frontend espera
        const summaryData = {
            zoneName: 'CAYHUAYNA', // Todavía es estático. Si viene de la DB, necesitarías otra consulta.
            totalPartners: totalSocios,
            collectedPartners: collectedPartners,

            // Cobranza Diaria
            dailyCollectionLessThan30: dailyCollectionLessThan30.toFixed(2),
            dailyCollectionGreaterThan30: dailyCollectionGreaterThan30.toFixed(2),

            // Aportes y Préstamos
            totalContributions: totalContributions.toFixed(2), // Coincide con 'Total Aportes'
            loans: totalLoanPaymentsPEN.toFixed(2), // Coincide con 'Préstamos' (PEN)
            contributionsCollected: totalContributions.toFixed(2), // Duplica totalContributions, si es diferente, necesitas otra lógica/SQL

            // Resumen Financiero - ¡Nombres de propiedades CORREGIDOS para el frontend!
            totalSavingsPEN: totalSavingsPEN.toFixed(2), // Ahora suma 'savings_deposit' en PEN
            totalSavingsUSD: totalSavingsUSD.toFixed(2), // Ahora suma 'savings_deposit' en USD
            totalCollection: totalCollection.toFixed(2), // <-- RENOMBRADO de 'totalCollected' a 'totalCollection'
            totalLoanPaymentsPEN: totalLoanPaymentsPEN.toFixed(2), // <-- NUEVO CAMPO para el frontend
            totalLoanPaymentsUSD: totalLoanPaymentsUSD.toFixed(2) // <-- NUEVO CAMPO para el frontend
        };

        res.json(summaryData);

    } catch (error) {
        console.error('Error al obtener resumen de cobranza:', error.message);
        res.status(500).json({ message: 'Error del servidor al obtener resumen de cobranza' });
    }
};

module.exports = { getCollectionSummary };