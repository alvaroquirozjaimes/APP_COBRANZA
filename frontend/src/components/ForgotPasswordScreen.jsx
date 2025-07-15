import React, { useState } from 'react';

// URL base de tu backend. Asegúrate de que coincida con el puerto de tu servidor Express.
// CAMBIO CLAVE: Añadir '/cobranza' a la URL base de la API para autenticación de Cobranza.
const API_BASE_URL = 'http://localhost:5000/api/cobranza'; // <--- MODIFICADO AQUÍ

const ForgotPasswordScreen = ({ onGoToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      // La URL ahora es correcta con el cambio en API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, { // <--- RUTA DE ACCESO ACTUALIZADA
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Se han enviado instrucciones a su correo electrónico.');
        setEmail('');
      } else {
        setError(data.message || 'Error al solicitar el restablecimiento de clave.');
      }
    } catch (err) {
      console.error('Error de red o servidor:', err);
      setError('No se pudo conectar con el servidor. Intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 via-indigo-900 to-purple-900 px-4">
      <div className="bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¿Olvidaste tu clave?</h1>
          <p className="text-gray-600 text-sm">
            Ingresa tu correo electrónico para enviarte las instrucciones.
          </p>
        </div>

        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <div className="relative">
            <input
              type="email"
              id="reset-email"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 placeholder-gray-400 text-gray-900"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 12H8m8 0a4 4 0 01-8 0m8 0a4 4 0 00-8 0M2 12a10 10 0 1120 0 10 10 0 01-20 0z" />
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856C18.07 20 19 18.97 19 17.5V6.5C19 5.03 18.07 4 16.918 4H7.082C5.93 4 5 5.03 5 6.5v11c0 1.47.93 2.5 2.062 2.5z" />
            </svg>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="text-green-600 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}

        <button
          onClick={handleResetPassword}
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-3 rounded-xl transition duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg"
          disabled={loading || !email}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'Enviar Instrucciones'
          )}
        </button>

        <button
          onClick={onGoToLogin}
          className="w-full mt-4 text-indigo-700 hover:underline font-semibold text-sm"
        >
          ← Volver al Inicio de Sesión
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;