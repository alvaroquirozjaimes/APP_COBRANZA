import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../config/api.jsx';

const LoginScreen = ({ onLoginSuccess, onGoToForgotPassword, onGoToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Inicio de sesión exitoso 🎉', {
          position: 'top-right',
          autoClose: 1000,
        });

        setTimeout(() => {
          onLoginSuccess(data.token);
        }, 1500);
      } else {
        setError(data.message || 'Error al iniciar sesión.');
      }
    } catch (err) {
      console.error('Error de red o servidor:', err);
      setError('No se pudo conectar con el servidor. Intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <ToastContainer />
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Texto superior */}
        <p className="text-sm text-gray-500 mb-6 text-center">
          Cooperativa San Francisco de Huanuco
        </p>

        {/* Logo de círculos de colores */}
        <div className="relative w-24 h-24 mb-6">
          {/* Círculo rojo grande */}
          <span className="absolute w-12 h-12 rounded-full bg-red-500 top-0 right-2 shadow-sm" />
          {/* Círculo verde */}
          <span className="absolute w-8 h-8 rounded-full bg-green-400 bottom-5 left-0 shadow-sm" />
          {/* Círculo amarillo */}
          <span className="absolute w-5 h-5 rounded-full bg-yellow-400 bottom-0 right-4 shadow-sm" />
        </div>

        {/* Texto "Ingresa a la cobranza móvil" */}
        <p className="text-gray-500 mb-8 text-center">
          Ingresa a la cobranza móvil
        </p>

        {/* Tarjeta de login */}
        <div className="w-full bg-white border border-gray-300 rounded-2xl shadow-sm px-6 py-8">
          {/* Campo usuario */}
          <div className="mb-6">
            <input
              type="text"
              id="username"
              className="w-full border-b border-gray-300 py-2 text-gray-800 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Campo contraseña */}
          <div className="mb-6">
            <input
              type="password"
              id="password"
              className="w-full border-b border-gray-300 py-2 text-gray-800 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400"
              placeholder="Ingrese su clave"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs mb-4 font-medium text-center">
              {error}
            </p>
          )}

          {/* Botón INGRESAR */}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-md text-sm font-semibold shadow-md hover:bg-blue-700 transition flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'INGRESAR'
            )}
          </button>
        </div>

        {/* Texto inferior tipo screenshot */}
        <p className="mt-6 text-xs text-center text-indigo-500">
          ¿Olvidaste tu clave o aún no tienes una?{' '}
          <button
            onClick={onGoToForgotPassword}
            className="font-semibold underline focus:outline-none"
          >
            Presiona aquí!
          </button>
        </p>

        {/* Extra: acceso directo a registro (mantiene tu funcionalidad) */}
        <p className="mt-2 text-[11px] text-center text-gray-500">
          Si eres nuevo cobrador{' '}
          <button
            onClick={onGoToRegister}
            className="font-semibold text-blue-600 hover:underline focus:outline-none"
          >
            regístrate aquí.
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
