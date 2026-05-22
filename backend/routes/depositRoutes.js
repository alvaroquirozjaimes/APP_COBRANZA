const express = require('express');
const { createDeposit } = require('../controllers/depositController');
const { protectCobranza } = require('../middleware/authMiddlewareCobranza');
const { writeLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/deposits', writeLimiter, protectCobranza, createDeposit);

module.exports = router;
