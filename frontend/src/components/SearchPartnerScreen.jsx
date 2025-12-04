import React, { useState, useEffect } from "react"
import { API_BASE_URL } from "../config/api.jsx"

// Componente que permite buscar socios y seleccionarlos
const SearchPartnerScreen = ({
  onSelectPartner,
  onGoBack,
  authToken,
  authenticatedFetch,
  zoneName = "CAYHUAYNA",
  onNavHome,
  onNavRecaudacion,
  onNavLogout,
  currentPage,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPartners = async () => {
      if (!authToken) {
        setError("No autorizado. Por favor, inicie sesión.")
        return
      }

      setLoading(true)
      setError("")
      setPartners([])

      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/partners?search=${searchTerm}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

        const data = await response.json()
        if (response.ok) {
          setPartners(data)
        } else {
          setError(data.message || "Error al cargar socios.")
        }
      } catch (err) {
        console.error("Error al obtener socios:", err)
        setError("No se pudo conectar con el servidor.")
      } finally {
        setLoading(false)
      }
    }

    if (authToken) {
      fetchPartners()
    }
  }, [searchTerm, authToken, authenticatedFetch])

  const isInicioActive = ["collectionZoneDetail", "searchPartner", "deposit"].includes(
    currentPage
  )
  const isRecaudacionActive = currentPage === "movementDetail"

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center">
      {/* Contenedor tipo móvil */}
      <div className="w-full max-w-md bg-gray-200 flex flex-col shadow-lg animate-fade-in">
        {/* HEADER AZUL */}
        <header className="bg-blue-600 text-white px-3 py-3 flex items-center">
          <button
            onClick={onGoBack}
            className="p-1 mr-2 active:opacity-70"
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
            <p className="text-xs font-semibold tracking-wide">
              {zoneName}
            </p>
            <p className="text-[11px]">Mis Socios por Zona</p>
          </div>

          <div className="w-5" />
        </header>

        {/* BARRA DE BÚSQUEDA */}
        <div className="px-3 pt-3 pb-2 bg-gray-200">
          <div className="bg-white rounded-md flex items-center px-3 py-2 shadow-sm border border-gray-300">
            <svg
              className="w-4 h-4 text-gray-500 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-5.2-5.2M16.8 10.6a6.2 6.2 0 11-12.4 0 6.2 6.2 0 0112.4 0z" />
            </svg>

            <input
              type="text"
              className="flex-1 text-[13px] outline-none placeholder-gray-400 bg-transparent"
              placeholder="Buscar mis socios por zona"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />

            {searchTerm !== "" && (
              <button
                onClick={() => setSearchTerm("")}
                className="ml-2 text-gray-500 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* CONTENIDO (LISTA) */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {loading && (
            <div className="flex items-center justify-center text-blue-700 text-sm mt-4">
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z"
                />
              </svg>
              Buscando socios...
            </div>
          )}

          {error && !loading && (
            <p className="text-center text-red-600 text-xs mt-4">{error}</p>
          )}

          {!loading && !error && partners.length === 0 && (
            <p className="text-center text-gray-500 text-xs mt-4">
              No se encontraron socios. Intenta otro término.
            </p>
          )}

          {partners.length > 0 && (
            <div className="mt-2 space-y-2">
              {partners.map((partner) => (
                <button
                  key={partner.id}
                  onClick={() => onSelectPartner(partner)}
                  className="w-full bg-gray-300 text-gray-900 flex items-center justify-between px-3 py-3 rounded-sm border border-gray-300 active:bg-gray-400"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">+</span>
                    <span className="text-[13px] font-medium uppercase tracking-tight text-left leading-snug">
                      {partner.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold">{">"}</span>
                </button>
              ))}
            </div>
          )}
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

export default SearchPartnerScreen
