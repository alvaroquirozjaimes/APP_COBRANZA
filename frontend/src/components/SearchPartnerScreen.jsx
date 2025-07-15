import React, { useState, useEffect } from 'react';

// URL base de tu backend. Asegúrate de que coincida con el puerto de tu servidor Express.
// CAMBIO CLAVE: Añadir '/cobranza' a la URL base de la API.
const API_BASE_URL = 'http://localhost:5000/api/cobranza'; // <--- MODIFICADO AQUÍ

const SearchPartnerScreen = ({ onSelectPartner, onGoBack, authToken, authenticatedFetch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPartners = async () => {
      if (!authToken) {
        setError('No autorizado. Por favor, inicie sesión.');
        return;
      }

      setLoading(true);
      setError('');
      setPartners([]);

      try {
        // La URL ahora es correcta con el cambio en API_BASE_URL
        const response = await authenticatedFetch(`${API_BASE_URL}/partners?search=${searchTerm}`, { // <--- RUTA DE ACCESO ACTUALIZADA
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          setPartners(data);
        } else {
          setError(data.message || 'Error al cargar socios.');
        }
      } catch (err) {
        console.error('Error al obtener socios:', err);
        setError('No se pudo conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchPartners();
    }
  }, [searchTerm, authToken, authenticatedFetch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 sm:p-10 space-y-6 animate-fade-in">
        <h2 className="text-3xl font-extrabold text-center text-blue-900">🔍 Buscar Socio</h2>

        <div className="relative">
          <input
            type="text"
            className="w-full px-5 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400 text-lg shadow-sm"
            placeholder="Escribe el nombre o DNI del socio"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 21l-5.2-5.2M16.8 10.6a6.2 6.2 0 11-12.4 0 6.2 6.2 0 0112.4 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
            >
              ✖
            </button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center items-center text-blue-600 font-medium">
            <svg className="animate-spin h-6 w-6 mr-3 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z" />
            </svg>
            Buscando socios...
          </div>
        )}

        {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

        {!loading && partners.length === 0 && !error && (
          <p className="text-center text-gray-500">No se encontraron socios. Intenta otro término.</p>
        )}

        {partners.length > 0 && (
          <div className="space-y-4">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="border border-gray-200 p-5 rounded-xl shadow hover:shadow-lg transition-transform transform hover:scale-[1.01] bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-gray-800">
                    <p className="text-xl font-semibold">{partner.name}</p>
                    {partner.dni && <p className="text-sm text-gray-600">DNI: {partner.dni}</p>}
                    {partner.phone_number && <p className="text-sm text-gray-600">📱 {partner.phone_number}</p>}
                    {partner.address && <p className="text-sm text-gray-600">📍 {partner.address}</p>}
                  </div>
                  <button
                    onClick={() => onSelectPartner(partner)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 font-semibold transition shadow"
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onGoBack}
          className="w-full mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition shadow hover:shadow-md"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
};

export default SearchPartnerScreen;