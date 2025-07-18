// ===============================================
// CONTROLADOR DE RESUMEN DE COBRANZA
// ===============================================

// Importa el módulo de conexión a la base de datos PostgreSQL
const db = require('../config/db');


// ===============================================
// FUNCIÓN: Obtener resumen mensual de cobranza
// ===============================================

// @desc    Devuelve un resumen financiero del cobrador autenticado
// @route   GET /api/cobranza/summary?month=YYYY-MM
// @access  Privado (requiere autenticación con JWT)
const getCollectionSummary = async (req, res) => {
    // Extrae el mes desde la URL (query string), formato esperado: 'YYYY-MM'
    const { month } = req.query;
    
    // Extrae el ID del cobrador autenticado desde el JWT (inyectado por el middleware `protectCobranza`)
    const collectorId = req.user.id;

    // Validación: si no se especifica el mes
    if (!month) {
        return res.status(400).json({ message: 'Se requiere un mes para obtener el resumen de cobranza.' });
    }

    // Calcula fecha de inicio y fin del mes solicitado
    const startDate = `${month}-01`; // Ejemplo: 2025-07-01
    const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1));
    endDate.setDate(endDate.getDate() - 1); // Último día del mes
    const endDateFormatted = endDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD

    try {
        // ===============================================
        // CONSULTAS SQL PARA OBTENER EL RESUMEN
        // ===============================================

        // 1. Total de socios asignados al cobrador
        const totalSociosResult = await db.query(
            `SELECT COUNT(DISTINCT uc.id) AS total_socios
             FROM user_cli uc
             WHERE uc.collector_id = $1;`,
            [collectorId]
        );
        const totalSocios = parseInt(totalSociosResult.rows[0]?.total_socios || 0);

        // 2. Total de socios que hicieron al menos un movimiento ese mes
        const collectedPartnersResult = await db.query(
            `SELECT COUNT(DISTINCT m.user_cli_id) AS collected_partners
             FROM movements m
             WHERE m.user_cob_id = $1
             AND m.transaction_date BETWEEN $2 AND ($3::date + interval '1 day');`,
            [collectorId, startDate, endDateFormatted]
        );
        const collectedPartners = parseInt(collectedPartnersResult.rows[0]?.collected_partners || 0);

        // 3. Totales agrupados por tipo de transacción y moneda
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

        // ===============================================
        // PROCESAR RESULTADOS Y AGRUPAR POR CATEGORÍAS
        // ===============================================

        // Variables acumuladoras
        let dailyCollectionLessThan30 = 0;
        let dailyCollectionGreaterThan30 = 0;
        let totalContributions = 0;
        let totalLoanPaymentsPEN = 0;
        let totalLoanPaymentsUSD = 0;
        let totalSavingsPEN = 0;
        let totalSavingsUSD = 0;

        // Recorrer todos los movimientos agrupados por tipo y moneda
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
                } else if (type === 'savings_deposit') {
                    totalSavingsPEN += amount;
                }
            } else if (currency === 'USD') {
                if (type === 'loan_payment') {
                    totalLoanPaymentsUSD += amount;
                } else if (type === 'savings_deposit') {
                    totalSavingsUSD += amount;
                }
            }
        });

        // Suma total de cobranza en PEN
        const totalCollection = (
            dailyCollectionLessThan30 +
            dailyCollectionGreaterThan30 +
            totalContributions +
            totalLoanPaymentsPEN +
            totalSavingsPEN
        );

        // ===============================================
        // CONSTRUIR OBJETO DE RESPUESTA PARA EL FRONTEND
        // ===============================================
        const summaryData = {
            zoneName: 'CAYHUAYNA', // Valor fijo por ahora. Si necesitas zona dinámica, añade una consulta extra.

            totalPartners: totalSocios,           // Total de socios asignados
            collectedPartners: collectedPartners, // Socios cobrados ese mes

            // Detalles de cobranza diaria
            dailyCollectionLessThan30: dailyCollectionLessThan30.toFixed(2),
            dailyCollectionGreaterThan30: dailyCollectionGreaterThan30.toFixed(2),

            // Aportes y préstamos
            totalContributions: totalContributions.toFixed(2),
            loans: totalLoanPaymentsPEN.toFixed(2),
            contributionsCollected: totalContributions.toFixed(2), // Repetido a propósito si el frontend lo necesita

            // Ahorros y resumen financiero
            totalSavingsPEN: totalSavingsPEN.toFixed(2),
            totalSavingsUSD: totalSavingsUSD.toFixed(2),
            totalCollection: totalCollection.toFixed(2),
            totalLoanPaymentsPEN: totalLoanPaymentsPEN.toFixed(2),
            totalLoanPaymentsUSD: totalLoanPaymentsUSD.toFixed(2)
        };

        // Enviar respuesta al frontend
        res.json(summaryData);

    } catch (error) {
        console.error('Error al obtener resumen de cobranza:', error.message);
        res.status(500).json({ message: 'Error del servidor al obtener resumen de cobranza' });
    }
};


// Exportar la función para que pueda usarse en las rutas
module.exports = { getCollectionSummary };
