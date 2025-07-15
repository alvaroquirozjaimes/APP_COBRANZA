import React, { useState, useRef, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api/cobranza';

const RegisterScreen = ({ onGoBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const usernameInputRef = useRef(null);

  useEffect(() => {
    usernameInputRef.current?.focus();
  }, []);

  const handleRegister = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!username || !password) {
      setError('El usuario y la contraseña son obligatorios.');
      setLoading(false);
      return;
    }

    if (!/^\d{9}$/.test(phoneNumber)) {
      setError('Ingrese un número de celular válido (9 dígitos).');
      setLoading(false);
      return;
    }

    // ELIMINADA: const role = 'cobrador'; // Ya no se define aquí, el backend lo asigna.

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // CAMBIO: 'role' ELIMINADO del body de la solicitud
        body: JSON.stringify({ username, password, phone_number: phoneNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Registro exitoso. Ahora puedes iniciar sesión.');
        setUsername('');
        setPassword('');
        setPhoneNumber('');
      } else {
        setError(data.message || 'Error en el registro.');
      }
    } catch (err) {
      console.error('Error al conectar con el backend para registrar:', err);
      setError('No se pudo conectar con el servidor. Inténtelo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const closeMessage = () => {
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 via-indigo-900 to-purple-900 px-4">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-900">Registro de Usuario</h2>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm">
            <strong>✔️ {successMessage}</strong>
            <button onClick={closeMessage} className="absolute top-1 right-2 text-xl text-green-800 hover:text-green-900">&times;</button>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
            <strong>❌ {error}</strong>
            <button onClick={closeMessage} className="absolute top-1 right-2 text-xl text-red-800 hover:text-red-900">&times;</button>
          </div>
        )}

        {/* Usuario */}
        <div>
          <label htmlFor="regUsername" className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <div className="relative">
            <input
              type="text"
              id="regUsername"
              ref={usernameInputRef}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i className="fas fa-user" />
            </div>
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="regPassword" className="block text-sm font-medium text-gray-700 mb-1">Clave</label>
          <div className="relative">
            <input
              type="password"
              id="regPassword"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder="Ingrese una clave segura"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i className="fas fa-lock" />
            </div>
          </div>
        </div>

        {/* Celular */}
        <div>
          <label htmlFor="regPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Número de Celular</label>
          <div className="relative">
            <input
              type="text"
              id="regPhoneNumber"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder="999999999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i className="fas fa-phone" />
            </div>
          </div>
        </div>

        {/* Botón de registro */}
        <button
          onClick={handleRegister}
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-3 rounded-xl transition duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg"
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'REGISTRARSE'
          )}
        </button>

        {/* Botón volver */}
        <button
          onClick={onGoBack}
          className="w-full text-indigo-700 hover:underline font-semibold text-sm mt-2"
          disabled={loading}
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default RegisterScreen;