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
  const [warningMessage, setWarningMessage] = useState("") // Mensajes de advertencia (por ahora casi no lo usamos)
  const [selectedZoneName, setSelectedZoneName] = useState("CAYHUAYNA") // Zona actual

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
      // Pantalla inicial DESPUÉS de login: Mis Zonas de Cobranza
      setCurrentPage("collectionZoneDetail")
    }
  }, [authToken])

  // Guardar token luego de login exitoso
  const handleLoginSuccess = (token) => {
    setAuthToken(token)
    localStorage.setItem("authToken", token)
    setLoggedIn(true)
    // Pantalla inicial: Mis Zonas de Cobranza
    setCurrentPage("collectionZoneDetail")
  }

  // Cerrar sesión
  const handleLogout = () => {
    setAuthToken(null)
    localStorage.removeItem("authToken")
    setLoggedIn(false)
    setCurrentPage("login")
    setWarningMessage("")
    setSelectedPartner(null)
  }

  // Cuando se selecciona un socio, guardar y redirigir a pantalla de depósito
  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner)
    setWarningMessage("")
    setCurrentPage("deposit")
  }

  // Acción para regresar usando la flecha superior
  const handleGoBack = () => {
    switch (currentPage) {
      case "collectionZoneDetail":
        // Volver desde Mis Zonas de Cobranza → cerrar sesión (como en muchas apps antiguas)
        handleLogout()
        break
      case "searchPartner":
        // Desde Buscar socios → volver a Mis Zonas de Cobranza
        setCurrentPage("collectionZoneDetail")
        break
      case "movementDetail":
        // Desde Recaudados del día → volver a Mis Zonas de Cobranza
        setCurrentPage("collectionZoneDetail")
        break
      case "deposit":
        // Desde Recaudar socio → volver a Buscar socios
        setCurrentPage("searchPartner")
        break
      case "forgotPassword":
      case "register":
        setCurrentPage("login")
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

  // Navegación de la barra inferior
  const handleNavHome = () => {
    setWarningMessage("")
    setCurrentPage("collectionZoneDetail")
  }

  const handleNavRecaudacion = () => {
    setWarningMessage("")
    setCurrentPage("movementDetail")
  }

  // Cuando desde Mis Zonas se hace clic en la flechita para ir a Buscar Socios
  const handleGoToSearchFromZone = (zoneName) => {
    if (zoneName) setSelectedZoneName(zoneName)
    setCurrentPage("searchPartner")
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
    // Si está logueado, mostramos SOLO la pantalla actual tipo app móvil
    switch (currentPage) {
      case "collectionZoneDetail":
        content = (
          <CollectionZoneDetailScreen
            onGoBack={handleGoBack}
            authToken={authToken}
            authenticatedFetch={authenticatedFetch}
            onGoToSearchPartner={handleGoToSearchFromZone}
            onNavHome={handleNavHome}
            onNavRecaudacion={handleNavRecaudacion}
            onNavLogout={handleLogout}
            currentPage={currentPage}
          />
        )
        break
      case "searchPartner":
        content = (
          <SearchPartnerScreen
            onSelectPartner={handleSelectPartner}
            onGoBack={handleGoBack}
            authToken={authToken}
            authenticatedFetch={authenticatedFetch}
            zoneName={selectedZoneName}
            onNavHome={handleNavHome}
            onNavRecaudacion={handleNavRecaudacion}
            onNavLogout={handleLogout}
            currentPage={currentPage}
          />
        )
        break
      case "movementDetail":
        content = (
          <MovementDetailScreen
            onGoBack={handleGoBack}
            authToken={authToken}
            authenticatedFetch={authenticatedFetch}
            onNavHome={handleNavHome}
            onNavRecaudacion={handleNavRecaudacion}
            onNavLogout={handleLogout}
            currentPage={currentPage}
          />
        )
        break
      case "deposit":
        content = (
          <DepositScreen
            selectedPartner={selectedPartner}
            onGoBack={handleGoBack}
            authToken={authToken}
            authenticatedFetch={authenticatedFetch}
            onNavHome={handleNavHome}
            onNavRecaudacion={handleNavRecaudacion}
            onNavLogout={handleLogout}
            currentPage={currentPage}
          />
        )
        break
      default:
        content = (
          <CollectionZoneDetailScreen
            onGoBack={handleGoBack}
            authToken={authToken}
            authenticatedFetch={authenticatedFetch}
            onGoToSearchPartner={handleGoToSearchFromZone}
            onNavHome={handleNavHome}
            onNavRecaudacion={handleNavRecaudacion}
            onNavLogout={handleLogout}
            currentPage={"collectionZoneDetail"}
          />
        )
    }
  }

  // Devolver el contenido general de la aplicación
  return <div className="App font-inter">{content}</div>
}

export default App
