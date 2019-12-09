const express = require('express');
const router = express.Router();

const models = require('../controllers/models.controller');
const modelsCtrl = new models.ModelsController();

router.get('/get/all', modelsCtrl.getAllModels.bind(modelsCtrl));
router.get('/get/name/:name', modelsCtrl.getModel);
router.get('/get/urn/:urn/thumbnail', modelsCtrl.getModelThumbail);

module.exports = router