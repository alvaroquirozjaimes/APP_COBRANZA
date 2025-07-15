import React, { useState, useEffect } from "react"

// URL base de tu backend. Asegúrate de que coincida con el puerto de tu servidor Express.
const API_BASE_URL = "http://localhost:5000/api/cobranza"

const MovementDetailScreen = ({ onGoBack, authToken, authenticatedFetch }) => {
  const [movements, setMovements] = useState([])
  const [totalRecaudadoSoles, setTotalRecaudadoSoles] = useState(0)
  const [totalRecaudadoUSD, setTotalRecaudadoUSD] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA") // 'YYYY-MM-DD' en formato local
  )

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
          `${API_BASE_URL}/movements?date=${selectedDate}`,
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-6 sm:p-10 space-y-6 animate-fade-in">
        <h2 className="text-3xl font-extrabold text-center text-blue-900">
          📅 Recaudación del Día
        </h2>

        <div>
          <label
            htmlFor="movementDate"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Seleccionar Fecha:
          </label>
          <input
            type="date"
            id="movementDate"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg text-gray-800 shadow-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={loading}
          />
        </div>

        {loading && (
          <div className="flex justify-center items-center text-blue-600 font-medium">
            <svg
              className="animate-spin h-6 w-6 mr-3 text-blue-600"
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
              />
            </svg>
            Cargando movimientos...
          </div>
        )}

        {error && (
          <p className="text-center text-red-600 font-semibold">{error}</p>
        )}

        {!loading && movements.length === 0 && !error && (
          <p className="text-center text-gray-500">
            No hay movimientos para la fecha seleccionada.
          </p>
        )}

        {movements.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              🧾 Detalle de Movimientos
            </h3>
            <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-blue-800 uppercase">
                      Cliente
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-blue-800 uppercase">
                      Cuenta
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-blue-800 uppercase">
                      Tipo
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-blue-800 uppercase">
                      Moneda
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-blue-800 uppercase">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movements.map((move, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-base text-gray-900">
                        {move.client_name}
                      </td>
                      <td className="py-3 px-4 text-base text-gray-600">
                        {move.account_number}
                      </td>
                      <td className="py-3 px-4 text-base text-gray-600">
                        {move.transaction_type}
                      </td>
                      <td className="py-3 px-4 text-base text-gray-600">
                        {move.currency}
                      </td>
                      <td className="py-3 px-4 text-base text-right font-bold text-green-700">
                        {parseFloat(move.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-100 to-white border border-blue-200 p-6 rounded-xl text-center shadow-inner">
          <h3 className="text-2xl font-bold text-blue-800 mb-3">
            💰 Total Recaudado
          </h3>
          <p className="text-4xl font-extrabold text-blue-700 mb-2">
            S/. {Number(totalRecaudadoSoles).toFixed(2)}
          </p>
          <p className="text-lg text-gray-600">
            USD {Number(totalRecaudadoUSD).toFixed(2)}
          </p>
        </div>

        <button
          onClick={onGoBack}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition shadow hover:shadow-md"
          disabled={loading}
        >
          ← Volver
        </button>
      </div>
    </div>
  )
}

export default MovementDetailScreen
