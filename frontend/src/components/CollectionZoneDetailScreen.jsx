import React, { useState, useEffect } from 'react';

// URL base de tu backend. Asegúrate de que coincida con el puerto de tu servidor Express.
const API_BASE_URL = 'http://localhost:5000/api/cobranza';

const CollectionZoneDetailScreen = ({ onGoBack, authToken }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const fetchCollectionSummary = async () => {
      if (!authToken) {
        setError('No autorizado. Por favor, inicie sesión.');
        return;
      }

      setLoading(true);
      setError('');
      setSummaryData(null);

      try {
        const response = await fetch(`${API_BASE_URL}/summary?month=${selectedMonth}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Datos del resumen recibidos:", data); // AÑADIDO PARA DEBUGGING
          setSummaryData(data);
        } else {
          setError(data.message || 'Error al cargar el resumen de cobranza.');
        }
      } catch (err) {
        console.error('Error al obtener resumen de cobranza:', err);
        setError('No se pudo conectar con el servidor para obtener el resumen.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionSummary();
  }, [selectedMonth, authToken]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Detalle Zona de Cobranza y Cobro del Mes</h2>

        <div className="mb-6">
          <label htmlFor="collectionMonth" className="block text-gray-700 text-sm font-medium mb-2">Seleccionar Mes:</label>
          <input
            type="month"
            id="collectionMonth"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={loading}
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center mb-4">
            <svg className="animate-spin h-5 w-5 text-blue-500 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando resumen...
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-4 font-medium text-center">{error}</p>}

        {!loading && !summaryData && !error && (
          <p className="text-gray-600 text-center mb-4">No hay datos de resumen para el mes seleccionado.</p>
        )}

        {summaryData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Información General</h3>
              <p className="text-gray-700">Zona: <span className="font-bold text-blue-700">{summaryData.zoneName || 'N/A'}</span></p>
              <p className="text-gray-700">Total Socios: <span className="font-bold text-blue-700">{summaryData.totalPartners || 0}</span></p>
              <p className="text-gray-700">Socios Cobrados: <span className="font-bold text-blue-700">{summaryData.collectedPartners || 0}</span></p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cobranza Diaria</h3>
              <p className="text-gray-700">Cob. Diaria &lt;=30: <span className="font-bold text-green-700">S/ {parseFloat(summaryData.dailyCollectionLessThan30 || 0).toFixed(2)}</span></p>
              <p className="text-gray-700">Cob. Diaria &gt;30: <span className="font-bold text-green-700">S/ {parseFloat(summaryData.dailyCollectionGreaterThan30 || 0).toFixed(2)}</span></p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Aportes y Préstamos</h3>
              <p className="text-gray-700">Total Aportes: <span className="font-bold text-purple-700">S/ {parseFloat(summaryData.totalContributions || 0).toFixed(2)}</span></p>
              <p className="text-gray-700">Préstamos: <span className="font-bold text-purple-700">S/ {parseFloat(summaryData.loans || 0).toFixed(2)}</span></p>
              <p className="text-gray-700">Aportes Cobrados: <span className="font-bold text-purple-700">S/ {parseFloat(summaryData.contributionsCollected || 0).toFixed(2)}</span></p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Resumen Financiero</h3>
              <p className="text-gray-700">Ahorros (PEN): <span className="font-bold text-yellow-700">S/ {parseFloat(summaryData.totalSavingsPEN || 0).toFixed(2)}</span></p>
              <p className="text-gray-700">Ahorros (USD): <span className="font-bold text-yellow-700">$ {parseFloat(summaryData.totalSavingsUSD || 0).toFixed(2)}</span></p>
              <p className="text-gray-700">Total Recaudado (PEN): <span className="font-bold text-yellow-700">S/ {parseFloat(summaryData.totalCollection || 0).toFixed(2)}</span></p>
              <p className="text-gray-700">Total Préstamos (PEN): <span className="font-bold text-yellow-700">S/ {parseFloat(summaryData.totalLoanPaymentsPEN || 0).toFixed(2)}</span></p>
              <p className="text-gray-700">Total Préstamos (USD): <span className="font-bold text-yellow-700">$ {parseFloat(summaryData.totalLoanPaymentsUSD || 0).toFixed(2)}</span></p>
            </div>
          </div>
        )}

        <button
          onClick={onGoBack}
          className="w-full bg-gray-300 text-gray-800 py-3 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out font-semibold text-lg shadow-md"
          disabled={loading}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default CollectionZoneDetailScreen;
