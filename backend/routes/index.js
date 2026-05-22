const express = require('express');

const authRoutesCobranza = require('./authRoutesCobranza');
const collectionRoutes = require('./collectionRoutes');
const depositRoutes = require('./depositRoutes');
const movementRoutes = require('./movementRoutes');
const partnerRoutes = require('./partnerRoutes');

const router = express.Router();

router.use('/auth', authRoutesCobranza);
router.use('/', collectionRoutes);
router.use('/', depositRoutes);
router.use('/', movementRoutes);
router.use('/', partnerRoutes);

module.exports = router;
