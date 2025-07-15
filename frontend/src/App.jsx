import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import RegisterScreen from './components/RegisterScreen';
import SearchPartnerScreen from './components/SearchPartnerScreen';
import MovementDetailScreen from './components/MovementDetailScreen';
import CollectionZoneDetailScreen from './components/CollectionZoneDetailScreen';
import DepositScreen from './components/DepositScreen';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [warningMessage, setWarningMessage] = useState(''); // ⚠️ Nuevo estado para mensajes

  const handleTokenExpired = () => {
    console.log('Token expirado o inválido. Redirigiendo al login.');
    setAuthToken(null);
    localStorage.removeItem('authToken');
    setLoggedIn(false);
    setCurrentPage('login');
  };

  useEffect(() => {
    if (authToken) {
      setLoggedIn(true);
      setCurrentPage('searchPartner');
    }
  }, [authToken]);

  const handleLoginSuccess = (token) => {
    setAuthToken(token);
    localStorage.setItem('authToken', token);
    setLoggedIn(true);
    setCurrentPage('searchPartner');
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('authToken');
    setLoggedIn(false);
    setCurrentPage('login');
    setWarningMessage(''); // Limpiar mensaje al cerrar sesión
  };

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner);
    setWarningMessage(''); // Limpiar mensaje al seleccionar socio
    setCurrentPage('deposit');
  };

  const handleGoBack = () => {
    switch (currentPage) {
      case 'searchPartner':
        handleLogout();
        break;
      case 'movementDetail':
      case 'collectionZoneDetail':
      case 'deposit':
      case 'forgotPassword':
      case 'register':
        setCurrentPage('login');
        break;
      default:
        handleLogout();
    }
  };

  const authenticatedFetch = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status === 401) {
        handleTokenExpired();
        throw new Error('Token expirado o no autorizado. Por favor, vuelva a iniciar sesión.');
      }

      return response;
    } catch (error) {
      console.error('Error en fetch autenticado:', error);
      throw error;
    }
  };

  let content;

  if (!loggedIn) {
    switch (currentPage) {
      case 'login':
        content = (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onGoToForgotPassword={() => setCurrentPage('forgotPassword')}
            onGoToRegister={() => setCurrentPage('register')}
          />
        );
        break;
      case 'forgotPassword':
        content = (
          <ForgotPasswordScreen
            onGoToLogin={() => setCurrentPage('login')}
            onGoToRegister={() => setCurrentPage('register')}
          />
        );
        break;
      case 'register':
        content = (
          <RegisterScreen
            onGoBack={handleGoBack}
          />
        );
        break;
      default:
        content = <p>Página no encontrada.</p>;
    }
  } else {
    content = (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <nav className="bg-blue-800 p-4 text-white shadow-xl flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4">
          <h2 className="text-xl font-bold mr-4 hidden sm:block">APP DE COBRANZA</h2>
          <button
            onClick={() => setCurrentPage('searchPartner')}
            className={`py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105
              ${currentPage === 'searchPartner' ? 'bg-blue-500 shadow-md' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            Buscar Socio
          </button>
          <button
            onClick={() => setCurrentPage('movementDetail')}
            className={`py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105
              ${currentPage === 'movementDetail' ? 'bg-blue-500 shadow-md' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            Detalle Movimientos
          </button>
          <button
            onClick={() => setCurrentPage('collectionZoneDetail')}
            className={`py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105
              ${currentPage === 'collectionZoneDetail' ? 'bg-blue-500 shadow-md' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            Zona de Cobranza
          </button>
          <button
            onClick={() => {
              if (!selectedPartner) {
                setWarningMessage('⚠️ Por favor, seleccione un socio primero para realizar un depósito.');
                setCurrentPage('searchPartner');
                return;
              }
              setWarningMessage('');
              setCurrentPage('deposit');
            }}
            className={`py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105
              ${currentPage === 'deposit' ? 'bg-blue-500 shadow-md' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            Realizar Depósito
          </button>
          <button
            onClick={handleLogout}
            className="py-2 px-4 rounded-full text-sm font-semibold bg-red-600 hover:bg-red-700 transition-all duration-300 ease-in-out transform hover:scale-105 ml-auto"
          >
            Cerrar Sesión
          </button>
        </nav>

        <div className="flex-grow p-4 sm:p-6 lg:p-8">
          {/* 🔔 MOSTRAR MENSAJE DE ADVERTENCIA SI EXISTE */}
          {warningMessage && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-4 rounded-lg shadow-md">
              <p className="font-medium">{warningMessage}</p>
            </div>
          )}

          {/* CONTENIDO PRINCIPAL */}
          {(() => {
            switch (currentPage) {
              case 'searchPartner':
                return <SearchPartnerScreen onSelectPartner={handleSelectPartner} onGoBack={handleGoBack} authToken={authToken} authenticatedFetch={authenticatedFetch} />;
              case 'movementDetail':
                return <MovementDetailScreen onGoBack={handleGoBack} authToken={authToken} authenticatedFetch={authenticatedFetch} />;
              case 'collectionZoneDetail':
                return <CollectionZoneDetailScreen onGoBack={handleGoBack} authToken={authToken} authenticatedFetch={authenticatedFetch} />;
              case 'deposit':
                return <DepositScreen selectedPartner={selectedPartner} onGoBack={handleGoBack} authToken={authToken} authenticatedFetch={authenticatedFetch} />;
              default:
                return <SearchPartnerScreen onSelectPartner={handleSelectPartner} onGoBack={handleGoBack} authToken={authToken} authenticatedFetch={authenticatedFetch} />;
            }
          })()}
        </div>
      </div>
    );
  }

  return (
    <div className="App font-inter">
      {content}
    </div>
  );
};

export default App;
