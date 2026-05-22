const express = require('express');
const { getPartners, getPartnerAccounts } = require('../controllers/partnerController');
const { protectCobranza } = require('../middleware/authMiddlewareCobranza');
const { generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/partners', generalLimiter, protectCobranza, getPartners);
router.get('/partners/:id/accounts', generalLimiter, protectCobranza, getPartnerAccounts);

module.exports = router;
