const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Autenticar usuario de cobranza y obtener token
// @route   POST /api/cobranza/auth/login
// @access  Public
const loginUserCob = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Buscar el usuario de cobranza por username en la tabla user_cob
        const userCobQuery = 'SELECT * FROM user_cob WHERE username = $1';
        const { rows } = await db.query(userCobQuery, [username]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas para personal de cobranza.' });
        }

        // 2. Comparar la contraseña ingresada con el hash almacenado
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas para personal de cobranza.' });
        }

        // 3. Generar JWT para usuario de cobranza
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, type: 'cobranza' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 4. Enviar respuesta exitosa con el token
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

// @desc    Registrar un nuevo usuario de cobranza (considerar restringir acceso en producción)
// @route   POST /api/cobranza/auth/register
// @access  Public (para desarrollo, Private/Admin en producción)
const registerUserCob = async (req, res) => {
    // 1. Desestructurar solo los campos que vienen del frontend
    const { username, password, phone_number } = req.body; // <--- 'role' eliminado de aquí

    // 2. Definir el rol por defecto en el backend
    const defaultRole = 'cobrador'; // <--- Rol por defecto asignado

    // 3. Validaciones básicas de campos obligatorios (sin incluir el rol, ya que es por defecto)
    if (!username || !password) { // <--- Validación de rol eliminada
        return res.status(400).json({ message: 'Por favor, ingrese nombre de usuario y contraseña.' }); // <--- Mensaje de error actualizado
    }

    // Validación de longitud de contraseña (ejemplo)
    if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Validación de formato de número de celular (ejemplo: 9 dígitos)
    // Asumiendo que phone_number es opcional o validado en frontend.
    // Si es obligatorio, lo puedes añadir a la validación de arriba: if (!username || !password || !phone_number)
    if (phone_number && !/^\d{9}$/.test(phone_number)) {
        return res.status(400).json({ message: 'Ingrese un número de celular válido (9 dígitos) o déjelo vacío.' });
    }


    try {
        // Verificar si el usuario de cobranza ya existe
        const existingUser = await db.query('SELECT * FROM user_cob WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'El nombre de usuario ya está registrado.' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insertar el nuevo usuario en user_cob con el rol por defecto
        const newUserQuery = `
            INSERT INTO user_cob (username, password_hash, phone_number, role)
            VALUES ($1, $2, $3, $4) RETURNING id, username, role;
        `;
        // <--- Pasamos defaultRole en lugar de 'role' del req.body
        const { rows } = await db.query(newUserQuery, [username, password_hash, phone_number || null, defaultRole]);
        const newUser = rows[0];

        // Generar JWT para el nuevo usuario de cobranza
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role, type: 'cobranza' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

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

module.exports = {
    loginUserCob,
    registerUserCob
};