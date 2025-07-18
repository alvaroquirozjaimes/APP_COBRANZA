import React, { useState, useEffect } from "react"
// Importamos todos los componentes que representan las pantallas de la app
import LoginScreen from "./components/LoginScreen"
import ForgotPasswordScreen from "./components/ForgotPasswordScreen"
import RegisterScreen from "./components/RegisterScreen"
import SearchPartnerScreen from "./components/SearchPartnerScreen"
import MovementDetailScreen from "./components/MovementDetailScreen"
import CollectionZoneDetailScreen from "./components/CollectionZoneDetailScreen"
import DepositScreen from "./components/DepositScreen"

const App = () => {
  // Estados para controlar sesión, navegación y mensajes
  const [loggedIn, setLoggedIn] = useState(false) // Si el usuario está logueado
  const [currentPage, setCurrentPage] = useState("login") // Página actual
  const [selectedPartner, setSelectedPartner] = useState(null) // Socio seleccionado
  const [authToken, setAuthToken] = useState(
    localStorage.getItem("authToken") || null
  ) // Token guardado localmente
  const [warningMessage, setWarningMessage] = useState("") // Mensajes de advertencia para mostrar al usuario

  // Manejo cuando el token ha expirado o es inválido
  const handleTokenExpired = () => {
    console.log("Token expirado o inválido. Redirigiendo al login.")
    setAuthToken(null)
    localStorage.removeItem("authToken")
    setLoggedIn(false)
    setCurrentPage("login")
  }

  // Efecto para cambiar estado si hay token válido al iniciar
  useEffect(() => {
    if (authToken) {
      setLoggedIn(true)
      setCurrentPage("searchPartner") // Página por defecto después de login
    }
  }, [authToken])

  // Guardar token luego de login exitoso
  const handleLoginSuccess = (token) => {
    setAuthToken(token)
    localStorage.setItem("authToken", token)
    setLoggedIn(true)
    setCurrentPage("searchPartner")
  }

  // Cerrar sesión
  const handleLogout = () => {
    setAuthToken(null)
    localStorage.removeItem("authToken")
    setLoggedIn(false)
    setCurrentPage("login")
    setWarningMessage("")
  }

  // Cuando se selecciona un socio, guardar y redirigir a pantalla de depósito
  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner)
    setWarningMessage("")
    setCurrentPage("deposit")
  }

  // Acción para regresar desde diferentes pantallas
  const handleGoBack = () => {
    switch (currentPage) {
      case "searchPartner":
        handleLogout()
        break
      case "movementDetail":
      case "collectionZoneDetail":
      case "deposit":
      case "forgotPassword":
      case "register":
        setCurrentPage("searchPartner") // Era a loguin
        break
      default:
        handleLogout()
    }
  }

  // Función para hacer peticiones con token en el header
  const authenticatedFetch = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.status === 401) {
        handleTokenExpired() // Redirigir si token no sirve
        throw new Error(
          "Token expirado o no autorizado. Por favor, vuelva a iniciar sesión."
        )
      }

      return response
    } catch (error) {
      console.error("Error en fetch autenticado:", error)
      throw error
    }
  }

  // Renderizar contenido principal según estado de sesión y página
  let content

  if (!loggedIn) {
    // Si no ha iniciado sesión, mostrar pantallas de login, registro o recuperar contraseña
    switch (currentPage) {
      case "login":
        content = (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onGoToForgotPassword={() => setCurrentPage("forgotPassword")}
            onGoToRegister={() => setCurrentPage("register")}
          />
        )
        break
      case "forgotPassword":
        content = (
          <ForgotPasswordScreen
            onGoToLogin={() => setCurrentPage("login")}
            onGoToRegister={() => setCurrentPage("register")}
          />
        )
        break
      case "register":
        content = <RegisterScreen onGoBack={handleGoBack} />
        break
      default:
        content = <p>Página no encontrada.</p>
    }
  } else {
    // Si está logueado, mostrar barra de navegación y contenido principal
    content = (
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* Barra de navegación */}
        <nav className="bg-blue-800 p-4 text-white shadow-xl flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4">
          <h2 className="text-xl font-bold mr-4 hidden sm:block">
            APP DE COBRANZA
          </h2>

          {/* Botones de navegación con estilo dinámico */}
          <button
            onClick={() => setCurrentPage("searchPartner")}
            className={`py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105
              ${
                currentPage === "searchPartner"
                  ? "bg-blue-500 shadow-md"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
          >
            Buscar Socio
          </button>

          <button
            onClick={() => setCurrentPage("movementDetail")}
            className={`py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105
              ${
                currentPage === "movementDetail"
                  ? "bg-blue-500 shadow-md"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
          >
            Detalle Movimientos
          </button>

          <button
            onClick={() => setCurrentPage("collectionZoneDetail")}
            className={`py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105
              ${
                currentPage === "collectionZoneDetail"
                  ? "bg-blue-500 shadow-md"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
          >
            Zona de Cobranza
          </button>

          <button
            onClick={() => {
              if (!selectedPartner) {
                // Si no hay socio seleccionado, advertir
                setWarningMessage(
                  "⚠️ Por favor, seleccione un socio primero para realizar un depósito."
                )
                setCurrentPage("searchPartner")
                return
              }
              setWarningMessage("")
              setCurrentPage("deposit")
            }}
            className={`py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105
              ${
                currentPage === "deposit"
                  ? "bg-blue-500 shadow-md"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
          >
            Realizar Depósito
          </button>

          {/* Botón para cerrar sesión */}
          <button
            onClick={handleLogout}
            className="py-2 px-4 rounded-full text-sm font-semibold bg-red-600 hover:bg-red-700 transition-all duration-300 ease-in-out transform hover:scale-105 ml-auto"
          >
            Cerrar Sesión
          </button>
        </nav>

        {/* Contenedor del contenido principal */}
        <div className="flex-grow p-4 sm:p-6 lg:p-8">
          {/* Mostrar mensaje de advertencia si existe */}
          {warningMessage && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-4 rounded-lg shadow-md">
              <p className="font-medium">{warningMessage}</p>
            </div>
          )}

          {/* Mostrar el componente correspondiente según la página actual */}
          {(() => {
            switch (currentPage) {
              case "searchPartner":
                return (
                  <SearchPartnerScreen
                    onSelectPartner={handleSelectPartner}
                    onGoBack={handleGoBack}
                    authToken={authToken}
                    authenticatedFetch={authenticatedFetch}
                  />
                )
              case "movementDetail":
                return (
                  <MovementDetailScreen
                    onGoBack={handleGoBack}
                    authToken={authToken}
                    authenticatedFetch={authenticatedFetch}
                  />
                )
              case "collectionZoneDetail":
                return (
                  <CollectionZoneDetailScreen
                    onGoBack={handleGoBack}
                    authToken={authToken}
                    authenticatedFetch={authenticatedFetch}
                  />
                )
              case "deposit":
                return (
                  <DepositScreen
                    selectedPartner={selectedPartner}
                    onGoBack={handleGoBack}
                    authToken={authToken}
                    authenticatedFetch={authenticatedFetch}
                  />
                )
              default:
                return (
                  <SearchPartnerScreen
                    onSelectPartner={handleSelectPartner}
                    onGoBack={handleGoBack}
                    authToken={authToken}
                    authenticatedFetch={authenticatedFetch}
                  />
                )
            }
          })()}
        </div>
      </div>
    )
  }

  // Devolver el contenido general de la aplicación
  return <div className="App font-inter">{content}</div>
}

export default App
