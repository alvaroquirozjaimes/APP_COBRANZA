import React, { useState, useEffect } from 'react';

// URL base de tu backend. Asegúrate de que coincida con el puerto de tu servidor Express.
const API_BASE_URL = 'http://localhost:5000/api/cobranza'; // Asegúrate de que esta URL sea la correcta

const DepositScreen = ({ selectedPartner, onGoBack, authToken, authenticatedFetch }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPartnerAccounts = async () => {
      if (!selectedPartner?.id || !authToken) {
        setError('No se ha seleccionado un socio o no está autorizado.');
        setLoading(false);
        setAccounts([]);
        return;
      }

      setLoading(true);
      setError('');
      setSuccessMessage('');
      setAccounts([]);

      try {
        const response = await authenticatedFetch(`${API_BASE_URL}/partners/${selectedPartner.id}/accounts`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setAccounts(data);
          if (data.length > 0) {
            setSelectedAccount(data[0].id); // Asegurarse de usar acc.id aquí
          } else {
            setError('No se encontraron cuentas para este socio.');
          }
        } else {
          setError(data.message || 'Error al cargar las cuentas del socio.');
        }
      } catch (err) {
        console.error('Error al obtener cuentas del socio:', err);
        setError(err.message || 'No se pudo conectar con el servidor para obtener las cuentas.');
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerAccounts();
  }, [selectedPartner, authToken, authenticatedFetch]);

  const handleDeposit = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!selectedAccount || !amount || parseFloat(amount) <= 0) {
      setError('Ingrese un monto válido y seleccione una cuenta.');
      setLoading(false);
      return;
    }
    if (!selectedPartner || !selectedPartner.id) {
        setError('No se ha seleccionado un socio válido para el depósito.');
        setLoading(false);
        return;
    }

    // Obtener el objeto completo de la cuenta seleccionada para obtener su ID y MONEDA
    const accountObject = accounts.find(acc => acc.id === selectedAccount); // Buscar por ID
    if (!accountObject || !accountObject.id || !accountObject.currency) {
      setError('Cuenta seleccionada no válida o falta la información de la moneda.');
      setLoading(false);
      return;
    }

    // ==============================================================================
    // ¡¡¡CAMBIOS CRÍTICOS AQUÍ!!!
    // Ahora, los nombres de las propiedades coinciden EXACTAMENTE con lo que tu backend espera:
    // 'userCliId', 'accountId', 'transactionType', 'currency' (todos en camelCase)
    // ==============================================================================
    const depositData = {
      userCliId: selectedPartner.id,      // CAMBIO: Ahora coincide con el backend 'userCliId'
      accountId: accountObject.id,        // Coincide con el backend 'accountId'
      amount: parseFloat(amount),
      transactionType: 'deposit',         // CAMBIO: Ahora coincide con el backend 'transactionType'. 'deposit' es un valor válido.
      currency: accountObject.currency,    // ¡AÑADIDO! Ahora incluye la moneda.
      // Opcional: Si tu backend también espera una 'description', puedes añadirla aquí:
      // description: 'Depósito de ahorro desde el frontend'
    };

    console.log("Datos enviados al backend:", depositData); // Para depuración, revisa esto en la consola del navegador

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/deposits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(depositData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Depósito exitoso.');
        setAmount('');
        // Considera recargar las cuentas aquí para actualizar el balance visible
        // fetchPartnerAccounts();
      } else {
        setError(data.message || 'Error al realizar el depósito.');
      }
    } catch (err) {
      console.error('Depósito error:', err);
      setError(err.message || 'No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        <h2 className="text-3xl font-extrabold text-center text-green-700 mb-6">💸 Recaudar Ahorros</h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Socio seleccionado:</p>
          <p className="text-lg font-semibold text-blue-800">
            {selectedPartner ? selectedPartner.name : 'Ninguno'}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center mb-4 text-blue-600 font-medium">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z" />
            </svg>
            Cargando...
          </div>
        )}

        {error && <p className="text-red-600 text-sm mb-4 text-center font-medium">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm mb-4 text-center font-medium">{successMessage}</p>}

        <div className="mb-4">
          <label htmlFor="account" className="block text-gray-700 text-sm font-medium mb-2">Cuenta:</label>
          <select
            id="account"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            disabled={loading || accounts.length === 0}
          >
            {accounts.length === 0 ? (
              <option>No hay cuentas</option>
            ) : (
              accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type} - {acc.account_number} (S/. {parseFloat(acc.balance).toFixed(2)})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="amount" className="block text-gray-700 text-sm font-medium mb-2">Monto:</label>
          <input
            type="number"
            id="amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            placeholder="Ej: 100.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading || !selectedAccount}
          />
        </div>

        <button
          onClick={handleDeposit}
          className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition font-semibold text-lg shadow-md mb-3 flex justify-center items-center"
          disabled={loading || !selectedAccount || parseFloat(amount) <= 0}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z" />
            </svg>
          ) : (
            'RECAUDAR'
          )}
        </button>

        <button
          onClick={onGoBack}
          className="w-full bg-gray-300 text-gray-800 py-3 rounded-md hover:bg-gray-400 transition font-semibold text-lg shadow-sm"
          disabled={loading}
        >
          ← Volver
        </button>
      </div>
    </div>
  );
};

export default DepositScreen;