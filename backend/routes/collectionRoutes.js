const express = require('express');
const { getCollectionSummary } = require('../controllers/collectionController');
const { protectCobranza } = require('../middleware/authMiddlewareCobranza');
const { generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/summary', generalLimiter, protectCobranza, getCollectionSummary);

module.exports = router;
