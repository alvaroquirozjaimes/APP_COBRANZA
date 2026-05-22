import React, { useState, useEffect } from "react"
import { API_BASE_URL } from "../config/api.jsx"

const formatAmount = (value) =>
  Number(value || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const DetailRow = ({ label, pen, usd, bold = false }) => (
  <div className="flex justify-between items-baseline text-[11px] mb-1">
    <span className={bold ? "font-semibold" : ""}>{label}</span>
    <div className="flex items-baseline gap-2">
      <span>S/</span>
      <span className="w-20 text-right">{formatAmount(pen)}</span>
      <span className="ml-2">USD</span>
      <span className="w-20 text-right">{formatAmount(usd)}</span>
    </div>
  </div>
)

const CollectionZoneDetailScreen = ({
  authToken,
  authenticatedFetch,
  onGoToSearchPartner,
  onNavHome,
  onNavRecaudacion,
  onNavLogout,
  currentPage,
}) => {
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  )

  useEffect(() => {
    const fetchCollectionSummary = async () => {
      if (!authToken) {
        setError("No autorizado. Por favor, inicie sesión.")
        return
      }

      setLoading(true)
      setError("")
      setSummaryData(null)

      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/summary?month=${encodeURIComponent(selectedMonth)}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

        const data = await response.json()

        if (response.ok) {
          setSummaryData(data)
        } else {
          setError(data.message || "Error al cargar el resumen de cobranza.")
        }
      } catch (err) {
        console.error("Error al obtener resumen de cobranza:", err)
        setError(
          "No se pudo conectar con el servidor para obtener el resumen."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCollectionSummary()
  }, [selectedMonth, authToken, authenticatedFetch])

  const isInicioActive = ["collectionZoneDetail", "searchPartner", "deposit"].includes(
    currentPage
  )
  const isRecaudacionActive = currentPage === "movementDetail"

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center">
      {/* Contenedor tipo móvil */}
      <div className="w-full max-w-md bg-gray-200 flex flex-col shadow-lg">
        {/* HEADER AZUL (SIN FLECHA ATRÁS) */}
        <header className="bg-blue-600 text-white px-3 py-3 flex items-center">
          {/* Espacio a la izquierda para mantener el título centrado */}
          <div className="w-5" />
          <h1 className="flex-1 text-center text-sm font-semibold">
            Mis Zonas de Cobranza
          </h1>
          {/* Espacio a la derecha con el mismo ancho */}
          <div className="w-5" />
        </header>

        {/* Selección de mes */}
        <div className="px-3 py-2 bg-gray-200 flex justify-end items-center gap-2 border-b border-gray-300">
          <span className="text-[11px] text-gray-700">Mes:</span>
          <input
            type="month"
            className="border border-gray-300 rounded px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {loading && (
            <div className="flex items-center justify-center text-blue-700 text-xs mt-4">
              <svg
                className="animate-spin h-5 w-5 mr-2"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z"
                ></path>
              </svg>
              Cargando resumen...
            </div>
          )}

          {error && !loading && (
            <p className="text-center text-red-600 text-xs mt-4">{error}</p>
          )}

          {!loading && !summaryData && !error && (
            <p className="text-center text-gray-500 text-xs mt-4">
              No hay datos de resumen para el mes seleccionado.
            </p>
          )}

          {summaryData && (
            <div className="bg-white border border-gray-300 rounded-md shadow overflow-hidden">
              {/* Cabecera de zona */}
              <div className="bg-gray-400 text-white flex items-center justify-between px-3 py-2">
                <span className="text-[12px] font-semibold tracking-wide">
                  {summaryData.zoneName || "Zona"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onGoToSearchPartner &&
                    onGoToSearchPartner(summaryData.zoneName)
                  }
                  className="text-lg font-bold"
                >
                  {">"}
                </button>
              </div>

              {/* Contenido gris interno */}
              <div className="bg-gray-300 px-3 py-2 text-gray-900">
                <p className="text-[11px] mb-2">
                  {summaryData.totalPartners || 0} Socios
                </p>

                <DetailRow
                  label="Cob Diaria <=30"
                  pen={summaryData.dailyCollectionLessThan30}
                  usd={summaryData.dailyCollectionLessThan30USD}
                />
                <DetailRow
                  label="Cob Diaria >30"
                  pen={summaryData.dailyCollectionGreaterThan30}
                  usd={summaryData.dailyCollectionGreaterThan30USD}
                />
                <DetailRow
                  label="Otros créditos"
                  pen={summaryData.otherCreditsPEN}
                  usd={summaryData.otherCreditsUSD}
                />
                <DetailRow
                  label="Aportes"
                  pen={summaryData.totalContributions}
                  usd={summaryData.totalContributionsUSD}
                />

                <p className="text-[11px] mt-3 mb-1">
                  {summaryData.collectedPartners || 0} Socios cobrados
                </p>

                <DetailRow
                  label="Préstamos"
                  pen={summaryData.loans}
                  usd={summaryData.loansUSD}
                />
                <DetailRow
                  label="Aportes"
                  pen={summaryData.contributionsCollected}
                  usd={summaryData.contributionsCollectedUSD}
                />
                <DetailRow
                  label="Ahorros"
                  pen={summaryData.totalSavingsPEN}
                  usd={summaryData.totalSavingsUSD}
                />

                <DetailRow
                  label="Total"
                  pen={summaryData.totalLoanPaymentsPEN}
                  usd={summaryData.totalLoanPaymentsUSD}
                  bold
                />
                <DetailRow
                  label="Total Recaudado"
                  pen={summaryData.totalCollection}
                  usd={summaryData.totalCollectionUSD}
                  bold
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER: barra inferior */}
        <footer className="border-t bg-white py-2 flex justify-around text-[11px]">
          <button
            className={`flex flex-col items-center ${
              isInicioActive ? "text-blue-600" : "text-gray-600"
            }`}
            onClick={onNavHome}
          >
            <span className="text-xl">🏠</span>
            <span>Inicio</span>
          </button>
          <button
            className={`flex flex-col items-center ${
              isRecaudacionActive ? "text-blue-600" : "text-gray-600"
            }`}
            onClick={onNavRecaudacion}
          >
            <span className="text-xl">💰</span>
            <span>Recaudación</span>
          </button>
          <button
            className="flex flex-col items-center text-gray-600"
            onClick={onNavLogout}
          >
            <span className="text-xl">⏻</span>
            <span>Cerrar Sesión</span>
          </button>
        </footer>
      </div>
    </div>
  )
}

export default CollectionZoneDetailScreen
