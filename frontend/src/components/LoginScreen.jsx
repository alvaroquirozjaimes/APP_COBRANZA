import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// URL base de tu backend. Asegúrate de que coincida con el puerto de tu servidor Express.
// CAMBIO CLAVE: Añadir '/cobranza' a la URL base de la API para autenticación de Cobranza.
const API_BASE_URL = 'http://localhost:5000/api/cobranza'; // <--- MODIFICADO AQUÍ

const LoginScreen = ({ onLoginSuccess, onGoToForgotPassword, onGoToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // La URL ahora es correcta con el cambio en API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/auth/login`, { // <--- RUTA DE ACCESO ACTUALIZADA
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
          autoClose: 2000,
        });

        setTimeout(() => {
          onLoginSuccess(data.token); // Pasar token al componente App
        }, 2000);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <ToastContainer />
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
        {/* Logo o imagen de la cooperativa */}
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-700 shadow-lg text-white font-bold text-4xl transform rotate-6 hover:rotate-0 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9.75h19.5M2.25 11.25h19.5M2.25 12.75h19.5M2.25 14.25h19.5M2.25 15.75h19.5M2.25 17.25h19.5M2.25 18.75h19.5M2.25 20.25h19.5M2.25 3.75h19.5M2.25 5.25h19.5M2.25 6.75h19.5M2.25 2.25h19.5M2.25 21.75h19.5" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">APP DE COBRANZA</h1>

        <div className="mb-6 text-left">
          <label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2">Usuario</label>
          <input
            type="text"
            id="username"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Ingrese su usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="mb-8 text-left">
          <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Clave</label>
          <input
            type="password"
            id="password"
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Ingrese su clave"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && <p className="text-red-600 text-sm mb-6 font-medium text-center">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-900 transition duration-300 ease-in-out font-bold text-lg shadow-lg transform hover:-translate-y-1 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'INGRESAR'
          )}
        </button>

        <div className="mt-8 text-sm text-center">
          <p className="text-gray-600 mb-2">
            ¿Olvidaste tu clave?{' '}
            <button onClick={onGoToForgotPassword} className="text-blue-600 hover:underline font-semibold focus:outline-none">
              Recupérala aquí
            </button>
          </p>
          <p className="text-gray-600">
            ¿Aún no tienes una cuenta?{' '}
            <button onClick={onGoToRegister} className="text-blue-600 hover:underline font-semibold focus:outline-none">
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;