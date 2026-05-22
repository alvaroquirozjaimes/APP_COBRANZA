import React, { useCallback, useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';

import LoginScreen from './components/LoginScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import RegisterScreen from './components/RegisterScreen';
import SearchPartnerScreen from './components/SearchPartnerScreen';
import MovementDetailScreen from './components/MovementDetailScreen';
import CollectionZoneDetailScreen from './components/CollectionZoneDetailScreen';
import DepositScreen from './components/DepositScreen';
import { getStoredToken, removeStoredToken, setStoredToken } from './utils/authStorage';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [authToken, setAuthToken] = useState(getStoredToken());
  const [selectedZoneName, setSelectedZoneName] = useState('CAYHUAYNA');

  const handleTokenExpired = useCallback(() => {
    Sentry.captureMessage('Token expirado o inválido');
    setAuthToken(null);
    removeStoredToken();
    setLoggedIn(false);
    setSelectedPartner(null);
    setCurrentPage('login');
  }, []);

  useEffect(() => {
    if (authToken) {
      setLoggedIn(true);
      setCurrentPage((previousPage) => (previousPage === 'login' ? 'collectionZoneDetail' : previousPage));
      Sentry.setUser(null);
    } else {
      Sentry.setUser(null);
    }
  }, [authToken]);

  const handleLoginSuccess = useCallback((token) => {
    setAuthToken(token);
    setStoredToken(token);
    setLoggedIn(true);
    setCurrentPage('collectionZoneDetail');
  }, []);

  const handleLogout = useCallback(() => {
    Sentry.setUser(null);
    setAuthToken(null);
    removeStoredToken();
    setLoggedIn(false);
    setSelectedPartner(null);
    setCurrentPage('login');
  }, []);

  const handleSelectPartner = useCallback((partner) => {
    setSelectedPartner(partner);
    setCurrentPage('deposit');
  }, []);

  const handleNavHome = useCallback(() => {
    setCurrentPage('collectionZoneDetail');
  }, []);

  const handleNavRecaudacion = useCallback(() => {
    setCurrentPage('movementDetail');
  }, []);

  const handleGoBack = useCallback(() => {
    switch (currentPage) {
      case 'collectionZoneDetail':
        handleLogout();
        break;
      case 'searchPartner':
      case 'movementDetail':
        setCurrentPage('collectionZoneDetail');
        break;
      case 'deposit':
        setCurrentPage('searchPartner');
        break;
      case 'forgotPassword':
      case 'register':
        setCurrentPage('login');
        break;
      default:
        handleLogout();
    }
  }, [currentPage, handleLogout]);

  const authenticatedFetch = useCallback(async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...options.headers,
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 401) {
        handleTokenExpired();
        throw new Error('Token expirado o no autorizado');
      }

      return response;
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }, [authToken, handleTokenExpired]);

  const handleGoToSearchFromZone = useCallback((zoneName) => {
    if (zoneName) setSelectedZoneName(zoneName);
    setCurrentPage('searchPartner');
  }, []);

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
        content = <RegisterScreen onGoBack={handleGoBack} />;
        break;
      default:
        content = <p>Página no encontrada.</p>;
    }
  } else {
    switch (currentPage) {
      case 'collectionZoneDetail':
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
        );
        break;
      case 'searchPartner':
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
        );
        break;
      case 'movementDetail':
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
        );
        break;
      case 'deposit':
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
        );
        break;
      default:
        content = <p>Página no encontrada.</p>;
    }
  }

  return (
    <div className="App font-inter">
      {import.meta.env.DEV && (
        <button
          type="button"
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9999,
            padding: '10px 14px',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
          onClick={() => {
            throw new Error('ERROR DE PRUEBA SENTRY - FRONTEND COBRANZA');
          }}
        >
          Probar Sentry
        </button>
      )}

      {content}
    </div>
  );
};

const AppWithErrorBoundary = Sentry.withErrorBoundary(App, {
  fallback: <h2>⚠️ Ocurrió un error inesperado</h2>,
});

export default AppWithErrorBoundary;
