// ===============================================
// CONTROLADOR DE AUTENTICACIÓN PARA COBRANZA
// ===============================================

// Importa la conexión a la base de datos PostgreSQL
const db = require('../config/db');

// Importa bcryptjs para encriptar contraseñas y compararlas de forma segura
const bcrypt = require('bcryptjs');

// Importa jsonwebtoken para generar tokens JWT al autenticar o registrar usuarios
const jwt = require('jsonwebtoken');

// Importa generateToken de utils
const generateToken = require('../utils/generateToken');

// ===============================================
// FUNCIÓN: Iniciar sesión del personal de cobranza
// ===============================================

// @desc    Autenticar usuario de cobranza y obtener token JWT
// @route   POST /api/cobranza/auth/login
// @access  Público
const loginUserCob = async (req, res) => {
    const { username, password } = req.body; // Credenciales enviadas desde el frontend

    try {
        // 1. Buscar al usuario en la tabla 'user_cob' por su nombre de usuario
        const userCobQuery = 'SELECT * FROM user_cob WHERE username = $1';
        const { rows } = await db.query(userCobQuery, [username]);
        const user = rows[0]; // Si existe, se asigna al objeto 'user'

        // 2. Validar si el usuario existe
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas para personal de cobranza.' });
        }

        // 3. Comparar la contraseña enviada con la almacenada (en hash)
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas para personal de cobranza.' });
        }

        // 4. Generar un token JWT válido por 1 hora
        const token = generateToken(user); 

        // 5. Enviar respuesta con el token y algunos datos del usuario
        res.status(200).json({
            message: 'Inicio de sesión de personal de cobranza exitoso',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                type: 'cobranza'
            },
        });

    } catch (error) {
        console.error('Error en el login de personal de cobranza:', error.message);
        res.status(500).json({ message: 'Error del servidor al intentar iniciar sesión para personal de cobranza.' });
    }
};


// ===============================================
// FUNCIÓN: Registrar nuevo cobrador (desarrollo)
// ===============================================

// @desc    Registrar un nuevo usuario de cobranza
// @route   POST /api/cobranza/auth/register
// @access  Público (solo durante desarrollo, restringir en producción)
const registerUserCob = async (req, res) => {
    // 1. Extraer datos del cuerpo de la solicitud
    const { username, password, phone_number } = req.body;

    // 2. Definir el rol por defecto (no se acepta desde el frontend)
    const defaultRole = 'cobrador';

    // 3. Validaciones básicas de campos obligatorios
    if (!username || !password) {
        return res.status(400).json({ message: 'Por favor, ingrese nombre de usuario y contraseña.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Validación opcional para número de celular (si se proporciona)
    if (phone_number && !/^\d{9}$/.test(phone_number)) {
        return res.status(400).json({ message: 'Ingrese un número de celular válido (9 dígitos) o déjelo vacío.' });
    }

    try {
        // 4. Verificar si el nombre de usuario ya existe
        const existingUser = await db.query('SELECT * FROM user_cob WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'El nombre de usuario ya está registrado.' });
        }

        // 5. Encriptar la contraseña usando bcrypt
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 6. Insertar el nuevo usuario en la base de datos
        const newUserQuery = `
            INSERT INTO user_cob (username, password_hash, phone_number, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, role;
        `;
        const { rows } = await db.query(newUserQuery, [
            username,
            password_hash,
            phone_number || null, // Si no se envía, se guarda como NULL
            defaultRole
        ]);
        const newUser = rows[0];

        // 7. Generar un token JWT para el nuevo usuario
        const token = generateToken(newUser);

        // 8. Devolver respuesta con token y datos del usuario
        res.status(201).json({
            message: 'Usuario de cobranza registrado exitosamente',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
                type: 'cobranza'
            },
        });

    } catch (error) {
        console.error('Error al registrar usuario de cobranza:', error.message);
        res.status(500).json({ message: 'Error del servidor al intentar registrar usuario de cobranza.' });
    }
};


// ===============================================
// Exportar funciones para usar en las rutas
// ===============================================
module.exports = {
    loginUserCob,
    registerUserCob
};
