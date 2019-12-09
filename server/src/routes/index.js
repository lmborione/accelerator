const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const modelsRoutes = require('./models.routes');
const objectsRoutes = require('./objects.routes');

router.use('/auth', authRoutes);
router.use('/models', modelsRoutes);
router.use('/objects', objectsRoutes);

module.exports = router