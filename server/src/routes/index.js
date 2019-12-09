const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const modelsRoutes = require('./models.routes');
const assetRoutes = require('./assets.routes');
const objectRoutes = require('./object.routes');
const propertiesRoutes = require('./properties.routes');
const structureRoutes = require('./structure.routes');

router.use('/auth', authRoutes);


module.exports = router