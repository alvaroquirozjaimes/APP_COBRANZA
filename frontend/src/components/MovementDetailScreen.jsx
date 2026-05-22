import React, { useState, useEffect } from "react"
import { API_BASE_URL } from "../config/api.jsx"

const MovementDetailScreen = ({
  onGoBack,
  authToken,
  authenticatedFetch,
  collectorName = "DMCA",
  onNavHome,
  onNavRecaudacion,
  onNavLogout,
  currentPage,
}) => {
  const [movements, setMovements] = useState([])
  const [totalRecaudadoSoles, setTotalRecaudadoSoles] = useState(0)
  const [totalRecaudadoUSD, setTotalRecaudadoUSD] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  )

  const formatHeaderDate = (isoDate) => {
    if (!isoDate) return ""
    const [year, month, day] = isoDate.split("-")
    if (!year || !month || !day) return ""
    return `${day}${month}${year}`
  }

  useEffect(() => {
    const fetchMovements = async () => {
      if (!authToken) {
        setError("No autorizado. Por favor, inicie sesión.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError("")
      setMovements([])
      setTotalRecaudadoSoles(0)
      setTotalRecaudadoUSD(0)

      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/movements?date=${encodeURIComponent(selectedDate)}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

        const data = await response.json()

        if (response.ok) {
          setMovements(data.movements || [])
          setTotalRecaudadoSoles(data.totalRecaudadoSoles || 0)
          setTotalRecaudadoUSD(data.totalRecaudadoUSD || 0)
        } else {
          setError(data.message || "Error al cargar los movimientos.")
        }
      } catch (err) {
        console.error("Error al obtener movimientos:", err)
        setError("No se pudo conectar con el servidor.")
      } finally {
        setLoading(false)
      }
    }

    fetchMovements()
  }, [selectedDate, authToken, authenticatedFetch])

  const isInicioActive = ["collectionZoneDetail", "searchPartner", "deposit"].includes(
    currentPage
  )
  const isRecaudacionActive = currentPage === "movementDetail"

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center">
      <div className="w-full max-w-md bg-gray-200 flex flex-col shadow-lg animate-fade-in">
        {/* HEADER AZUL */}
        <header className="bg-blue-600 text-white px-3 py-2">
          <div className="flex items-center">
            <button
              onClick={onGoBack}
              className="p-1 mr-2 active:opacity-70"
              disabled={loading}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 text-center leading-tight">
              <p className="text-xs font-semibold">
                Recaudados del día: {formatHeaderDate(selectedDate)}
              </p>
              <p className="text-[11px]">Cobrador: {collectorName}</p>
            </div>

            <div className="w-5" />
          </div>
        </header>

        {/* Selector de fecha */}
        <div className="px-3 py-2 bg-gray-200 border-b border-gray-300 flex items-center gap-2">
          <span className="text-[11px] text-gray-700 font-medium">Fecha:</span>
          <input
            type="date"
            id="movementDate"
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-[11px] text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto px-3 pt-2 pb-3">
          {loading && (
            <div className="flex justify-center items-center text-blue-700 text-xs mt-4">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
              Cargando movimientos...
            </div>
          )}

          {error && !loading && (
            <p className="text-center text-red-600 text-xs mt-4">{error}</p>
          )}

          {!loading && movements.length === 0 && !error && (
            <p className="text-center text-gray-500 text-xs mt-4">
              No hay movimientos para la fecha seleccionada.
            </p>
          )}

          {movements.length > 0 && (
            <div className="mt-1">
              <div className="grid grid-cols-[1.2fr,3fr,2.4fr,1fr] bg-gray-300 px-2 py-2 text-[11px] font-semibold text-gray-800">
                <span className="text-right">Importe</span>
                <span>Cliente</span>
                <span>Cuenta</span>
                <span className="text-center">Tipo</span>
              </div>

              <div className="bg-gray-300 pt-[1px]">
                {movements.map((move) => (
                  <div
                    key={move.id}
                    className="grid grid-cols-[1.2fr,3fr,2.4fr,1fr] bg-white px-2 py-2 text-[11px] text-gray-800 mb-[1px]"
                  >
                    <span className="text-right font-medium">
                      {parseFloat(move.amount).toFixed(2)}
                    </span>
                    <span className="truncate uppercase ml-1">
                      {move.client_name}
                    </span>
                    <span className="truncate ml-1">
                      {move.account_number}
                    </span>
                    <span className="text-center uppercase">
                      {move.transaction_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TARJETA DE TOTAL */}
        <div className="px-3 pb-3">
          <div className="bg-white rounded-md shadow px-3 py-2 text-[11px] text-gray-800 border border-gray-300">
            <p className="text-center font-bold mb-1">TOTAL RECAUDADO</p>
            <div className="flex justify-between">
              <span>S/.</span>
              <span>{Number(totalRecaudadoSoles).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>USD</span>
              <span>{Number(totalRecaudadoUSD).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
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

export default MovementDetailScreen
