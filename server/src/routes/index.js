const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const modelsRoutes = require('./models.routes');
const objectsRoutes = require('./objects.routes');
const alignmentsRoutes = require('./alignments.routes');
const designAutomationRoutes = require('./da.routes');

router.use('/auth', authRoutes);
router.use('/models', modelsRoutes);
router.use('/objects', objectsRoutes);
router.use('/alignments', alignmentsRoutes);
router.use('/da', designAutomationRoutes);

module.exports = router