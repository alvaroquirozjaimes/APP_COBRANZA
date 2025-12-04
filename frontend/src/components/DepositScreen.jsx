import React, { useState, useEffect } from "react"
import { API_BASE_URL } from "../config/api.jsx"

const DepositScreen = ({
  selectedPartner,
  onGoBack,
  authToken,
  authenticatedFetch,
  collectorName = "DMCA",
  onNavHome,
  onNavRecaudacion,
  onNavLogout,
  currentPage,
}) => {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchPartnerAccounts = async () => {
      if (!selectedPartner?.id || !authToken) {
        setError("No se ha seleccionado un socio o no está autorizado.")
        setLoading(false)
        setAccounts([])
        return
      }

      setLoading(true)
      setError("")
      setSuccessMessage("")
      setAccounts([])

      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/partners/${selectedPartner.id}/accounts`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

        const data = await response.json()

        if (response.ok) {
          setAccounts(data)
          if (data.length > 0) {
            setSelectedAccount(data[0].id)
          } else {
            setError("No se encontraron cuentas para este socio.")
          }
        } else {
          setError(data.message || "Error al cargar las cuentas del socio.")
        }
      } catch (err) {
        console.error("Error al obtener cuentas del socio:", err)
        setError(
          err.message ||
            "No se pudo conectar con el servidor para obtener las cuentas."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchPartnerAccounts()
  }, [selectedPartner, authToken, authenticatedFetch])

  const handleDeposit = async () => {
    setError("")
    setSuccessMessage("")
    setLoading(true)

    if (!selectedAccount || !amount || parseFloat(amount) <= 0) {
      setError("Ingrese un monto válido y seleccione una cuenta.")
      setLoading(false)
      return
    }
    if (!selectedPartner || !selectedPartner.id) {
      setError("No se ha seleccionado un socio válido para el depósito.")
      setLoading(false)
      return
    }

    const accountObject = accounts.find((acc) => acc.id === selectedAccount)
    if (!accountObject || !accountObject.id || !accountObject.currency) {
      setError(
        "Cuenta seleccionada no válida o falta la información de la moneda."
      )
      setLoading(false)
      return
    }

    const depositData = {
      userCliId: selectedPartner.id,
      accountId: accountObject.id,
      amount: parseFloat(amount),
      transactionType: "deposit",
      currency: accountObject.currency,
    }

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/deposits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(depositData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(data.message || "Depósito exitoso.")
        setAmount("")
      } else {
        setError(data.message || "Error al realizar el depósito.")
      }
    } catch (err) {
      console.error("Depósito error:", err)
      setError(err.message || "No se pudo conectar al servidor.")
    } finally {
      setLoading(false)
    }
  }

  const selectedAccountObject =
    accounts.find((acc) => acc.id === selectedAccount) || null

  const parsedAmount = parseFloat(amount) || 0
  const totalPen =
    selectedAccountObject?.currency === "PEN" ? parsedAmount : 0
  const totalUsd =
    selectedAccountObject?.currency === "USD" ? parsedAmount : 0

  const isInicioActive = ["collectionZoneDetail", "searchPartner", "deposit"].includes(
    currentPage
  )
  const isRecaudacionActive = currentPage === "movementDetail"

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center">
      {/* Contenedor tipo móvil */}
      <div className="w-full max-w-md bg-gray-200 flex flex-col shadow-lg">
        {/* HEADER AZUL */}
        <header className="bg-blue-600 text-white px-3 py-3 flex items-center">
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
            <p className="text-[11px] font-semibold truncate">
              Recaudación:{" "}
              {selectedPartner ? selectedPartner.name : "Sin socio"}
            </p>
            <p className="text-[11px]">Cobrador - {collectorName}</p>
          </div>

          <div className="w-5" />
        </header>

        {/* CUERPO */}
        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3">
          {loading && (
            <div className="flex justify-center mb-2 text-blue-700 text-xs">
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
              Cargando cuentas...
            </div>
          )}

          {error && (
            <p className="text-red-600 text-xs mb-2 text-center font-medium">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-green-600 text-xs mb-2 text-center font-medium">
              {successMessage}
            </p>
          )}

          {/* LISTA DE CUENTAS */}
          <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
            {accounts.length === 0 && !loading ? (
              <div className="px-3 py-4 text-center text-xs text-gray-500">
                No hay cuentas para este socio.
              </div>
            ) : (
              accounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`px-3 py-3 flex items-center justify-between border-b border-gray-200 ${
                    selectedAccount === acc.id ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-[12px] text-gray-900">
                      {acc.account_type || "Cuenta"}
                    </span>
                    <span className="text-[11px] text-gray-600">
                      {acc.account_number}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAccount(acc.id)
                    }}
                    className="text-[11px] text-blue-600 underline font-medium"
                    disabled={loading}
                  >
                    Ingrese cobro
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Monto para la cuenta seleccionada */}
          {selectedAccountObject && (
            <div className="mt-4 bg-white border border-gray-300 rounded-md px-3 py-3">
              <p className="text-[11px] text-gray-700 mb-1">
                Cuenta seleccionada:
              </p>
              <p className="text-[11px] text-gray-900 mb-2">
                {selectedAccountObject.account_type} -{" "}
                {selectedAccountObject.account_number} (
                {selectedAccountObject.currency})
              </p>

              <label
                htmlFor="amount"
                className="block text-[11px] text-gray-700 mb-1"
              >
                Monto a cobrar:
              </label>
              <input
                type="number"
                id="amount"
                className="w-full border-b border-gray-400 text-[13px] py-1 focus:outline-none focus:border-blue-500"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* TARJETA DE TOTALES */}
        <div className="px-3 pb-2">
          <div className="bg-white border border-gray-300 rounded-md px-3 py-2 text-[11px] text-gray-900 text-center">
            <p className="font-semibold">
              TOTAL A RECAUDAR S/. {totalPen.toFixed(2)}
            </p>
            <p className="font-semibold mt-1">
              TOTAL A RECAUDAR USD {totalUsd.toFixed(2)}
            </p>
          </div>
        </div>

        {/* BOTÓN RECAUDAR */}
        <div className="px-3 pb-4">
          <button
            onClick={handleDeposit}
            className="w-full bg-blue-600 text-white py-3 rounded-md text-sm font-semibold shadow-md active:bg-blue-700 flex justify-center items-center"
            disabled={
              loading || !selectedAccount || parseFloat(amount) <= 0
            }
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
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
            ) : (
              "RECAUDAR"
            )}
          </button>
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

export default DepositScreen
