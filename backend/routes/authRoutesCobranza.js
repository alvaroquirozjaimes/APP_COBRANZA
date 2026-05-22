const express = require('express');
const { loginUserCob, registerUserCob } = require('../controllers/authControllerCobranza');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login', authLimiter, loginUserCob);
router.post('/register', authLimiter, registerUserCob);

module.exports = router;
