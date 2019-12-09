const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const modelsRoutes = require('./models.routes');

router.use('/auth', authRoutes);
router.use('/models', modelsRoutes);

module.exports = router