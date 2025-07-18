// Importa la clase Pool del módulo 'pg' para gestionar conexiones a PostgreSQL
const { Pool } = require('pg');

// Carga las variables de entorno desde el archivo .env (por ejemplo: DB_USER, DB_HOST, etc.)
require('dotenv').config();

// Crea una nueva instancia del pool de conexiones usando las variables del entorno
const pool = new Pool({
  user: process.env.DB_USER,       // Usuario de la base de datos
  host: process.env.DB_HOST,       // Host o IP del servidor de la base de datos
  database: process.env.DB_NAME,   // Nombre de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña del usuario de la base de datos
  port: process.env.DB_PORT,       // Puerto de conexión (por defecto PostgreSQL usa 5432)
});

// Maneja errores inesperados del cliente (por ejemplo, si la conexión se pierde o se corrompe)
pool.on('error', (err) => {
  console.error('Error inesperado en el cliente PostgreSQL', err);
  process.exit(-1); // Finaliza el proceso por seguridad para evitar comportamientos erráticos
});

// Exporta funciones reutilizables para consultar la base de datos
module.exports = {
  // Función para hacer consultas directas: db.query('SELECT * FROM tabla WHERE id = $1', [id])
  query: (text, params) => pool.query(text, params),

  // Función para obtener manualmente un cliente y hacer múltiples consultas (transacciones, etc.)
  // Ejemplo de uso avanzado: const client = await db.getClient();
  getClient: () => pool.connect(),
};
