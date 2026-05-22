const express = require('express');
const { getMovements } = require('../controllers/movementController');
const { protectCobranza } = require('../middleware/authMiddlewareCobranza');
const { generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/movements', generalLimiter, protectCobranza, getMovements);

module.exports = router;
